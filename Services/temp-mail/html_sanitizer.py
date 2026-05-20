from bs4 import BeautifulSoup

ALLOWED_TAGS = {
    "a",
    "b",
    "br",
    "div",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "p",
    "span",
    "strong",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "ul",
    "ol",
    "li",
    "img",
}

ALLOWED_ATTRS = {"href", "title", "alt", "src", "colspan", "rowspan"}


def sanitize_html(html: str) -> str:
    if not html or not html.strip():
        return ""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup.find_all(True):
        if tag.name not in ALLOWED_TAGS:
            tag.unwrap()
            continue
        attrs = dict(tag.attrs)
        for key in list(attrs.keys()):
            if key not in ALLOWED_ATTRS:
                del tag.attrs[key]
            elif key == "href" and isinstance(attrs[key], list):
                tag.attrs[key] = attrs[key][0] if attrs[key] else ""
        if tag.name == "a" and tag.get("href", "").startswith("javascript:"):
            del tag["href"]
    body = soup.body
    if body:
        return "".join(str(child) for child in body.children)
    return str(soup)
