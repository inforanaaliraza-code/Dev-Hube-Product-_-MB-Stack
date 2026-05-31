@echo off
echo Dev Hube Merge PDF worker - port 8104
cd /d "%~dp0"
if not exist ".venv\Scripts\activate.bat" (
  python -m venv .venv
  call .venv\Scripts\activate.bat
  pip install -r requirements.txt
) else (
  call .venv\Scripts\activate.bat
)
uvicorn main:app --host 127.0.0.1 --port 8104 --reload
