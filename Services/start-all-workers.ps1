Set-Location $PSScriptRoot

Write-Host "Dev Hube - starting all Python workers (ports 8100-8110)" -ForegroundColor Cyan

if (Get-Command py -ErrorAction SilentlyContinue) {

  py -3.12 run_all_workers.py --no-reload @args

  if ($LASTEXITCODE -eq 0) { exit 0 }

  py -3.11 run_all_workers.py --no-reload @args

  if ($LASTEXITCODE -eq 0) { exit 0 }

  py -3 run_all_workers.py --no-reload @args

  if ($LASTEXITCODE -eq 0) { exit 0 }

}

if (Get-Command python -ErrorAction SilentlyContinue) {

  python run_all_workers.py --no-reload @args

  exit $LASTEXITCODE

}

Write-Host "Python not found. Install from https://www.python.org/downloads/" -ForegroundColor Red

exit 1

