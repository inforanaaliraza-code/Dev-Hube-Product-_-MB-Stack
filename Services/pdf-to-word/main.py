import base64

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from converter import convert_pdf_to_docx

app = FastAPI(title="Dev Hube PDF to Word Worker", version="1.0.0")
MAX_BYTES = 25 * 1024 * 1024

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str = "ok"


class ConvertResponse(BaseModel):
    docx_base64: str
    original_bytes: int
    docx_bytes: int
    page_count: int
    converted_pages: int
    filename: str


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


@app.post("/convert", response_model=ConvertResponse)
async def convert(
    file: UploadFile = File(...),
    start_page: int | None = Form(None),
    end_page: int | None = Form(None),
) -> ConvertResponse:
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 25 MB limit")

    try:
        docx_bytes, page_count, converted_pages = convert_pdf_to_docx(
            raw,
            start_page=start_page,
            end_page=end_page,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="PDF conversion failed") from exc

    base_name = (file.filename or "document").rsplit(".", 1)[0]
    return ConvertResponse(
        docx_base64=base64.b64encode(docx_bytes).decode("ascii"),
        original_bytes=len(raw),
        docx_bytes=len(docx_bytes),
        page_count=page_count,
        converted_pages=converted_pages,
        filename=f"{base_name}.docx",
    )
