def split_text_chunks(text: str, max_chars: int = 1800) -> list[str]:
    cleaned = text.strip()
    if not cleaned:
        return []
    if len(cleaned) <= max_chars:
        return [cleaned]
    chunks: list[str] = []
    blocks = cleaned.split("\n\n")
    buf = ""
    for block in blocks:
        piece = block.strip()
        if not piece:
            continue
        if len(piece) > max_chars:
            if buf:
                chunks.append(buf)
                buf = ""
            for i in range(0, len(piece), max_chars):
                chunks.append(piece[i : i + max_chars])
            continue
        candidate = f"{buf}\n\n{piece}".strip() if buf else piece
        if len(candidate) <= max_chars:
            buf = candidate
        else:
            if buf:
                chunks.append(buf)
            buf = piece
    if buf:
        chunks.append(buf)
    return chunks if chunks else [cleaned[:max_chars]]
