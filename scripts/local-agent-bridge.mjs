import { execFile } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const port = Number(process.env.PORT || 8788);
const agentId = process.env.OPENCLAW_AGENT_ID || "jgmao-support-agent";
const sharedToken = process.env.AGENT_BRIDGE_TOKEN || "";
const openClawBin = process.env.OPENCLAW_BIN || "/opt/homebrew/bin/openclaw";

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function isAuthorized(req) {
  if (!sharedToken) {
    return true;
  }

  const authorization = req.headers.authorization || "";
  return authorization === `Bearer ${sharedToken}`;
}

async function runAgent({ message, sessionId }) {
  console.log(`[bridge] running agent for session=${sessionId}`);
  const { stdout, stderr } = await execFileAsync(
    openClawBin,
    [
      "agent",
      "--agent",
      agentId,
      "--local",
      "--json",
      "--session-id",
      sessionId,
      "--message",
      message,
    ],
    {
      env: {
        ...process.env,
        PATH: [path.dirname(openClawBin), process.env.PATH].filter(Boolean).join(":"),
      },
      timeout: 120000,
      maxBuffer: 2 * 1024 * 1024,
    },
  );

  const combined = [stdout, stderr].filter(Boolean).join("\n");
  const jsonStart = combined.indexOf("{");

  if (jsonStart < 0) {
    throw new Error("No JSON payload returned from OpenClaw agent");
  }

  const parsed = JSON.parse(combined.slice(jsonStart));
  const reply = Array.isArray(parsed.payloads)
    ? parsed.payloads
        .map((payload) => (typeof payload?.text === "string" ? payload.text.trim() : ""))
        .filter(Boolean)
        .join("\n\n")
    : "";

  return { reply, raw: parsed };
}

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/chat") {
    res.writeHead(404, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: "Not found" }));
    return;
  }

  if (!isAuthorized(req)) {
    res.writeHead(401, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
    return;
  }

  try {
    const payload = await readJsonBody(req);
    const message = typeof payload?.message === "string" ? payload.message.trim() : "";
    const sessionId = typeof payload?.sessionId === "string" ? payload.sessionId.trim() : "";
    console.log(`[bridge] incoming request session=${sessionId || "missing"} messageLength=${message.length}`);

    if (!message || !sessionId) {
      res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Missing message or sessionId" }));
      return;
    }

    const result = await runAgent({ message, sessionId });
    res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    res.end(JSON.stringify({ ok: true, reply: result.reply }));
  } catch (error) {
    console.error("[bridge] request failed", error);
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Local agent bridge listening on http://0.0.0.0:${port}/chat`);
  console.log(`Forwarding to OpenClaw agent: ${agentId}`);
});
