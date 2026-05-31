import base64

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from converter import convert_image

app = FastAPI(title="Dev Hube Image Converter Worker", version="1.0.0")
MAX_BYTES = 15 * 1024 * 1024

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "image-converter"


class ConvertResponse(BaseModel):
    image_base64: str
    format: str
    bytes: int


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


@app.post("/convert", response_model=ConvertResponse)
async def convert(
    file: UploadFile = File(...),
    format: str = Form("webp"),
) -> ConvertResponse:
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 15 MB")

    try:
        converted, ext = convert_image(raw, format)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Image conversion failed") from exc

    mime = "image/jpeg" if ext == "jpg" else f"image/{ext}"
    return ConvertResponse(
        image_base64=base64.b64encode(converted).decode("ascii"),
        format=ext,
        bytes=len(converted),
    )
