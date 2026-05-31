import io

from pypdf import PdfReader, PdfWriter


def merge_pdf_bytes(files: list[tuple[str, bytes]]) -> tuple[bytes, int, list[dict]]:
    if len(files) < 2:
        raise ValueError("at least two PDF files are required")

    writer = PdfWriter()
    sources: list[dict] = []
    total_pages = 0

    for name, data in files:
        if not data:
            raise ValueError(f"empty file: {name}")
        try:
            reader = PdfReader(io.BytesIO(data))
        except Exception as exc:
            raise ValueError(f"invalid or encrypted PDF: {name}") from exc

        page_count = len(reader.pages)
        if page_count < 1:
            raise ValueError(f"PDF has no pages: {name}")

        for page in reader.pages:
            writer.add_page(page)

        total_pages += page_count
        sources.append({"name": name, "pages": page_count})

    buffer = io.BytesIO()
    writer.write(buffer)
    merged = buffer.getvalue()
    if not merged:
        raise ValueError("merge produced empty PDF")

    return merged, total_pages, sources
