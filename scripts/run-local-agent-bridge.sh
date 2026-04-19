#!/bin/zsh
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export AGENT_BRIDGE_TOKEN="${AGENT_BRIDGE_TOKEN:-jgmao-local-shared-secret}"
export OPENCLAW_AGENT_ID="${OPENCLAW_AGENT_ID:-jgmao-support-agent}"
export OPENCLAW_BIN="${OPENCLAW_BIN:-/opt/homebrew/bin/openclaw}"
export PORT="${PORT:-8788}"

cd "/Users/wesleyyu/Documents/New project/jgmao-official-site"

exec /opt/homebrew/bin/node scripts/local-agent-bridge.mjs
