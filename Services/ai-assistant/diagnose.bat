@echo off
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Run from Services: start-all-workers.bat once, or: python -m venv .venv ^& pip install -r requirements.txt
  exit /b 1
)
call .venv\Scripts\activate.bat
python diagnose.py
pause
