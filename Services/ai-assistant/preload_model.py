from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent.parent / "Backend" / ".env")

from local_llm import _load, _model_id, get_model_state

print(f"Downloading / loading: {_model_id()}")
_load()
print(f"Done. State: {get_model_state()}")
