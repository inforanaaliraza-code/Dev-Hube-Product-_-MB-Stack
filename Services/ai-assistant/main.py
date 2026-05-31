from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).resolve().parent.parent.parent / "Backend" / ".env")

from errors import LlmError
from llm import complete, is_configured_sync, resolve_provider
from text_chunks import split_text_chunks

try:
    from local_llm import get_model_state
except ImportError:
    def get_model_state() -> str:
        return "idle"

app = FastAPI(title="Dev Hube AI Assistant Worker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "ai-assistant"
    configured: bool
    provider: str
    model_state: str = "idle"


class CodeRequest(BaseModel):
    prompt: str = Field(min_length=3, max_length=8000)
    language: str = Field(default="typescript", max_length=64)


class CodeResponse(BaseModel):
    code: str
    language: str


class ResumeRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    job_title: str = Field(min_length=1, max_length=120)
    summary: str = Field(default="", max_length=2000)
    experience: str = Field(default="", max_length=6000)
    skills: str = Field(default="", max_length=2000)
    education: str = Field(default="", max_length=2000)


class ResumeResponse(BaseModel):
    resume_markdown: str


class TextRewriteRequest(BaseModel):
    text: str = Field(min_length=3, max_length=12000)
    tone: str = Field(default="neutral", max_length=32)


class TextRewriteResponse(BaseModel):
    result: str


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    provider = resolve_provider()
    state = get_model_state() if provider == "local" else "n/a"
    return HealthResponse(
        configured=is_configured_sync(),
        provider=provider,
        model_state=state,
    )


@app.post("/generate/code", response_model=CodeResponse)
async def generate_code(body: CodeRequest) -> CodeResponse:
    system = (
        "You are a senior software engineer. Return only code without markdown fences "
        "unless the user asks for explanation. Prefer clean, production-ready code."
    )
    user = f"Language: {body.language}\n\nRequest:\n{body.prompt}"
    try:
        code = await complete(system, user, max_tokens=4096)
    except LlmError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Code generation failed") from exc
    return CodeResponse(code=code, language=body.language)


@app.post("/generate/resume", response_model=ResumeResponse)
async def generate_resume(body: ResumeRequest) -> ResumeResponse:
    system = (
        "You are an expert resume writer. Output a polished resume in Markdown with sections: "
        "Summary, Experience, Skills, Education. Use bullet points. Keep ATS-friendly wording."
    )
    user = (
        f"Name: {body.full_name}\n"
        f"Target role: {body.job_title}\n"
        f"Summary notes: {body.summary}\n"
        f"Experience:\n{body.experience}\n"
        f"Skills: {body.skills}\n"
        f"Education: {body.education}\n"
    )
    try:
        resume = await complete(system, user, max_tokens=4096)
    except LlmError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Resume generation failed") from exc
    return ResumeResponse(resume_markdown=resume)


async def _rewrite_long(system: str, text: str, tone: str, max_tokens: int) -> str:
    chunks = split_text_chunks(text, 1600)
    if not chunks:
        raise LlmError("No text to rewrite")
    if len(chunks) == 1:
        user = f"Tone: {tone}\n\nText:\n{chunks[0]}"
        return await complete(system, user, max_tokens=max_tokens)
    parts: list[str] = []
    total = len(chunks)
    for idx, chunk in enumerate(chunks, start=1):
        user = (
            f"Tone: {tone}\n"
            f"Part {idx} of {total}. Rewrite only this part; keep facts and names.\n\n"
            f"Text:\n{chunk}"
        )
        part = await complete(system, user, max_tokens=max_tokens)
        if part.strip():
            parts.append(part.strip())
    merged = "\n\n".join(parts).strip()
    if not merged:
        raise LlmError("Rewrite produced empty output")
    return merged


@app.post("/rewrite/paraphrase", response_model=TextRewriteResponse)
async def paraphrase(body: TextRewriteRequest) -> TextRewriteResponse:
    system = (
        "You paraphrase text while preserving meaning. Return only the rewritten text, "
        "no preamble. Match the requested tone when provided."
    )
    try:
        result = await _rewrite_long(system, body.text, body.tone, 2048)
    except LlmError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Paraphrase failed") from exc
    return TextRewriteResponse(result=result)


@app.post("/rewrite/humanize", response_model=TextRewriteResponse)
async def humanize(body: TextRewriteRequest) -> TextRewriteResponse:
    system = (
        "You rewrite AI-sounding text to sound natural, human, and clear. "
        "Return only the humanized text without commentary or labels."
    )
    try:
        result = await _rewrite_long(system, body.text, body.tone, 2048)
    except LlmError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Humanize failed") from exc
    return TextRewriteResponse(result=result)
