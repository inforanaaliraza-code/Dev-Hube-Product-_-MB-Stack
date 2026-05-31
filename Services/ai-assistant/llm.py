import os

import httpx

from errors import LlmError


def _api_key() -> str:
    gemini = os.getenv("AI_GEMINI_API_KEY", "").strip().strip("\ufeff")
    if gemini:
        return gemini
    return os.getenv("AI_API_KEY", "").strip().strip("\ufeff")


def resolve_provider() -> str:
    explicit = os.getenv("AI_PROVIDER", "").strip().lower()
    if explicit in ("openai", "ollama", "local", "gemini"):
        return explicit
    key = _api_key()
    if key.startswith("AIza"):
        return "gemini"
    if key:
        return "openai"
    return "local"


def is_configured_sync() -> bool:
    provider = resolve_provider()
    if provider in ("openai", "gemini"):
        return bool(_api_key())
    if provider == "ollama":
        base = os.getenv("AI_OLLAMA_BASE", "http://127.0.0.1:11434").rstrip("/")
        try:
            with httpx.Client(timeout=3.0) as client:
                res = client.get(f"{base}/api/tags")
                return res.is_success
        except Exception:
            return False
    if provider == "local":
        try:
            import transformers  # noqa: F401
            import torch  # noqa: F401
        except Exception:
            return False
        return bool(_model_id_safe())
    return False


def _model_id_safe() -> str:
    return os.getenv("AI_LOCAL_MODEL", "HuggingFaceTB/SmolLM2-135M-Instruct").strip()


def _gemini_settings() -> tuple[str, str, str]:
    api_key = _api_key()
    base = os.getenv(
        "AI_GEMINI_BASE",
        "https://generativelanguage.googleapis.com/v1beta",
    ).rstrip("/")
    model = os.getenv("AI_GEMINI_MODEL", os.getenv("AI_MODEL", "gemini-2.0-flash")).strip()
    if not api_key:
        raise LlmError("AI_API_KEY or AI_GEMINI_API_KEY is not configured (AI_PROVIDER=gemini)")
    return api_key, base, model


def _gemini_error_message(res: httpx.Response) -> str:
    try:
        body = res.json()
        err = body.get("error") if isinstance(body, dict) else None
        if isinstance(err, dict):
            msg = err.get("message") or res.text[:500]
            status = err.get("status") or err.get("code") or ""
            if status:
                return f"{msg} ({status})"
            return str(msg)
    except Exception:
        pass
    return res.text[:500] or res.reason_phrase


async def _complete_gemini(system_prompt: str, user_prompt: str, max_tokens: int) -> str:
    api_key, base_url, model = _gemini_settings()
    url = f"{base_url}/models/{model}:generateContent"
    payload: dict = {
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": min(max_tokens, 8192),
        },
    }
    if system_prompt.strip():
        payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}
    async with httpx.AsyncClient(timeout=120.0) as client:
        res = await client.post(
            url,
            params={"key": api_key},
            json=payload,
            headers={"Content-Type": "application/json"},
        )
    if res.status_code in (401, 403):
        raise LlmError(f"Invalid Gemini API key — {_gemini_error_message(res)}")
    if not res.is_success:
        raise LlmError(f"Gemini error ({res.status_code}): {_gemini_error_message(res)}")
    data = res.json()
    candidates = data.get("candidates") or []
    if not candidates:
        raise LlmError("Gemini returned no candidates")
    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    text_parts = [str(p.get("text", "")).strip() for p in parts if p.get("text")]
    out = "\n".join(t for t in text_parts if t).strip()
    if not out:
        raise LlmError("Gemini returned empty content")
    return out


def _openai_settings() -> tuple[str, str, str]:
    api_key = _api_key()
    base_url = os.getenv("AI_API_BASE", "https://api.openai.com/v1").rstrip("/")
    model = os.getenv("AI_MODEL", "gpt-4o-mini").strip()
    if not api_key:
        raise LlmError("AI_API_KEY is not configured (AI_PROVIDER=openai)")
    return api_key, base_url, model


def _openai_error_message(res: httpx.Response) -> str:
    try:
        body = res.json()
        err = body.get("error") if isinstance(body, dict) else None
        if isinstance(err, dict):
            msg = err.get("message") or res.text[:500]
            code = err.get("code") or err.get("type") or ""
            if code:
                return f"{msg} ({code})"
            return str(msg)
    except Exception:
        pass
    return res.text[:500] or res.reason_phrase


async def _complete_openai(system_prompt: str, user_prompt: str, max_tokens: int) -> str:
    api_key, base_url, model = _openai_settings()
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.4,
        "max_tokens": max_tokens,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        res = await client.post(f"{base_url}/chat/completions", json=payload, headers=headers)
    if res.status_code == 401:
        raise LlmError(f"Invalid AI_API_KEY — {_openai_error_message(res)}")
    if not res.is_success:
        raise LlmError(f"OpenAI error ({res.status_code}): {_openai_error_message(res)}")
    data = res.json()
    choices = data.get("choices") or []
    if not choices:
        raise LlmError("AI provider returned no choices")
    message = choices[0].get("message") or {}
    content = message.get("content")
    if not content or not str(content).strip():
        raise LlmError("AI provider returned empty content")
    return str(content).strip()


async def _complete_ollama(system_prompt: str, user_prompt: str, max_tokens: int) -> str:
    base = os.getenv("AI_OLLAMA_BASE", "http://127.0.0.1:11434").rstrip("/")
    model = os.getenv("AI_OLLAMA_MODEL", "llama3.2").strip()
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
        "options": {"temperature": 0.4, "num_predict": min(max_tokens, 4096)},
    }
    async with httpx.AsyncClient(timeout=300.0) as client:
        res = await client.post(f"{base}/api/chat", json=payload)
    if not res.is_success:
        detail = res.text[:500]
        raise LlmError(
            f"Ollama error ({res.status_code}): {detail}. Install Ollama and run: ollama pull {model}"
        )
    data = res.json()
    message = data.get("message") or {}
    content = message.get("content")
    if not content or not str(content).strip():
        raise LlmError("Ollama returned empty content")
    return str(content).strip()


async def complete(system_prompt: str, user_prompt: str, max_tokens: int = 4096) -> str:
    provider = resolve_provider()
    if provider == "gemini":
        return await _complete_gemini(system_prompt, user_prompt, max_tokens)
    if provider == "openai":
        return await _complete_openai(system_prompt, user_prompt, max_tokens)
    if provider == "ollama":
        return await _complete_ollama(system_prompt, user_prompt, max_tokens)
    if provider == "local":
        from local_llm import complete_local

        cap = int(os.getenv("AI_LOCAL_MAX_TOKENS", "2048"))
        return await complete_local(system_prompt, user_prompt, min(max_tokens, cap))
    raise LlmError(f"Unknown AI_PROVIDER: {provider}")
