import io

import fitz


def compress_pdf_bytes(data: bytes, level: str) -> tuple[bytes, int, int]:
    if not data:
        raise ValueError("empty PDF file")

    garbage = 4
    if level == "low":
        garbage = 2
    elif level == "high":
        garbage = 4

    try:
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise ValueError("invalid or encrypted PDF") from exc

    if doc.page_count < 1:
        doc.close()
        raise ValueError("PDF has no pages")

    output = io.BytesIO()
    try:
        doc.save(
            output,
            garbage=garbage,
            deflate=True,
            clean=True,
            pretty=False,
        )
    finally:
        doc.close()

    compressed = output.getvalue()
    if not compressed:
        raise ValueError("compression produced empty PDF")

    return compressed, len(data), len(compressed)
