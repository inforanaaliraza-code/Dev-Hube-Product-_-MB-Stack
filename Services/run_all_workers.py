#!/usr/bin/env python3
import json
import os
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / "workers.manifest.json"
PID_DIR = ROOT / ".worker-pids"

PYTHON_CANDIDATES: tuple[list[str], ...] = (
    ["py", "-3.12"],
    ["py", "-3.11"],
    ["py", "-3"],
    ["python"],
    ["python3"],
)


def load_workers():
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    return data["workers"]


def venv_python(service_dir: Path) -> Path:
    if sys.platform == "win32":
        return service_dir / ".venv" / "Scripts" / "python.exe"
    return service_dir / ".venv" / "bin" / "python"


def python_version(parts: list[str]) -> tuple[int, int] | None:
    try:
        r = subprocess.run(
            [*parts, "-c", "import sys; print(sys.version_info[0], sys.version_info[1])"],
            capture_output=True,
            text=True,
            check=True,
        )
        major, minor = r.stdout.strip().split()
        return int(major), int(minor)
    except Exception:
        return None


def pick_host_python(max_minor: int = 99) -> list[str] | None:
    for parts in PYTHON_CANDIDATES:
        ver = python_version(parts)
        if ver and ver[0] == 3 and ver[1] <= max_minor:
            return parts
    ver = python_version([sys.executable])
    if ver and ver[0] == 3 and ver[1] <= max_minor:
        return [sys.executable]
    return None


def ensure_ready(worker: dict, install: bool) -> Path | None:
    service_dir = ROOT / worker["dir"]
    req = service_dir / "requirements.txt"
    if not req.is_file():
        print(f"  SKIP {worker['id']}: missing requirements.txt")
        return None

    py = venv_python(service_dir)
    if py.is_file() and not install:
        return py

    max_minor = int(worker.get("python_max_minor", 99))
    host_py = pick_host_python(max_minor)
    if not host_py:
        if worker["id"] == "image-to-text":
            print(
                f"  SKIP {worker['id']}: needs Python 3.11 or 3.12 "
                f"(py -3.12). Python 3.14 cannot install OCR packages.",
            )
        else:
            print(f"  SKIP {worker['id']}: no Python 3 found on PATH")
        return None

    if install or not py.is_file():
        try:
            if py.is_file():
                import shutil

                shutil.rmtree(service_dir / ".venv", ignore_errors=True)
            subprocess.run(
                [*host_py, "-m", "venv", str(service_dir / ".venv")],
                cwd=service_dir,
                check=True,
            )
            py = venv_python(service_dir)
            subprocess.run(
                [str(py), "-m", "pip", "install", "-q", "--upgrade", "pip"],
                cwd=service_dir,
                check=True,
            )
            subprocess.run(
                [str(py), "-m", "pip", "install", "-q", "-r", "requirements.txt"],
                cwd=service_dir,
                check=True,
            )
        except subprocess.CalledProcessError:
            print(f"  SKIP {worker['id']}: pip install failed — see errors above")
            return None
    return py


def stream_logs(proc: subprocess.Popen, name: str) -> None:
    if proc.stdout is None:
        return
    for line in proc.stdout:
        sys.stdout.write(f"[{name}] {line}")
        sys.stdout.flush()


def stop_all() -> int:
    if not PID_DIR.is_dir():
        print("No workers pid folder.")
        return 0
    stopped = 0
    for pid_file in PID_DIR.glob("*.pid"):
        try:
            pid = int(pid_file.read_text(encoding="utf-8").strip())
            if sys.platform == "win32":
                subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], capture_output=True)
            else:
                os.kill(pid, signal.SIGTERM)
            stopped += 1
            print(f"Stopped {pid_file.stem} (pid {pid})")
        except Exception as err:
            print(f"Could not stop {pid_file.name}: {err}")
        pid_file.unlink(missing_ok=True)
    return 0


