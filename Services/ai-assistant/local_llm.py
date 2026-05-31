import asyncio
import os
from threading import Lock

from errors import LlmError

_gen_lock = Lock()
_model = None
_tokenizer = None
_model_state = "idle"


def get_model_state() -> str:
    return _model_state


def _model_id() -> str:
    return os.getenv("AI_LOCAL_MODEL", "HuggingFaceTB/SmolLM2-135M-Instruct").strip()


def _load():
    global _model, _tokenizer, _model_state
    with _gen_lock:
        if _model is not None:
            return _model, _tokenizer
        _model_state = "loading"
        try:
            import torch
            from transformers import AutoModelForCausalLM, AutoTokenizer
        except ImportError as exc:
            _model_state = "error"
            raise LlmError(
                "Local AI dependencies missing. Run: pip install -r requirements.txt"
            ) from exc
        mid = _model_id()
        if not mid:
            _model_state = "error"
            raise LlmError("AI_LOCAL_MODEL is not set")
        threads = os.getenv("AI_LOCAL_THREADS", "2")
        try:
            torch.set_num_threads(max(1, int(threads)))
        except ValueError:
            torch.set_num_threads(2)
        tok = AutoTokenizer.from_pretrained(mid)
        if tok.pad_token_id is None and tok.eos_token_id is not None:
            tok.pad_token_id = tok.eos_token_id
        dtype = torch.float16 if torch.cuda.is_available() else torch.float32
        mdl = AutoModelForCausalLM.from_pretrained(
            mid,
            dtype=dtype,
            low_cpu_mem_usage=True,
        )
        if not torch.cuda.is_available():
            mdl = mdl.to("cpu")
        mdl.eval()
        _tokenizer = tok
        _model = mdl
        _model_state = "ready"
        return _model, _tokenizer


def _generate_sync(system_prompt: str, user_prompt: str, max_tokens: int) -> str:
    import torch

    model, tokenizer = _load()
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )
    inputs = tokenizer([text], return_tensors="pt")
    if torch.cuda.is_available():
        inputs = {k: v.cuda() for k, v in inputs.items()}
    model_max = int(getattr(model.config, "max_position_embeddings", 2048))
    hard_cap = int(os.getenv("AI_LOCAL_MAX_NEW", "1536"))
    max_new = min(max(128, max_tokens), hard_cap)
    reserve = max_new + 48
    input_len = inputs["input_ids"].shape[1]
    if input_len + reserve > model_max:
        trim_to = max(256, model_max - reserve)
        inputs = {k: v[:, -trim_to:] for k, v in inputs.items()}
    pad_id = tokenizer.pad_token_id
    if pad_id is None:
        pad_id = tokenizer.eos_token_id
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new,
            min_new_tokens=16,
            temperature=0.5,
            do_sample=True,
            top_p=0.92,
            repetition_penalty=1.08,
            pad_token_id=pad_id,
            eos_token_id=tokenizer.eos_token_id,
        )
    gen = outputs[0][inputs["input_ids"].shape[1] :]
    out = tokenizer.decode(gen, skip_special_tokens=True).strip()
    if not out:
        raise LlmError("Local model returned empty output — try shorter text or use Ollama")
    return out


async def complete_local(system_prompt: str, user_prompt: str, max_tokens: int) -> str:
    loop = asyncio.get_running_loop()
    try:
        return await loop.run_in_executor(
            None,
            lambda: _generate_sync(system_prompt, user_prompt, max_tokens),
        )
    except LlmError:
        raise
    except Exception as exc:
        global _model_state
        _model_state = "error"
        raise LlmError(f"Local model failed: {exc}") from exc
