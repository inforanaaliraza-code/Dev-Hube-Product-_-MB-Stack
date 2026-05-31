#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${VPS_APP_PATH:-/opt/dev-hube}"
cd "$APP_DIR"

if [ ! -f .env.production ]; then
  echo "Missing .env.production — copy deploy/env.production.example to .env.production"
  exit 1
fi

git fetch origin main
git reset --hard origin/main

docker compose --env-file .env.production build
docker compose --env-file .env.production --profile workers up -d --remove-orphans

docker compose --env-file .env.production ps
