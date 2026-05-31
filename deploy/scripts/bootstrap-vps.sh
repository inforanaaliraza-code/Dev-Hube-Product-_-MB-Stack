#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-/opt/dev-hube}"
REPO_URL="${2:-}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root: sudo bash deploy/scripts/bootstrap-vps.sh"
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable docker
systemctl start docker

mkdir -p "$APP_DIR"
if [ -n "$REPO_URL" ] && [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi

ufw allow 22/tcp || true
ufw allow 80/tcp || true
ufw allow 3001/tcp || true
ufw --force enable || true

echo "Bootstrap done. Next:"
echo "  cd $APP_DIR"
echo "  cp deploy/env.production.example .env.production"
echo "  nano .env.production"
echo "  docker compose --env-file .env.production --profile workers up -d --build"
