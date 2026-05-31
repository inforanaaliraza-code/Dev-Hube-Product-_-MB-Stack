@echo off

echo Dev Hube AI Assistant worker - port 8107

cd /d "%~dp0"

set HF_HUB_DISABLE_SYMLINKS_WARNING=1

set TOKENIZERS_PARALLELISM=false

if not exist ".venv\Scripts\activate.bat" (

  python -m venv .venv

  call .venv\Scripts\activate.bat

  python -m pip install -r requirements.txt

) else (

  call .venv\Scripts\activate.bat

)

echo First time: run preload_model.py once before using tools

python -m uvicorn main:app --host 127.0.0.1 --port 8107

