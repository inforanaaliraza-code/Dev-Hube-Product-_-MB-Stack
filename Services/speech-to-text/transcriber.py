import os
import tempfile

from faster_whisper import WhisperModel

_model: WhisperModel | None = None
MODEL_SIZE = os.getenv("WHISPER_MODEL", "tiny")


def _get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
    return _model


def transcribe_audio(data: bytes, filename: str) -> tuple[str, list[dict], float, str]:
    if not data:
        raise ValueError("empty audio file")

    suffix = ".wav"
    lower = filename.lower()
    for ext in (".mp3", ".wav", ".m4a", ".webm", ".ogg", ".flac"):
        if lower.endswith(ext):
            suffix = ext
            break

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(data)
        temp_path = tmp.name

    try:
        model = _get_model()
        segments, info = model.transcribe(temp_path, beam_size=1)
        parts: list[dict] = []
        texts: list[str] = []
        for segment in segments:
            text = segment.text.strip()
            if not text:
                continue
            parts.append(
                {
                    "start": round(segment.start, 2),
                    "end": round(segment.end, 2),
                    "text": text,
                }
            )
            texts.append(text)
        full_text = " ".join(texts).strip()
        return full_text, parts, float(info.duration or 0), str(info.language or "unknown")
    except Exception as exc:
        raise ValueError("audio transcription failed; ensure ffmpeg is installed for mp3/m4a") from exc
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass
