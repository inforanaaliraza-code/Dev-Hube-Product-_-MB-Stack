import io

import numpy as np
from PIL import Image

_engine = None
_engine_error: str | None = None


def _get_engine():
    global _engine, _engine_error
    if _engine is not None:
        return _engine
    if _engine_error:
        raise RuntimeError(_engine_error)
    try:
        from rapidocr_onnxruntime import RapidOCR

        _engine = RapidOCR()
        return _engine
    except Exception as exc:
        _engine_error = f"OCR engine failed to load: {exc}"
        raise RuntimeError(_engine_error) from exc


def ocr_ready() -> tuple[bool, str | None]:
    try:
        _get_engine()
        return True, None
    except Exception as exc:
        return False, str(exc)


def extract_text_from_image(data: bytes) -> tuple[str, int]:
    if not data:
        raise ValueError("empty image file")
    try:
        image = Image.open(io.BytesIO(data))
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        array = np.array(image)
    except Exception as exc:
        raise ValueError("invalid image file") from exc

    engine = _get_engine()
    result, _ = engine(array)
    if not result:
        return "", 0

    lines: list[str] = []
    for item in result:
        if len(item) >= 2 and item[1]:
            lines.append(str(item[1]).strip())
    text = "\n".join([line for line in lines if line])
    return text, len(lines)
