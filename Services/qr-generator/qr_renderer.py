import base64
import io
from typing import Literal

import qrcode
from PIL import Image
from qrcode.constants import ERROR_CORRECT_H, ERROR_CORRECT_L, ERROR_CORRECT_M, ERROR_CORRECT_Q

ErrorLevel = Literal["L", "M", "Q", "H"]

EC_MAP = {
    "L": ERROR_CORRECT_L,
    "M": ERROR_CORRECT_M,
    "Q": ERROR_CORRECT_Q,
    "H": ERROR_CORRECT_H,
}


def _hex_to_rgb(value: str) -> tuple[int, int, int]:
    raw = value.strip().lstrip("#")
    if len(raw) == 3:
        raw = "".join(c * 2 for c in raw)
    if len(raw) != 6:
        raise ValueError("invalid color")
    return (int(raw[0:2], 16), int(raw[2:4], 16), int(raw[4:6], 16))


def _decode_logo(logo_base64: str | None) -> Image.Image | None:
    if not logo_base64 or not logo_base64.strip():
        return None
    payload = logo_base64.strip()
    if "," in payload:
        payload = payload.split(",", 1)[1]
    try:
        data = base64.b64decode(payload, validate=True)
    except Exception as exc:
        raise ValueError("invalid logo") from exc
    img = Image.open(io.BytesIO(data)).convert("RGBA")
    return img


def generate_qr_png(
    data: str,
    *,
    foreground: str = "#000000",
    background: str = "#ffffff",
    size_px: int = 512,
    error_correction: ErrorLevel = "H",
    logo_base64: str | None = None,
    logo_scale: float = 0.22,
) -> bytes:
    if not data.strip():
        raise ValueError("empty data")
    size_px = max(128, min(2048, int(size_px)))
    logo_scale = max(0.12, min(0.3, float(logo_scale)))
    fg = _hex_to_rgb(foreground)
    bg = _hex_to_rgb(background)
    ec = EC_MAP.get(error_correction.upper(), ERROR_CORRECT_H)
    if logo_base64:
        ec = ERROR_CORRECT_H

    qr = qrcode.QRCode(
        version=None,
        error_correction=ec,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    matrix_img = qr.make_image(fill_color=fg, back_color=bg).convert("RGBA")
    matrix_img = matrix_img.resize((size_px, size_px), Image.Resampling.LANCZOS)

    logo = _decode_logo(logo_base64)
    if logo is not None:
        logo_side = int(size_px * logo_scale)
        logo = logo.resize((logo_side, logo_side), Image.Resampling.LANCZOS)
        pad = 8
        badge = Image.new("RGBA", (logo_side + pad * 2, logo_side + pad * 2), (*bg, 255))
        lx = (badge.width - logo.width) // 2
        ly = (badge.height - logo.height) // 2
        badge.paste(logo, (lx, ly), logo)
        px = (size_px - badge.width) // 2
        py = (size_px - badge.height) // 2
        matrix_img.paste(badge, (px, py), badge)

    out = io.BytesIO()
    matrix_img.convert("RGB").save(out, format="PNG", optimize=True)
    return out.getvalue()
