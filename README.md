# jgmao-official-site

Official website project for JGMAO AI Growth Engine.

## Overview

This repository contains the current JGMAO website experience, including:

- the AI growth flywheel landing page
- bilingual website content structure
- brand identity and product architecture presentation
- deployment-ready Vite front-end code

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## AI Agent Chat Architecture

The website chat can be deployed with this split:

- website frontend on the server
- server relay API on the server
- `JGMAO Support Agent` on the local machine
- a private bridge between server and local machine through Tailscale

### Flow

1. The website frontend sends messages to `/api/chat/send`.
2. The server relay forwards the request to the local agent bridge over Tailscale.
3. The local bridge runs `JGMAO Support Agent` through OpenClaw.
4. The reply goes back through the relay to the frontend chat window.

### Local development

Current local preview already supports:

- `POST /local-chat/message`
- `POST /api/chat/send`

Both routes resolve to the local OpenClaw agent while using:

```bash
npm run serve:local
```

### Step 1: Run the local agent bridge

On the machine that hosts `JGMAO Support Agent`:

```bash
export OPENCLAW_AGENT_ID=jgmao-support-agent
export AGENT_BRIDGE_TOKEN=replace-with-a-secret
npm run agent:bridge
```

Default local bridge endpoint:

- `http://0.0.0.0:8788/chat`

### Step 2: Run the server chat relay

On the website server:

```bash
export AGENT_BRIDGE_URL=http://<tailscale-ip>:8788/chat
export AGENT_BRIDGE_TOKEN=replace-with-the-same-secret
export ALLOWED_ORIGIN=https://your-domain.com
npm run chat:relay
```

Default relay endpoint:

- `http://0.0.0.0:8789/api/chat/send`

You can then reverse-proxy `/api/chat/send` from your website domain to this relay service.

### Step 2.1: Optional systemd setup for the server relay

This repo includes:

- `deploy/jgmao-chat-relay.env.example`
- `deploy/jgmao-chat-relay.service`

Typical server setup:

```bash
cp deploy/jgmao-chat-relay.env.example deploy/jgmao-chat-relay.env
sudo cp deploy/jgmao-chat-relay.service /etc/systemd/system/jgmao-chat-relay.service
sudo systemctl daemon-reload
sudo systemctl enable --now jgmao-chat-relay
sudo systemctl status jgmao-chat-relay
```

Then point your reverse proxy or application gateway route:

- `/api/chat/send` -> `http://127.0.0.1:8789/api/chat/send`

### Step 3: Frontend endpoint

The frontend now supports:

- `VITE_CHAT_ENDPOINT`

If unset:

- local preview uses `/local-chat/message`
- deployed builds use `/api/chat/send`

If you want to hard-code a different endpoint at build time:

```bash
VITE_CHAT_ENDPOINT=https://your-domain.com/api/chat/send npm run build
```

### Recommended production setup

- keep the website frontend on the server
- keep the agent on the higher-spec local machine
- connect server to local machine with Tailscale
- do not expose the local bridge directly to the public internet
- protect bridge and relay with a shared secret
- add rate limiting on the relay layer

### Tailscale checklist

Before production switch-over:

1. Install and sign in to Tailscale on both the server and the local machine.
2. Confirm both machines can see each other with `tailscale ip -4`.
3. Put the local machine Tailscale IP into `AGENT_BRIDGE_URL`.
4. Keep the local bridge listening only on trusted interfaces and do not open it to the public internet.
5. Verify the full path with:

```bash
curl -X POST http://127.0.0.1:8789/api/chat/send \
  -H 'Content-Type: application/json' \
  -d '{"message":"你好","sessionId":"relay-smoke-test"}'
```
