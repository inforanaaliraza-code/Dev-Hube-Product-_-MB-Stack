#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
echo "Dev Hube - starting all Python workers (ports 8100-8110)"
python3 run_all_workers.py --install "$@"
