@echo off
echo Dev Hube Speech to Text worker - port 8109
cd /d "%~dp0"
if not exist ".venv\Scripts\activate.bat" (
  python -m venv .venv
  call .venv\Scripts\activate.bat
  pip install -r requirements.txt
) else (
  call .venv\Scripts\activate.bat
)
uvicorn main:app --host 127.0.0.1 --port 8109 --reload
