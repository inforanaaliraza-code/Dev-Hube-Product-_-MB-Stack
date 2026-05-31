import base64

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from merger import merge_pdf_bytes

app = FastAPI(title="Dev Hube Merge PDF Worker", version="1.0.0")
MAX_FILES = 20
MAX_FILE_BYTES = 25 * 1024 * 1024
MAX_TOTAL_BYTES = 100 * 1024 * 1024

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "merge-pdf"


class SourceInfo(BaseModel):
    name: str
    pages: int


class MergeResponse(BaseModel):
    pdf_base64: str
    filename: str
    file_count: int
    total_pages: int
    total_bytes: int
    sources: list[SourceInfo]


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


@app.post("/merge", response_model=MergeResponse)
async def merge(files: list[UploadFile] = File(...)) -> MergeResponse:
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Upload at least two PDF files")
    if len(files) > MAX_FILES:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_FILES} files allowed")

    payloads: list[tuple[str, bytes]] = []
    total_in = 0

    for upload in files:
        name = upload.filename or "document.pdf"
        if not name.lower().endswith(".pdf") and upload.content_type not in (
            "application/pdf",
            "application/octet-stream",
        ):
            raise HTTPException(status_code=400, detail=f"Only PDF files allowed: {name}")

        raw = await upload.read()
        if not raw:
            raise HTTPException(status_code=400, detail=f"Empty file: {name}")
        if len(raw) > MAX_FILE_BYTES:
            raise HTTPException(status_code=400, detail=f"File exceeds 25 MB: {name}")

        total_in += len(raw)
        if total_in > MAX_TOTAL_BYTES:
            raise HTTPException(status_code=400, detail="Total upload exceeds 100 MB")

        payloads.append((name, raw))

    try:
        merged, total_pages, sources = merge_pdf_bytes(payloads)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="PDF merge failed") from exc

    base_name = payloads[0][0].rsplit(".", 1)[0]
    return MergeResponse(
        pdf_base64=base64.b64encode(merged).decode("ascii"),
        filename=f"{base_name}-merged.pdf",
        file_count=len(payloads),
        total_pages=total_pages,
        total_bytes=len(merged),
        sources=[SourceInfo(name=s["name"], pages=s["pages"]) for s in sources],
    )
