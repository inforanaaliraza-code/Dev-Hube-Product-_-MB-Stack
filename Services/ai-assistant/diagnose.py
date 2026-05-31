import json
import os
import sys
from pathlib import Path

import httpx
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent.parent
ENV_PATH = ROOT / "Backend" / ".env"
WORKER = "http://127.0.0.1:8107"
BACKEND = os.getenv("API_BASE", "http://127.0.0.1:4000/api/v1")


def ok(label: str, detail: str = "") -> None:
    print(f"[PASS] {label}" + (f" — {detail}" if detail else ""))


def fail(label: str, detail: str = "") -> None:
    print(f"[FAIL] {label}" + (f" — {detail}" if detail else ""))


def main() -> int:
    print("Dev Hube — AI assistant diagnose\n")
    if not ENV_PATH.is_file():
        fail(".env missing", str(ENV_PATH))
        return 1
    load_dotenv(ENV_PATH)
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from llm import resolve_provider

    provider = resolve_provider()
    key = (
        os.getenv("AI_GEMINI_API_KEY", "").strip().strip("\ufeff")
        or os.getenv("AI_API_KEY", "").strip().strip("\ufeff")
    )
    print(f"  .env: {ENV_PATH}")
    print(f"  resolved provider={provider}")
    print(f"  API key length={len(key)} prefix={key[:8] + '...' if len(key) > 10 else '(empty)'}\n")

    if not key:
        fail("API key empty in Backend/.env")
        return 1

    print(f"1) Direct {provider} API")
    try:
        with httpx.Client(timeout=60.0) as client:
            if provider == "gemini":
                gmodel = os.getenv("AI_GEMINI_MODEL", "gemini-2.0-flash").strip()
                gbase = os.getenv(
                    "AI_GEMINI_BASE",
                    "https://generativelanguage.googleapis.com/v1beta",
                ).rstrip("/")
                res = client.post(
                    f"{gbase}/models/{gmodel}:generateContent",
                    params={"key": key},
                    json={
                        "contents": [
                            {"role": "user", "parts": [{"text": "Reply with exactly: OK"}]}
                        ],
                        "generationConfig": {"maxOutputTokens": 16},
                    },
                    headers={"Content-Type": "application/json"},
                )
                if res.is_success:
                    data = res.json()
                    parts = (
                        (data.get("candidates") or [{}])[0]
                        .get("content", {})
                        .get("parts", [])
                    )
                    text = " ".join(
                        str(p.get("text", "")) for p in parts if isinstance(p, dict)
                    )
                    ok("Gemini API", text.strip()[:80] or "(empty body)")
                else:
                    try:
                        err = res.json().get("error", {})
                        msg = err.get("message", res.text[:300])
                    except Exception:
                        msg = res.text[:300]
                    fail("Gemini API", f"HTTP {res.status_code}: {msg}")
            else:
                model = os.getenv("AI_MODEL", "gpt-4o-mini").strip()
                base = os.getenv("AI_API_BASE", "https://api.openai.com/v1").rstrip("/")
                res = client.post(
                    f"{base}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": "Reply with exactly: OK"}],
                        "max_tokens": 16,
                    },
                )
                if res.is_success:
                    data = res.json()
                    text = (
                        (data.get("choices") or [{}])[0]
                        .get("message", {})
                        .get("content", "")
                    )
                    ok("OpenAI API", text.strip()[:80] or "(empty body)")
                else:
                    try:
                        err = res.json().get("error", {})
                        msg = err.get("message", res.text[:300])
                        code = err.get("code") or err.get("type", "")
                    except Exception:
                        msg = res.text[:300]
                        code = ""
                    fail("OpenAI API", f"HTTP {res.status_code}: {msg} {code}".strip())
    except Exception as exc:
        fail(f"{provider} API", str(exc))
        print("     → Internet / firewall / VPN check karo")

    print("\n2) Worker GET /health")
    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.get(f"{WORKER}/health")
        body = res.json() if res.is_success else {}
        if res.is_success and body.get("service") == "ai-assistant":
            ok(
                "Worker health",
                f"provider={body.get('provider')} configured={body.get('configured')}",
            )
        else:
            fail("Worker health", f"HTTP {res.status_code} {body}")
    except Exception as exc:
        fail("Worker health", f"{exc} — start start-all-workers.bat")

    print("\n3) Worker POST /generate/code")
    try:
        with httpx.Client(timeout=120.0) as client:
            res = client.post(
                f"{WORKER}/generate/code",
                json={
                    "prompt": "function sum(a,b){ return a+b }",
                    "language": "javascript",
                },
            )
        if res.is_success:
            data = res.json()
            snippet = (data.get("code") or "")[:120].replace("\n", " ")
            ok("Worker generate", snippet or "(empty code)")
        else:
            try:
                detail = res.json().get("detail", res.text[:300])
            except Exception:
                detail = res.text[:300]
            fail("Worker generate", f"HTTP {res.status_code}: {detail}")
    except Exception as exc:
        fail("Worker generate", str(exc))

    print("\n4) Backend POST /ai-code-generator/generate")
    try:
        with httpx.Client(timeout=120.0) as client:
            res = client.post(
                f"{BACKEND}/ai-code-generator/generate",
                json={
                    "prompt": "function sum(a,b){ return a+b }",
                    "language": "javascript",
                },
            )
        if res.is_success:
            data = res.json()
            snippet = (data.get("code") or "")[:120].replace("\n", " ")
            ok("Backend generate", snippet or "(empty code)")
        else:
            try:
                raw = res.json()
                msg = raw.get("message", raw)
                if isinstance(msg, list):
                    msg = ", ".join(msg)
            except Exception:
                msg = res.text[:400]
            fail("Backend generate", f"HTTP {res.status_code}: {msg}")
    except Exception as exc:
        fail("Backend generate", f"{exc} — pnpm start:dev chalao port 4000")

    print("\nDone. Sab [PASS] hon to browser se Generate try karo.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
