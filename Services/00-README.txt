Dev Hube — Python workers (all tools)

11 workers, ports 8100–8110. Backend .env must point to 127.0.0.1 (see Backend/.env.example).

ONE COMMAND — local Python (recommended dev)
-------------------------------------------
  Most workers: Python 3.11+ on PATH (python or py -3). OCR (image-to-text) needs py -3.12.

  cd Services
  start-all-workers.bat

  First time or after dependency changes:
  py -3.12 run_all_workers.py --install --no-reload

  Or PowerShell:
  .\start-all-workers.ps1

  Or:
  py -3.12 run_all_workers.py --install --no-reload

  First run installs each service venv + requirements (slow once).
  One terminal shows all logs: [temp-mail], [qr-generator], ...
  Ctrl+C stops everything.

  Stop without that window:
  stop-all-workers.bat

Flags for run_all_workers.py:
  --install     force pip install in every venv
  --no-reload   production-like (no hot reload)
  --no-health   skip /health check after start
  --stop        kill saved worker processes

ONE COMMAND — Docker (no local Python / App Control issues)
-----------------------------------------------------------
  From repo root:

  docker compose --profile workers -f docker-compose.yml -f docker-compose.workers-ports.yml up -d --build

  Stop:
  docker compose --profile workers -f docker-compose.yml -f docker-compose.workers-ports.yml down

Port map
--------
  8100 temp-mail          8106 compress-pdf
  8101 qr-generator       8107 ai-assistant (OpenAI via Backend .env)
  8102 image-compressor   8108 image-to-text
  8103 pdf-to-word        8109 speech-to-text
  8104 merge-pdf          8110 image-converter
  8105 split-pdf

image-to-text (8108): first run downloads OCR models (1–3 min). Wait for ocr_ready in health.

Then: Backend pnpm start:dev + Frontend pnpm dev

Health: http://127.0.0.1:8100/health … http://127.0.0.1:8110/health
