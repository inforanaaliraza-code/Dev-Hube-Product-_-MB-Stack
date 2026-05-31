@echo off
cd /d "%~dp0"
py -3 run_all_workers.py --stop 2>nul
if errorlevel 1 python run_all_workers.py --stop 2>nul
echo Done.
pause
