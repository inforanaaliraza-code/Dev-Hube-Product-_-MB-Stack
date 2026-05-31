@echo off

cd /d "%~dp0"

set HF_HUB_DISABLE_SYMLINKS_WARNING=1

set TOKENIZERS_PARALLELISM=false

call .venv\Scripts\activate.bat

python preload_model.py

pause

