import re
from html import unescape

OTP_PATTERNS = [
    re.compile(
        r"(?:verification|confirm(?:ation)?|security|access|login|auth(?:entication)?|one[- ]?time|otp|pin|passcode|code)[\s:;\-–—]*(?:is\s*)?(?:#)?\s*([0-9]{4,8})\b",
        re.IGNORECASE,
    ),
    re.compile(r"\b([0-9]{6})\b(?=.*(?:expire|minute|valid|code))", re.IGNORECASE | re.DOTALL),
    re.compile(r"\b([0-9]{4,8})\b"),
]

NOISE = re.compile(r"^\d{4}$")


def strip_html(html: str) -> str:
    if not html:
        return ""
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"<[^>]+>", " ", text)
    return unescape(re.sub(r"\s+", " ", text)).strip()


def extract_otp_codes(subject: str, text: str, html: str) -> list[str]:
    blob = "\n".join(filter(None, [subject or "", text or "", strip_html(html or "")]))
    if not blob.strip():
        return []
    seen: set[str] = set()
    ordered: list[str] = []
    for pattern in OTP_PATTERNS:
        for match in pattern.finditer(blob):
            code = match.group(1)
            if NOISE.match(code) and len(ordered) > 0:
                continue
            if code not in seen and 4 <= len(code) <= 8:
                seen.add(code)
                ordered.append(code)
    return ordered[:5]
