import base64
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from splitter import pdf_page_count, split_pdf_each, split_pdf_range

app = FastAPI(title="Dev Hube Split PDF Worker", version="1.0.0")
MAX_BYTES = 25 * 1024 * 1024

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "split-pdf"


class RangeSplitResponse(BaseModel):
    mode: Literal["range"] = "range"
    pdf_base64: str
    filename: str
    page_count: int
    split_pages: int
    start_page: int
    end_page: int
    output_bytes: int


class InspectResponse(BaseModel):
    page_count: int


class EachSplitResponse(BaseModel):
    mode: Literal["each"] = "each"
    zip_base64: str
    filename: str
    page_count: int
    file_count: int
    output_bytes: int


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


@app.post("/inspect", response_model=InspectResponse)
async def inspect(file: UploadFile = File(...)) -> InspectResponse:
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 25 MB limit")
    try:
        return InspectResponse(page_count=pdf_page_count(raw))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/split")
async def split(
    file: UploadFile = File(...),
    mode: str = Form("range"),
    start_page: int | None = Form(None),
    end_page: int | None = Form(None),
) -> RangeSplitResponse | EachSplitResponse:
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 25 MB limit")

    base_name = (file.filename or "document").rsplit(".", 1)[0]
    split_mode = (mode or "range").strip().lower()

    try:
        if split_mode == "each":
            zipped, page_count, file_count = split_pdf_each(raw)
            return EachSplitResponse(
                zip_base64=base64.b64encode(zipped).decode("ascii"),
                filename=f"{base_name}-pages.zip",
                page_count=page_count,
                file_count=file_count,
                output_bytes=len(zipped),
            )

        if split_mode != "range":
            raise HTTPException(status_code=400, detail="mode must be range or each")

        if start_page is None or start_page < 1:
            raise HTTPException(status_code=400, detail="start_page is required for range mode")

        pdf_bytes, page_count, split_pages, start, end = split_pdf_range(
            raw,
            start_page,
            end_page,
        )
        return RangeSplitResponse(
            pdf_base64=base64.b64encode(pdf_bytes).decode("ascii"),
            filename=f"{base_name}-pages-{start}-{end}.pdf",
            page_count=page_count,
            split_pages=split_pages,
            start_page=start,
            end_page=end,
            output_bytes=len(pdf_bytes),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="PDF split failed") from exc
