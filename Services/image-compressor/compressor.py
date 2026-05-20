import io
from typing import Literal

from PIL import Image, ImageOps

OutputFormat = Literal["auto", "jpeg", "png", "webp"]
MimeMap = {
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
}

ALLOWED_INPUT = {"image/jpeg", "image/png", "image/webp"}


def _normalize_format(value: str) -> OutputFormat:
    lowered = value.strip().lower()
    if lowered in ("auto", "jpeg", "jpg", "png", "webp"):
        if lowered == "jpg":
            return "jpeg"
        return lowered  # type: ignore[return-value]
    return "auto"


def _resolve_output_format(
    input_mime: str,
    requested: OutputFormat,
) -> str:
    if requested != "auto":
        return requested
    if input_mime == "image/png":
        return "png"
    if input_mime == "image/webp":
        return "webp"
    return "jpeg"


def _resize_if_needed(
    image: Image.Image,
    max_width: int | None,
    max_height: int | None,
) -> Image.Image:
    width, height = image.size
    target_w = max_width or width
    target_h = max_height or height
    if width <= target_w and height <= target_h:
        return image
    ratio = min(target_w / width, target_h / height)
    new_size = (max(1, int(width * ratio)), max(1, int(height * ratio)))
    return image.resize(new_size, Image.Resampling.LANCZOS)


def compress_image_bytes(
    data: bytes,
    *,
    content_type: str,
    quality: int = 82,
    max_width: int | None = None,
    max_height: int | None = None,
    output_format: str = "auto",
    strip_metadata: bool = True,
) -> tuple[bytes, str, int, int]:
    if content_type not in ALLOWED_INPUT:
        raise ValueError("unsupported file type")
    quality = max(1, min(100, int(quality)))
    requested = _normalize_format(output_format)
    out_fmt = _resolve_output_format(content_type, requested)

    with Image.open(io.BytesIO(data)) as src:
        image = ImageOps.exif_transpose(src)
        if strip_metadata:
            image = image.copy()
        image = _resize_if_needed(image, max_width, max_height)
        if out_fmt in ("jpeg", "webp") and image.mode in ("RGBA", "LA", "P"):
            image = image.convert("RGB")

        buffer = io.BytesIO()
        if out_fmt == "png":
            png_level = max(0, min(9, int((100 - quality) / 11)))
            image.save(
                buffer,
                format="PNG",
                optimize=True,
                compress_level=png_level,
            )
        elif out_fmt == "webp":
            image.save(
                buffer,
                format="WEBP",
                quality=quality,
                method=6,
            )
        else:
            image.save(
                buffer,
                format="JPEG",
                quality=quality,
                optimize=True,
                progressive=True,
            )
        width, height = image.size
        return buffer.getvalue(), MimeMap[out_fmt], width, height
