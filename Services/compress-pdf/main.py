import base64

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from compressor import compress_pdf_bytes

app = FastAPI(title="Dev Hube Compress PDF Worker", version="1.0.0")
MAX_BYTES = 25 * 1024 * 1024

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "compress-pdf"


class CompressResponse(BaseModel):
    pdf_base64: str
    filename: str
    original_bytes: int
    compressed_bytes: int
    saved_bytes: int
    saved_percent: float
    level: str


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


@app.post("/compress", response_model=CompressResponse)
async def compress(
    file: UploadFile = File(...),
    level: str = Form("medium"),
) -> CompressResponse:
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 25 MB limit")

    compress_level = (level or "medium").strip().lower()
    if compress_level not in ("low", "medium", "high"):
        raise HTTPException(status_code=400, detail="level must be low, medium, or high")

    try:
        compressed, original_bytes, compressed_bytes = compress_pdf_bytes(raw, compress_level)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="PDF compression failed") from exc

    saved = max(0, original_bytes - compressed_bytes)
    saved_percent = round((saved / original_bytes) * 100, 2) if original_bytes else 0.0
    base_name = (file.filename or "document").rsplit(".", 1)[0]

    return CompressResponse(
        pdf_base64=base64.b64encode(compressed).decode("ascii"),
        filename=f"{base_name}-compressed.pdf",
        original_bytes=original_bytes,
        compressed_bytes=compressed_bytes,
        saved_bytes=saved,
        saved_percent=saved_percent,
        level=compress_level,
    )
