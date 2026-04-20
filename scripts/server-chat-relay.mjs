import http from "node:http";
import { Readable } from "node:stream";

const port = Number(process.env.PORT || 8789);
const bridgeUrl = process.env.AGENT_BRIDGE_URL || "http://127.0.0.1:8788/chat";
const bridgeToken = process.env.AGENT_BRIDGE_TOKEN || "";
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

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

function writeCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

const server = http.createServer(async (req, res) => {
  writeCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST" || req.url !== "/api/chat/send") {
    res.writeHead(404, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: "Not found" }));
    return;
  }

  try {
    const payload = await readJsonBody(req);
    const response = await fetch(bridgeUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: payload?.stream ? "application/x-ndjson" : "application/json",
        ...(bridgeToken ? { authorization: `Bearer ${bridgeToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    res.writeHead(response.status, {
      "content-type": response.headers.get("content-type") || "application/json; charset=utf-8",
      "cache-control": "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/x-ndjson") && response.body) {
      Readable.fromWeb(response.body).pipe(res);
      return;
    }

    const text = await response.text();
    const isJson = contentType.includes("application/json");
    const safePayload = isJson ? JSON.parse(text) : { ok: false, error: "Unexpected relay response" };

    if (response.ok) {
      res.end(JSON.stringify({ ok: true, reply: typeof safePayload.reply === "string" ? safePayload.reply : "" }));
      return;
    }

    res.end(JSON.stringify({
      ok: false,
      error: typeof safePayload.error === "string" ? safePayload.error : "Relay upstream error",
    }));
  } catch (error) {
    res.writeHead(502, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server chat relay listening on http://0.0.0.0:${port}/api/chat/send`);
  console.log(`Forwarding requests to bridge: ${bridgeUrl}`);
});
