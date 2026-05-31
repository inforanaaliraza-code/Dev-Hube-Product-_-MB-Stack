import io

from PIL import Image

SUPPORTED = {"png", "jpeg", "jpg", "webp", "gif", "bmp"}


def convert_image(data: bytes, target_format: str) -> tuple[bytes, str]:
    fmt = target_format.lower().replace("jpg", "jpeg")
    if fmt not in SUPPORTED:
        raise ValueError(f"unsupported format: {target_format}")

    try:
        image = Image.open(io.BytesIO(data))
    except Exception as exc:
        raise ValueError("invalid image file") from exc

    if fmt in ("jpeg", "webp") and image.mode in ("RGBA", "P"):
        image = image.convert("RGB")

    buffer = io.BytesIO()
    save_kwargs: dict = {}
    if fmt == "jpeg":
        save_kwargs["quality"] = 90
        save_kwargs["optimize"] = True
    if fmt == "webp":
        save_kwargs["quality"] = 90
    image.save(buffer, format=fmt.upper() if fmt != "jpeg" else "JPEG", **save_kwargs)
    converted = buffer.getvalue()
    if not converted:
        raise ValueError("conversion failed")
    ext = "jpg" if fmt == "jpeg" else fmt
    return converted, ext
