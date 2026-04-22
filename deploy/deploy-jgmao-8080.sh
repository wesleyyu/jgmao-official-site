#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

SERVER_HOST="${SERVER_HOST:-8.130.11.205}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_KEY="${SERVER_KEY:-$HOME/Downloads/Y-001.pem}"
SERVER_TARGET_ROOT="${SERVER_TARGET_ROOT:-/opt/jgmao-official-site-8080}"
SERVER_DIST_DIR="${SERVER_DIST_DIR:-$SERVER_TARGET_ROOT/dist}"
SERVER_BACKUP_DIR="${SERVER_BACKUP_DIR:-$SERVER_TARGET_ROOT/dist.prev}"
SERVER_SCRIPT_DIR="${SERVER_SCRIPT_DIR:-$SERVER_TARGET_ROOT/scripts}"
LOCAL_GATEWAY_SCRIPT="${LOCAL_GATEWAY_SCRIPT:-$ROOT_DIR/scripts/public-chat-gateway.py}"
SERVER_GATEWAY_SCRIPT="${SERVER_GATEWAY_SCRIPT:-$SERVER_SCRIPT_DIR/public-chat-gateway.py}"
SERVER_GATEWAY_SERVICE="${SERVER_GATEWAY_SERVICE:-jgmao-public-chat.service}"
SERVER_NGINX_RELOAD_CMD="${SERVER_NGINX_RELOAD_CMD:-nginx -t && systemctl reload nginx}"

if [[ ! -d "$DIST_DIR" ]]; then
  echo "Build output not found at $DIST_DIR"
  echo "Run: npm run build"
  exit 1
fi

if [[ ! -f "$SERVER_KEY" ]]; then
  echo "SSH key not found: $SERVER_KEY"
  exit 1
fi

SSH_OPTS=(-i "$SERVER_KEY" -o StrictHostKeyChecking=no)
REMOTE="$SERVER_USER@$SERVER_HOST"

echo "Deploying $DIST_DIR to $REMOTE:$SERVER_DIST_DIR"

ssh "${SSH_OPTS[@]}" "$REMOTE" "mkdir -p '$SERVER_TARGET_ROOT'"
ssh "${SSH_OPTS[@]}" "$REMOTE" "mkdir -p '$SERVER_SCRIPT_DIR'"

ssh "${SSH_OPTS[@]}" "$REMOTE" "
  if [ -d '$SERVER_DIST_DIR' ]; then
    rm -rf '$SERVER_BACKUP_DIR'
    cp -a '$SERVER_DIST_DIR' '$SERVER_BACKUP_DIR'
  fi
"

rsync -az --delete -e "ssh ${SSH_OPTS[*]}" "$DIST_DIR/" "$REMOTE:$SERVER_DIST_DIR/"

if [[ -f "$LOCAL_GATEWAY_SCRIPT" ]]; then
  rsync -az -e "ssh ${SSH_OPTS[*]}" "$LOCAL_GATEWAY_SCRIPT" "$REMOTE:$SERVER_GATEWAY_SCRIPT"
  ssh "${SSH_OPTS[@]}" "$REMOTE" "chmod 755 '$SERVER_GATEWAY_SCRIPT'"
fi

ssh "${SSH_OPTS[@]}" "$REMOTE" "
  find '$SERVER_DIST_DIR' -type d -exec chmod 755 {} + &&
  find '$SERVER_DIST_DIR' -type f -exec chmod 644 {} + &&
  if systemctl list-unit-files | grep -q '^$SERVER_GATEWAY_SERVICE'; then
    systemctl restart '$SERVER_GATEWAY_SERVICE'
  fi &&
  $SERVER_NGINX_RELOAD_CMD &&
  curl -I http://127.0.0.1:8080/ &&
  curl -kI https://www.jgmao.com/ &&
  curl -kI https://www.jgmao.com/faq/
"

echo "Deployment finished successfully."
