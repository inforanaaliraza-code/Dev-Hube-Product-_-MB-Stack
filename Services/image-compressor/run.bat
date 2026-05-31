@echo off
echo Dev Hube Image Compressor worker - port 8102
cd /d "%~dp0"
if not exist ".venv\Scripts\activate.bat" (
  python -m venv .venv
  call .venv\Scripts\activate.bat
  python -m pip install -r requirements.txt
) else (
  call .venv\Scripts\activate.bat
)
python -m uvicorn main:app --host 127.0.0.1 --port 8102 --reload
