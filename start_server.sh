#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${HOME}/jgmao-official-site"
PID_FILE="${APP_DIR}/server.pid"
LOG_FILE="${APP_DIR}/server.log"
PORT=8800

if [[ -f "${PID_FILE}" ]]; then
  OLD_PID="$(cat "${PID_FILE}")"
  if kill -0 "${OLD_PID}" 2>/dev/null; then
    kill "${OLD_PID}" 2>/dev/null || true
    sleep 1
  fi
fi

if lsof -iTCP:${PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
  lsof -iTCP:${PORT} -sTCP:LISTEN -t | xargs -r kill
  sleep 1
fi

nohup env PORT=${PORT} CHAT_RELAY_ORIGIN=http://127.0.0.1:8789 node "${APP_DIR}/scripts/production-web-server.mjs" > "${LOG_FILE}" 2>&1 &
echo $! > "${PID_FILE}"
sleep 1
if ! kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
  echo "Failed to start server"
  exit 1
fi
