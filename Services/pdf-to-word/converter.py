import os
import tempfile

import fitz
from pdf2docx import Converter


def get_pdf_page_count(data: bytes) -> int:
    with fitz.open(stream=data, filetype="pdf") as doc:
        return doc.page_count


def convert_pdf_to_docx(
    data: bytes,
    *,
    start_page: int | None = None,
    end_page: int | None = None,
) -> tuple[bytes, int, int]:
    page_count = get_pdf_page_count(data)
    if page_count < 1:
        raise ValueError("pdf has no pages")

    start_idx = 0
    end_idx: int | None = None

    if start_page is not None:
        if start_page < 1 or start_page > page_count:
            raise ValueError("invalid start page")
        start_idx = start_page - 1

    if end_page is not None:
        if end_page < 1 or end_page > page_count:
            raise ValueError("invalid end page")
        if start_page is not None and end_page < start_page:
            raise ValueError("end page must be >= start page")
        end_idx = end_page

    converted_pages = (
        (end_idx if end_idx is not None else page_count) - start_idx
    )

    with tempfile.TemporaryDirectory() as tmp:
        pdf_path = os.path.join(tmp, "input.pdf")
        docx_path = os.path.join(tmp, "output.docx")
        with open(pdf_path, "wb") as handle:
            handle.write(data)

        converter = Converter(pdf_path)
        try:
            converter.convert(
                docx_path,
                start=start_idx,
                end=end_idx,
            )
        finally:
            converter.close()

        with open(docx_path, "rb") as handle:
            docx_bytes = handle.read()

    if not docx_bytes:
        raise ValueError("conversion produced empty document")

    return docx_bytes, page_count, converted_pages
