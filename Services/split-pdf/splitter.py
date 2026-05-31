import io
import zipfile

from pypdf import PdfReader, PdfWriter

MAX_EACH_PAGES = 150


def _read_pdf(data: bytes, label: str) -> PdfReader:
    if not data:
        raise ValueError("empty PDF file")
    try:
        reader = PdfReader(io.BytesIO(data))
    except Exception as exc:
        raise ValueError(f"invalid or encrypted PDF: {label}") from exc
    if len(reader.pages) < 1:
        raise ValueError("PDF has no pages")
    return reader


def pdf_page_count(data: bytes) -> int:
    reader = _read_pdf(data, "document")
    return len(reader.pages)


def split_pdf_range(
    data: bytes,
    start_page: int,
    end_page: int | None,
) -> tuple[bytes, int, int, int, int]:
    reader = _read_pdf(data, "document")
    total = len(reader.pages)
    start = start_page
    end = end_page if end_page is not None else total

    if start < 1 or start > total:
        raise ValueError(f"start page must be between 1 and {total}")
    if end < start or end > total:
        raise ValueError(f"end page must be between {start} and {total}")

    writer = PdfWriter()
    for index in range(start - 1, end):
        writer.add_page(reader.pages[index])

    buffer = io.BytesIO()
    writer.write(buffer)
    merged = buffer.getvalue()
    if not merged:
        raise ValueError("split produced empty PDF")

    split_count = end - start + 1
    return merged, total, split_count, start, end


def split_pdf_each(data: bytes) -> tuple[bytes, int, int]:
    reader = _read_pdf(data, "document")
    total = len(reader.pages)
    if total > MAX_EACH_PAGES:
        raise ValueError(f"maximum {MAX_EACH_PAGES} pages for per-page split")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for index, page in enumerate(reader.pages, start=1):
            writer = PdfWriter()
            writer.add_page(page)
            part_buffer = io.BytesIO()
            writer.write(part_buffer)
            part_bytes = part_buffer.getvalue()
            if not part_bytes:
                raise ValueError(f"failed to extract page {index}")
            archive.writestr(f"page-{index:03d}.pdf", part_bytes)

    zipped = zip_buffer.getvalue()
    if not zipped:
        raise ValueError("zip archive is empty")

    return zipped, total, total
