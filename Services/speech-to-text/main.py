from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from transcriber import transcribe_audio

app = FastAPI(title="Dev Hube Speech to Text Worker", version="1.0.0")
MAX_BYTES = 25 * 1024 * 1024

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "speech-to-text"


class Segment(BaseModel):
    start: float
    end: float
    text: str


class TranscribeResponse(BaseModel):
    text: str
    segments: list[Segment]
    duration_seconds: float
    language: str


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(file: UploadFile = File(...)) -> TranscribeResponse:
    name = file.filename or "audio.wav"
    lower = name.lower()
    if not lower.endswith((".wav", ".mp3", ".m4a", ".webm", ".ogg", ".flac")):
        raise HTTPException(status_code=400, detail="Unsupported audio format")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 25 MB limit")

    try:
        text, segments, duration, language = transcribe_audio(raw, name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Transcription failed") from exc

    return TranscribeResponse(
        text=text,
        segments=[Segment(**segment) for segment in segments],
        duration_seconds=duration,
        language=language,
    )
