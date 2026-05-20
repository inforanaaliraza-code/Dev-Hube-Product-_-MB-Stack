from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from compressor import ALLOWED_INPUT, compress_image_bytes

app = FastAPI(title="Dev Hube Image Compressor Worker", version="1.0.0")
MAX_BYTES = 15 * 1024 * 1024

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "image-compressor"


class CompressResponse(BaseModel):
    mime_type: str
    file_base64: str
    original_bytes: int
    compressed_bytes: int
    savings_percent: float
    width: int
    height: int
    output_format: str


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


@app.post("/compress", response_model=CompressResponse)
async def compress(
    file: UploadFile = File(...),
    quality: int = Form(82),
    max_width: int | None = Form(None),
    max_height: int | None = Form(None),
    output_format: str = Form("auto"),
    strip_metadata: bool = Form(True),
) -> CompressResponse:
    if not file.content_type or file.content_type not in ALLOWED_INPUT:
        raise HTTPException(status_code=400, detail="Only PNG, JPG and WebP are supported")
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 15 MB limit")

    try:
        compressed, mime, width, height = compress_image_bytes(
            raw,
            content_type=file.content_type,
            quality=quality,
            max_width=max_width,
            max_height=max_height,
            output_format=output_format,
            strip_metadata=strip_metadata,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    import base64

    original_bytes = len(raw)
    compressed_bytes = len(compressed)
    savings = 0.0
    if original_bytes > 0:
        savings = round((1 - compressed_bytes / original_bytes) * 100, 2)
        savings = max(0.0, savings)

    ext = mime.split("/")[-1]
    if ext == "jpeg":
        ext = "jpg"

    return CompressResponse(
        mime_type=mime,
        file_base64=base64.b64encode(compressed).decode("ascii"),
        original_bytes=original_bytes,
        compressed_bytes=compressed_bytes,
        savings_percent=savings,
        width=width,
        height=height,
        output_format=ext,
    )
