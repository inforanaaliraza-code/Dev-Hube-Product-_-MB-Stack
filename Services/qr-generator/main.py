import base64

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from qr_renderer import ErrorLevel, generate_qr_png

app = FastAPI(title="Dev Hube QR Generator Worker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    data: str = Field(min_length=1, max_length=4096)
    foreground: str = "#000000"
    background: str = "#ffffff"
    size_px: int = Field(default=512, ge=128, le=2048)
    error_correction: ErrorLevel = "H"
    logo_base64: str | None = None
    logo_scale: float = Field(default=0.22, ge=0.12, le=0.3)


class GenerateResponse(BaseModel):
    png_base64: str
    width: int
    height: int


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "qr-generator"


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


@app.post("/generate", response_model=GenerateResponse)
def generate(body: GenerateRequest) -> GenerateResponse:
    try:
        png = generate_qr_png(
            body.data,
            foreground=body.foreground,
            background=body.background,
            size_px=body.size_px,
            error_correction=body.error_correction,
            logo_base64=body.logo_base64,
            logo_scale=body.logo_scale,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    encoded = base64.b64encode(png).decode("ascii")
    return GenerateResponse(png_base64=encoded, width=body.size_px, height=body.size_px)
