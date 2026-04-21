import { createReadStream } from "node:fs";
import { access, mkdir, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { appendFile } from "node:fs/promises";

import httpProxy from "http-proxy";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const port = Number(process.env.PORT || 1688);
const openClawOrigin = process.env.OPENCLAW_CHAT_ORIGIN || "http://127.0.0.1:18789";
const localBridgeOrigin = process.env.LOCAL_AGENT_BRIDGE_ORIGIN || "http://127.0.0.1:8788";
const localBridgeToken = process.env.AGENT_BRIDGE_TOKEN || "jgmao-local-shared-secret";
const feishuWebhookUrl = process.env.FEISHU_WEBHOOK_URL || "";
const feishuAppId = process.env.FEISHU_APP_ID || "";
const feishuAppSecret = process.env.FEISHU_APP_SECRET || "";
const feishuTargetChatId = process.env.FEISHU_TARGET_CHAT_ID || "";
const feishuTargetUserOpenId = process.env.FEISHU_TARGET_USER_OPEN_ID || "";
const leadLogFile = process.env.LEAD_LOG_FILE || path.join(rootDir, "tmp", "lead-submissions.ndjson");

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

async function handleLocalChatRequest(req, res) {
  try {
    const payload = await readJsonBody(req);
    const message = typeof payload?.message === "string" ? payload.message.trim() : "";
    const sessionId = typeof payload?.sessionId === "string" ? payload.sessionId.trim() : "";
    const stream = Boolean(payload?.stream);

    if (!message || !sessionId) {
      res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Missing message or sessionId" }));
      return true;
    }

    const response = await fetch(`${localBridgeOrigin}/chat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: stream ? "application/x-ndjson" : "application/json",
        ...(localBridgeToken ? { authorization: `Bearer ${localBridgeToken}` } : {}),
      },
      body: JSON.stringify({ message, sessionId, stream }),
    });

    res.writeHead(response.status, {
      "content-type": response.headers.get("content-type") || "application/json; charset=utf-8",
      "cache-control": "no-store",
    });

    if (response.body) {
      Readable.fromWeb(response.body).pipe(res);
      return true;
    }

    const text = await response.text();
    res.end(text);
    return true;
  } catch (error) {
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    return true;
  }
}

async function appendLeadLog(entry) {
  await mkdir(path.dirname(leadLogFile), { recursive: true });
  await appendFile(leadLogFile, `${JSON.stringify(entry, null, 0)}\n`, "utf8");
}

async function pushLeadToFeishu(entry) {
  const lines = [
    "收到一条新的 H5 留资线索",
    `姓名 / 称呼：${entry.name || "未填写"}`,
    `公司 / 品牌：${entry.company || "未填写"}`,
    `联系方式：${entry.contact || "未填写"}`,
    `需求简述：${entry.demand || "未填写"}`,
    `来源页面：${entry.page || "未知"}`,
    `提交时间：${entry.createdAt}`,
  ];

  const messageText = lines.join("\n");

  if (feishuWebhookUrl) {
    const response = await fetch(feishuWebhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        msg_type: "text",
        content: {
          text: messageText,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`飞书推送失败（${response.status}）`);
    }
    return;
  }

  if (feishuAppId && feishuAppSecret) {
    const tokenResponse = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        app_id: feishuAppId,
        app_secret: feishuAppSecret,
      }),
    });

    const tokenPayload = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || tokenPayload?.code !== 0 || !tokenPayload?.tenant_access_token) {
      throw new Error(tokenPayload?.msg || "飞书 tenant_access_token 获取失败。");
    }

    const receiveIdType = feishuTargetChatId ? "chat_id" : feishuTargetUserOpenId ? "open_id" : "";
    const receiveId = feishuTargetChatId || feishuTargetUserOpenId;

    if (!receiveIdType || !receiveId) {
      throw new Error("尚未配置飞书接收目标（chat_id 或 user open_id）。");
    }

    const sendResponse = await fetch(`https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=${receiveIdType}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${tokenPayload.tenant_access_token}`,
      },
      body: JSON.stringify({
        receive_id: receiveId,
        msg_type: "text",
        content: JSON.stringify({ text: messageText }),
      }),
    });

    const sendPayload = await sendResponse.json().catch(() => ({}));
    if (!sendResponse.ok || sendPayload?.code !== 0) {
      throw new Error(sendPayload?.msg || sendPayload?.error?.message || `飞书消息发送失败（${sendResponse.status}）`);
    }
    return;
  }

  throw new Error("尚未配置飞书 webhook 或飞书应用凭证。");
}

async function handleLeadSubmit(req, res) {
  try {
    const payload = await readJsonBody(req);
    const name = typeof payload?.name === "string" ? payload.name.trim() : "";
    const company = typeof payload?.company === "string" ? payload.company.trim() : "";
    const contact = typeof payload?.contact === "string" ? payload.contact.trim() : "";
    const demand = typeof payload?.demand === "string" ? payload.demand.trim() : "";
    const source = typeof payload?.source === "string" ? payload.source.trim() : "website";
    const page = typeof payload?.page === "string" ? payload.page.trim() : "";

    if (!contact || !demand) {
      res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "请至少填写联系方式和需求简述。" }));
      return true;
    }

    const entry = {
      name,
      company,
      contact,
      demand,
      source,
      page,
      createdAt: new Date().toISOString(),
    };

    await appendLeadLog(entry);
    await pushLeadToFeishu(entry);

    res.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(JSON.stringify({ ok: true }));
    return true;
  } catch (error) {
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "提交失败，请稍后再试。" }));
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

  if (req.method === "POST" && urlPath === "/api/lead/submit") {
    await handleLeadSubmit(req, res);
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

server.listen(port, "0.0.0.0", () => {
  console.log(`Local preview server running at http://127.0.0.1:${port}`);
  console.log(`Proxying OpenClaw chat from ${openClawOrigin}`);
});
