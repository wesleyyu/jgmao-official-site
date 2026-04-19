import { execFile } from "node:child_process";
import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import httpProxy from "http-proxy";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const port = Number(process.env.PORT || 1688);
const openClawOrigin = process.env.OPENCLAW_CHAT_ORIGIN || "http://127.0.0.1:18789";
const openClawAgentId = process.env.OPENCLAW_AGENT_ID || "jgmao-support-agent";
const openClawBin = process.env.OPENCLAW_BIN || "/opt/homebrew/bin/openclaw";
const execFileAsync = promisify(execFile);

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".ico", "image/x-icon"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".txt", "text/plain; charset=utf-8"],
]);

const proxy = httpProxy.createProxyServer({
  target: openClawOrigin,
  changeOrigin: true,
  xfwd: true,
  ws: true,
  secure: false,
});

proxy.on("proxyRes", (proxyRes, req) => {
  delete proxyRes.headers["x-frame-options"];
  delete proxyRes.headers["content-security-policy"];
  delete proxyRes.headers["content-security-policy-report-only"];
  proxyRes.headers["cache-control"] = "no-store";

  const location = proxyRes.headers.location;
  if (location && typeof location === "string" && req.url?.startsWith("/openclaw")) {
    if (location.startsWith("/")) {
      proxyRes.headers.location = `/openclaw${location}`;
    }
  }
});

proxy.on("error", (error, req, res) => {
  const message = `OpenClaw proxy error: ${error.message}`;
  if ("writeHead" in res && typeof res.writeHead === "function") {
    res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    res.end(message);
    return;
  }

  res.destroy(error);
});

function isOpenClawRequest(urlPath) {
  return urlPath.startsWith("/openclaw") || urlPath.startsWith("/api/") || urlPath.startsWith("/__openclaw/");
}

function rewriteOpenClawPath(urlPath) {
  if (urlPath.startsWith("/openclaw")) {
    const rewritten = urlPath.replace(/^\/openclaw/, "");
    return rewritten.length > 0 ? rewritten : "/";
  }

  return urlPath;
}

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

async function runLocalAgentTurn({ message, sessionId }) {
  const { stdout, stderr } = await execFileAsync(
    openClawBin,
    [
      "agent",
      "--agent",
      openClawAgentId,
      "--local",
      "--json",
      "--session-id",
      sessionId,
      "--message",
      message,
    ],
    {
      cwd: rootDir,
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

async function handleLocalChatRequest(req, res) {
  try {
    const payload = await readJsonBody(req);
    const message = typeof payload?.message === "string" ? payload.message.trim() : "";
    const sessionId = typeof payload?.sessionId === "string" ? payload.sessionId.trim() : "";

    if (!message || !sessionId) {
      res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Missing message or sessionId" }));
      return true;
    }

    const result = await runLocalAgentTurn({ message, sessionId });
    res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    res.end(JSON.stringify({ ok: true, reply: result.reply }));
    return true;
  } catch (error) {
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    return true;
  }
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveStaticPath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0] || "/");
  const candidate = path.join(distDir, cleanPath === "/" ? "index.html" : cleanPath);
  const candidateStats = await stat(candidate).catch(() => null);

  if (candidateStats?.isFile()) {
    return candidate;
  }

  if (candidateStats?.isDirectory()) {
    const nestedIndex = path.join(candidate, "index.html");
    if (await fileExists(nestedIndex)) {
      return nestedIndex;
    }
  }

  return path.join(distDir, "index.html");
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url || "/";

  if (req.method === "POST" && (urlPath === "/local-chat/message" || urlPath === "/api/chat/send")) {
    await handleLocalChatRequest(req, res);
    return;
  }

  if (isOpenClawRequest(urlPath)) {
    req.url = rewriteOpenClawPath(urlPath);
    proxy.web(req, res, { target: openClawOrigin });
    return;
  }

  try {
    const filePath = await resolveStaticPath(urlPath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes.get(ext) || "application/octet-stream";

    res.writeHead(200, { "content-type": contentType });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end(`Local preview server error: ${error instanceof Error ? error.message : String(error)}`);
  }
});

server.on("upgrade", (req, socket, head) => {
  const urlPath = req.url || "/";

  if (!isOpenClawRequest(urlPath)) {
    socket.destroy();
    return;
  }

  req.url = rewriteOpenClawPath(urlPath);
  proxy.ws(req, socket, head, { target: openClawOrigin.replace(/^http/i, "ws") });
});

server.listen(port, () => {
  console.log(`Local preview server running at http://127.0.0.1:${port}`);
  console.log(`Proxying OpenClaw chat from ${openClawOrigin}`);
});
