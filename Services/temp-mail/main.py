from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from html_sanitizer import sanitize_html
from otp_parser import extract_otp_codes

app = FastAPI(title="Dev Hube Temp Mail Worker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ParseOtpRequest(BaseModel):
    subject: str = ""
    text: str = ""
    html: str = ""


class ParseOtpResponse(BaseModel):
    codes: list[str] = Field(default_factory=list)
    primary: str | None = None


class SanitizeHtmlRequest(BaseModel):
    html: str = ""


class SanitizeHtmlResponse(BaseModel):
    html: str = ""


class HealthResponse(BaseModel):
    status: str = "ok"


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


@app.post("/parse/otp", response_model=ParseOtpResponse)
def parse_otp(body: ParseOtpRequest) -> ParseOtpResponse:
    codes = extract_otp_codes(body.subject, body.text, body.html)
    return ParseOtpResponse(codes=codes, primary=codes[0] if codes else None)


@app.post("/sanitize/html", response_model=SanitizeHtmlResponse)
def sanitize(body: SanitizeHtmlRequest) -> SanitizeHtmlResponse:
    return SanitizeHtmlResponse(html=sanitize_html(body.html))
