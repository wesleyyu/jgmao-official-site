#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

SERVER_HOST="${SERVER_HOST:-60.205.252.238}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_KEY="${SERVER_KEY:-$HOME/Downloads/mini003.pem}"
SERVER_TARGET_ROOT="${SERVER_TARGET_ROOT:-/opt/jgmao-official-site}"
SERVER_DIST_DIR="${SERVER_DIST_DIR:-$SERVER_TARGET_ROOT/dist}"
SERVER_SCRIPT_DIR="${SERVER_SCRIPT_DIR:-$SERVER_TARGET_ROOT/scripts}"
SERVER_WS_DIR="${SERVER_WS_DIR:-/opt/jgmao-feishu-insight-ws}"
SERVER_GATEWAY_SERVICE="${SERVER_GATEWAY_SERVICE:-jgmao-public-chat.service}"
SERVER_FEISHU_WS_SERVICE="${SERVER_FEISHU_WS_SERVICE:-jgmao-feishu-insight-ws.service}"

if [[ ! -d "$DIST_DIR" ]]; then
  echo "Build output not found at $DIST_DIR"
  echo "Run: npm run build"
  exit 1
fi

if [[ ! -f "$SERVER_KEY" ]]; then
  echo "SSH key not found: $SERVER_KEY"
  exit 1
fi

SSH_OPTS=(-i "$SERVER_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null)
REMOTE="$SERVER_USER@$SERVER_HOST"

echo "Deploying JGMAO official site to $REMOTE:$SERVER_TARGET_ROOT"

ssh "${SSH_OPTS[@]}" "$REMOTE" "mkdir -p '$SERVER_DIST_DIR' '$SERVER_SCRIPT_DIR' '$SERVER_WS_DIR'"

rsync -az --delete -e "ssh ${SSH_OPTS[*]}" "$DIST_DIR/" "$REMOTE:$SERVER_DIST_DIR/"
rsync -az -e "ssh ${SSH_OPTS[*]}" \
  "$ROOT_DIR/scripts/public-chat-gateway.py" \
  "$ROOT_DIR/scripts/feishu-insight-ws-bot.mjs" \
  "$REMOTE:$SERVER_SCRIPT_DIR/"
rsync -az -e "ssh ${SSH_OPTS[*]}" \
  "$ROOT_DIR/scripts/feishu-insight-ws-bot.mjs" \
  "$REMOTE:$SERVER_WS_DIR/feishu-insight-ws-bot.mjs"

ssh "${SSH_OPTS[@]}" "$REMOTE" "
  find '$SERVER_DIST_DIR' -type d -exec chmod 755 {} + &&
  find '$SERVER_DIST_DIR' -type f -exec chmod 644 {} + &&
  chmod 755 '$SERVER_SCRIPT_DIR/public-chat-gateway.py' '$SERVER_SCRIPT_DIR/feishu-insight-ws-bot.mjs' '$SERVER_WS_DIR/feishu-insight-ws-bot.mjs' &&
  systemctl restart '$SERVER_GATEWAY_SERVICE' &&
  if systemctl list-unit-files | grep -q '^$SERVER_FEISHU_WS_SERVICE'; then
    systemctl restart '$SERVER_FEISHU_WS_SERVICE'
  fi &&
  nginx -t &&
  systemctl reload nginx &&
  curl -sS -H 'Host: www.jgmao.com' http://127.0.0.1/ -o /dev/null -w '/ %{http_code}\n' &&
  curl -sS -H 'Host: www.jgmao.com' http://127.0.0.1/geo-score/ -o /dev/null -w '/geo-score/ %{http_code}\n' &&
  curl -sS -H 'Host: www.jgmao.com' http://127.0.0.1/ai-growth-new/ -o /dev/null -w '/ai-growth-new/ %{http_code}\n'
"

echo "Deployment finished successfully."