def health_check(workers: list) -> None:
    import urllib.request

    print("\nHealth check:")
    for w in workers:
        url = f"http://127.0.0.1:{w['port']}/health"
        timeout = 90 if w["id"] == "image-to-text" else 8
        try:
            with urllib.request.urlopen(url, timeout=timeout) as res:
                ok = 200 <= res.status < 300
                try:
                    body = json.loads(res.read().decode("utf-8"))
                except Exception:
                    body = {}
                if w["id"] == "image-to-text":
                    ok = ok and body.get("ocr_ready") is True
                    if not ok:
                        detail = body.get("detail") or "ocr not ready (first run downloads models)"
                        print(f"  {w['id']:18} :{w['port']}  FAIL ({detail})")
                        continue
                print(f"  {w['id']:18} :{w['port']}  {'OK' if ok else 'FAIL'}")
        except Exception as err:
            print(f"  {w['id']:18} :{w['port']}  FAIL ({err})")


def main() -> int:
    if "--stop" in sys.argv:
        return stop_all()

    install = "--install" in sys.argv
    no_reload = "--no-reload" in sys.argv
    skip_health = "--no-health" in sys.argv

    host = pick_host_python(99)
    if host:
        ver = python_version(host)
        print(f"Host Python for venvs: {ver[0]}.{ver[1]} ({' '.join(host)})")
        if ver and ver[1] >= 14:
            print("Note: image-to-text needs Python 3.12 (py -3.12); other workers use 3.14.")
    else:
        print("WARNING: No Python 3 found on PATH.")

    workers = load_workers()
    PID_DIR.mkdir(exist_ok=True)
    for f in PID_DIR.glob("*.pid"):
        f.unlink(missing_ok=True)

    procs: list[tuple[dict, subprocess.Popen]] = []
    threads: list[threading.Thread] = []
    started_workers: list[dict] = []

    print(f"\nStarting workers from {ROOT}\n")

    for w in workers:
        service_dir = ROOT / w["dir"]
        py = ensure_ready(w, install)
        if py is None:
            continue
        cmd = [
            str(py),
            "-m",
            "uvicorn",
            "main:app",
            "--host",
            "127.0.0.1",
            "--port",
            str(w["port"]),
        ]
        if not no_reload:
            cmd.append("--reload")
        env = os.environ.copy()
        if w["id"] == "ai-assistant":
            env.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
            env.setdefault("TOKENIZERS_PARALLELISM", "false")
        proc = subprocess.Popen(
            cmd,
            cwd=service_dir,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            errors="replace",
        )
        (PID_DIR / f"{w['id']}.pid").write_text(str(proc.pid), encoding="utf-8")
        procs.append((w, proc))
        started_workers.append(w)
        t = threading.Thread(target=stream_logs, args=(proc, w["id"]), daemon=True)
        t.start()
        threads.append(t)
        print(f"  {w['id']:18} http://127.0.0.1:{w['port']}  (pid {proc.pid})")
        time.sleep(0.5)
        if proc.poll() is not None:
            print(f"  WARNING: {w['id']} exited immediately (code {proc.returncode}). Check log above.")

    if not started_workers:
        print("\nNo workers started. Install Python and ensure `python` is on PATH.")
        print("  https://www.python.org/downloads/")
        return 1

    if not skip_health:
        time.sleep(3)
        health_check(started_workers)

    print(f"\n{len(started_workers)} worker(s) running. Ctrl+C to stop all.\n")

    def shutdown(*_args):
        for w, proc in procs:
            if proc.poll() is None:
                if sys.platform == "win32":
                    subprocess.run(["taskkill", "/PID", str(proc.pid), "/T", "/F"], capture_output=True)
                else:
                    proc.terminate()
        stop_all()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, shutdown)

    try:
        while True:
            alive = [p for _, p in procs if p.poll() is None]
            if not alive:
                print("All workers exited.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        shutdown()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
