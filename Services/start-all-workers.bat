@echo off

cd /d "%~dp0"

echo Dev Hube - starting all Python workers (ports 8100-8110)

echo.

py -3.12 run_all_workers.py --no-reload %*

if not errorlevel 1 goto :done

py -3.11 run_all_workers.py --no-reload %*

if not errorlevel 1 goto :done

py -3 run_all_workers.py --no-reload %*

if not errorlevel 1 goto :done

python run_all_workers.py --no-reload %*

:done

pause

