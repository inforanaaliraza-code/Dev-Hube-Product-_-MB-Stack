from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ocr import extract_text_from_image, ocr_ready

MAX_BYTES = 15 * 1024 * 1024


@asynccontextmanager
async def lifespan(app: FastAPI):
    ready, err = ocr_ready()
    if not ready:
        print(f"[image-to-text] OCR warmup skipped: {err}")
    yield


app = FastAPI(title="Dev Hube Image to Text Worker", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "image-to-text"
    ocr_ready: bool = False
    detail: str | None = None


class OcrResponse(BaseModel):
    text: str
    line_count: int
    char_count: int


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    ready, err = ocr_ready()
    return HealthResponse(
        status="ok" if ready else "degraded",
        ocr_ready=ready,
        detail=err,
    )


@app.post("/extract", response_model=OcrResponse)
async def extract(file: UploadFile = File(...)) -> OcrResponse:
    ready, err = ocr_ready()
    if not ready:
        raise HTTPException(
            status_code=503,
            detail=err or "OCR engine not ready. Run: pip install -r requirements.txt in Services/image-to-text",
        )

    allowed = ("image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp", "application/octet-stream")
    if file.content_type not in allowed:
        name = (file.filename or "").lower()
        if not name.endswith((".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp")):
            raise HTTPException(status_code=400, detail="Unsupported image type")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 15 MB limit")

    try:
        text, line_count = extract_text_from_image(raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OCR failed: {exc}") from exc

    return OcrResponse(text=text, line_count=line_count, char_count=len(text))
