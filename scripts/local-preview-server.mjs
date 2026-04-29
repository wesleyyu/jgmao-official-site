import { createReadStream } from "node:fs";
import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { appendFile } from "node:fs/promises";
import { createDecipheriv, createHash } from "node:crypto";

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
const wechatAppId = process.env.WECHAT_APP_ID || "";
const wechatAppSecret = process.env.WECHAT_APP_SECRET || "";
const leadLogFile = process.env.LEAD_LOG_FILE || path.join(rootDir, "tmp", "lead-submissions.ndjson");
const publicSiteUrl = (process.env.PUBLIC_SITE_URL || "https://www.jgmao.com").replace(/\/$/, "");
const geoReportDir = process.env.GEO_REPORT_DIR || path.join(rootDir, "tmp", "geo-reports");
const geoOrderDir = process.env.GEO_ORDER_DIR || path.join(rootDir, "tmp", "geo-orders");
const wecomSupportLink = (process.env.WECOM_SUPPORT_LINK || "https://work.weixin.qq.com/u/vc111a7db585fe5798?v=5.0.7.68221&bb=2a039738e3").trim();
const wecomCorpId = process.env.WECOM_CORP_ID || "";
const wecomAgentId = process.env.WECOM_AGENT_ID || "";
const wecomAgentSecret = process.env.WECOM_AGENT_SECRET || "";
const wecomAgentUserId = process.env.WECOM_AGENT_USER_ID || "";
const wecomContactSecret = process.env.WECOM_CONTACT_SECRET || "";
const wecomCallbackToken = process.env.WECOM_CALLBACK_TOKEN || "";
const wecomCallbackAesKey = process.env.WECOM_CALLBACK_AES_KEY || "";
const wechatPayAppId = process.env.WECHAT_PAY_APP_ID || wechatAppId || "";
const wechatPayAppSecret = process.env.WECHAT_PAY_APP_SECRET || wechatAppSecret || "";
const wechatPayMchId = process.env.WECHAT_PAY_MCH_ID || "";
const wechatPayApiV2Key = process.env.WECHAT_PAY_API_V2_KEY || "";
const wechatPayNotifyUrl = process.env.WECHAT_PAY_NOTIFY_URL || "";
const wechatPayOauthBaseUrl = (process.env.WECHAT_PAY_OAUTH_BASE_URL || "").replace(/\/$/, "");
const wechatPayOauthCallbackPath = (process.env.WECHAT_PAY_OAUTH_CALLBACK_PATH || "/pay/wechat/callback/").trim() || "/pay/wechat/callback/";
const wechatPaySolutionPriceFen = Number(process.env.WECHAT_PAY_SOLUTION_PRICE_FEN || 9900);
const wechatPayStandardPriceFen = Number(process.env.WECHAT_PAY_STANDARD_PRICE_FEN || 129900);
const wecomAccessTokenCache = { value: "", expiresAt: 0 };

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

const themeStopTerms = new Set([
  "首页",
  "官网",
  "我们",
  "关于",
  "联系",
  "欢迎",
  "更多",
  "了解",
  "服务",
  "产品",
  "方案",
  "案例",
  "新闻",
  "博客",
  "文章",
  "详情",
  "home",
  "about",
  "contact",
  "service",
  "services",
  "product",
  "products",
  "solution",
  "solutions",
  "case",
  "cases",
  "blog",
  "news",
  "article",
  "articles",
  "details",
  "learn",
  "more",
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

function extractThemeTerms(...texts) {
  const source = texts.filter(Boolean).join(" ");
  if (!source) return [];
  const matches = source.match(/[\u4e00-\u9fff]{2,8}|[A-Za-z][A-Za-z0-9&+/\-]{3,}/g) || [];
  const terms = [];
  for (const match of matches) {
    const term = String(match || "").trim().toLowerCase();
    if (!term || themeStopTerms.has(term) || terms.includes(term)) continue;
    terms.push(term);
  }
  return terms.slice(0, 12);
}

function countQuestionSignals(text) {
  const source = String(text || "").slice(0, 6000);
  const patterns = [
    /问[:：]/gi,
    /Q[:：]/gi,
    /[？?]/g,
    /什么是/gi,
    /如何/gi,
    /为什么/gi,
    /是否/gi,
    /\bhow\b/gi,
    /\bwhat\b/gi,
    /\bwhy\b/gi,
    /\bwhen\b/gi,
    /\bwhere\b/gi,
    /\bcan\b/gi,
  ];
  return patterns.reduce((total, pattern) => total + ((source.match(pattern) || []).length), 0);
}

async function fetchHtml(url, timeoutMs = 10000) {
  if (!url || typeof url !== "string") return { finalUrl: "", html: "" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "user-agent": "JGMAO GEO Score Bot/1.0",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("fetch failed");
    return {
      finalUrl: response.url || url,
      html: await response.text(),
    };
  } finally {
    clearTimeout(timer);
  }
}

function extractCandidatePageUrls(homeHtml, finalUrl) {
  const parsed = new URL(finalUrl);
  const origin = parsed.origin;
  const hostname = parsed.hostname.toLowerCase();
  const candidates = [];
  const matches = Array.from(homeHtml.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi));

  for (const [, href = "", anchorHtml = ""] of matches) {
    let fullUrl = "";
    try {
      fullUrl = new URL(String(href).trim(), finalUrl).toString();
    } catch {
      continue;
    }
    let target;
    try {
      target = new URL(fullUrl);
    } catch {
      continue;
    }
    if (!["http:", "https:"].includes(target.protocol)) continue;
    if (target.hostname.toLowerCase() !== hostname) continue;
    if (target.hash) fullUrl = fullUrl.split("#", 1)[0];
    if (/\.(jpg|jpeg|png|gif|svg|webp|pdf|docx?|xlsx?|pptx?|zip)$/i.test(target.pathname || "")) continue;
    const anchorText = stripHtml(anchorHtml || "");
    const hint = `${target.pathname || ""} ${anchorText}`.toLowerCase();
    if (/(faq|常见问题|问答|case|案例|portfolio|work|insight|blog|news|article|洞察|报道|contact|联系我们)/i.test(hint)) {
      if (!candidates.includes(fullUrl)) candidates.push(fullUrl);
    }
  }

  for (const item of ["/faq", "/faq/", "/cases", "/cases/", "/case", "/case/", "/blog", "/blog/", "/insights", "/insights/", "/news", "/news/"]) {
    const fullUrl = new URL(item, origin).toString();
    if (!candidates.includes(fullUrl)) candidates.push(fullUrl);
  }

  return candidates.slice(0, 8);
}

async function collectSiteSamples(homeHtml, finalUrl) {
  const samples = [];
  for (const candidate of extractCandidatePageUrls(homeHtml, finalUrl)) {
    if (samples.length >= 4) break;
    try {
      const { finalUrl: sampleFinalUrl, html: sampleHtml } = await fetchHtml(candidate, 8000);
      const sampleText = stripHtml(sampleHtml);
      const signalText = `${sampleFinalUrl} ${sampleHtml.slice(0, 3000)} ${sampleText.slice(0, 3000)}`;
      samples.push({
        url: sampleFinalUrl,
        text: sampleText,
        signalText,
        faq: /(FAQPage|常见问题|常见问答|\bfaq\b|frequently asked questions)/i.test(signalText),
        contentAsset: /(案例|客户案例|洞察|白皮书|专题|blog|blogs|insights|portfolio|case stud(?:y|ies)|resources|knowledge|article|articles)/i.test(signalText),
        contact: /(400-\d{4}-\d{3}|@\w|联系电话|商务邮箱|联系我们|电话咨询|电话|邮箱|e-?mail|contact us|get in touch|call us|office)/i.test(signalText),
        cta: /(预约|咨询|提交需求|立即联系|联系我们|电话咨询|扫码|表单|demo|book|schedule|quote|contact us|get in touch|enquiry|enquire|start now)/i.test(signalText),
      });
    } catch {
      continue;
    }
  }
  return samples;
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

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalLength = 0;

    req.on("data", (chunk) => {
      chunks.push(chunk);
      totalLength += chunk.length;
      if (totalLength > 1024 * 1024) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });

    req.on("end", () => resolve(Buffer.concat(chunks)));
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

function buildGeoReportInviteState(token, previousInvite = {}, updatedAt = "") {
  const acceptedSiteKeys = (previousInvite.acceptedSiteKeys || []).filter((item) => typeof item === "string" && item.trim());
  const requiredCount = 2;
  const completedCount = acceptedSiteKeys.length;
  const unlocked = Boolean(previousInvite.unlocked) || completedCount >= requiredCount;
  return {
    requiredCount,
    completedCount,
    unlocked,
    inviteToken: token,
    inviteUrl: `${publicSiteUrl}/geo-score/?invite=${encodeURIComponent(token)}`,
    acceptedSiteKeys,
    updatedAt: updatedAt || previousInvite.updatedAt || "",
  };
}

function buildGeoReportWecomState(token, previousState = {}, updatedAt = "") {
  const claimToken = (typeof previousState.claimToken === "string" && previousState.claimToken.trim())
    ? previousState.claimToken.trim()
    : createHash("sha1").update(`${token}:${Date.now()}:${Math.random()}`, "utf8").digest("hex").slice(0, 24);
  const deliveredAt = typeof previousState.deliveredAt === "string" ? previousState.deliveredAt.trim() : "";
  const relationshipStatus = (typeof previousState.relationshipStatus === "string" && previousState.relationshipStatus.trim())
    ? previousState.relationshipStatus.trim()
    : "pending";
  let status = deliveredAt ? "delivered" : ((typeof previousState.status === "string" && previousState.status.trim()) || "pending");
  if (relationshipStatus === "removed") {
    status = "removed";
  }
  return {
    claimToken,
    status,
    deliveredAt,
    supportUrl: (typeof previousState.supportUrl === "string" && previousState.supportUrl.trim()) ? previousState.supportUrl.trim() : wecomSupportLink,
    configId: typeof previousState.configId === "string" ? previousState.configId.trim() : "",
    sourceType: (typeof previousState.sourceType === "string" && previousState.sourceType.trim()) ? previousState.sourceType.trim() : "static",
    welcomeSentAt: typeof previousState.welcomeSentAt === "string" ? previousState.welcomeSentAt.trim() : "",
    lastWelcomeCode: typeof previousState.lastWelcomeCode === "string" ? previousState.lastWelcomeCode.trim() : "",
    lastError: typeof previousState.lastError === "string" ? previousState.lastError.trim() : "",
    externalUserId: typeof previousState.externalUserId === "string" ? previousState.externalUserId.trim() : "",
    followUserId: typeof previousState.followUserId === "string" ? previousState.followUserId.trim() : "",
    relationshipStatus,
    unlockedAt: typeof previousState.unlockedAt === "string" ? previousState.unlockedAt.trim() : "",
    lastVerifiedAt: typeof previousState.lastVerifiedAt === "string" ? previousState.lastVerifiedAt.trim() : "",
    updatedAt: updatedAt || previousState.updatedAt || "",
  };
}

function isWecomContactReady() {
  return Boolean(wecomCorpId && wecomAgentSecret && wecomAgentUserId);
}

async function getWecomAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (wecomAccessTokenCache.value && wecomAccessTokenCache.expiresAt - 120 > now) {
    return wecomAccessTokenCache.value;
  }
  if (!wecomCorpId || !wecomAgentSecret) {
    throw new Error("企微自建应用参数未配置完整。");
  }
  const response = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${encodeURIComponent(wecomCorpId)}&corpsecret=${encodeURIComponent(wecomAgentSecret)}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.access_token) {
    throw new Error(payload?.errmsg || "企微 access_token 获取失败。");
  }
  wecomAccessTokenCache.value = String(payload.access_token);
  wecomAccessTokenCache.expiresAt = now + Number(payload.expires_in || 7200);
  return wecomAccessTokenCache.value;
}

async function postWecomJson(apiPath, payload) {
  const accessToken = await getWecomAccessToken();
  const response = await fetch(`https://qyapi.weixin.qq.com${apiPath}?access_token=${encodeURIComponent(accessToken)}`, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const parsed = await response.json().catch(() => ({}));
  if (!response.ok || Number(parsed?.errcode || 0) !== 0) {
    throw new Error(parsed?.errmsg || "企微接口调用失败。");
  }
  return parsed;
}

async function getWecomJson(apiPath, params = {}) {
  const accessToken = await getWecomAccessToken();
  const searchParams = new URLSearchParams({ access_token: accessToken });
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(String(key), String(value));
  });
  const response = await fetch(`https://qyapi.weixin.qq.com${apiPath}?${searchParams.toString()}`);
  const parsed = await response.json().catch(() => ({}));
  if (!response.ok || Number(parsed?.errcode || 0) !== 0) {
    throw new Error(parsed?.errmsg || "企微接口调用失败。");
  }
  return parsed;
}

async function resolveGeoReportWecomClaimToken(externalUserId, userId = "") {
  const externalId = typeof externalUserId === "string" ? externalUserId.trim() : "";
  const followUserId = typeof userId === "string" ? userId.trim() : "";
  if (!externalId) return "";
  const response = await getWecomJson("/cgi-bin/externalcontact/get", {
    external_userid: externalId,
  });
  const followUsers = Array.isArray(response?.follow_user)
    ? response.follow_user
    : (response?.follow_user && typeof response.follow_user === "object" ? [response.follow_user] : []);
  let fallbackState = "";
  for (const follow of followUsers) {
    if (!follow || typeof follow !== "object") continue;
    const stateValue = typeof follow.state === "string" ? follow.state.trim() : "";
    if (!stateValue) continue;
    const currentUserId = typeof follow.userid === "string" ? follow.userid.trim() : "";
    if (followUserId && currentUserId === followUserId) {
      return stateValue;
    }
    if (!fallbackState) {
      fallbackState = stateValue;
    }
  }
  return fallbackState;
}

async function findRecentGeoReportClaim(maxAgeMinutes = 60) {
  let files = [];
  try {
    files = await readdir(geoReportDir);
  } catch {
    return "";
  }
  const now = Date.now();
  const candidates = [];
  for (const filename of files) {
    if (!filename.endsWith(".json")) continue;
    try {
      const report = JSON.parse(await readFile(path.join(geoReportDir, filename), "utf8"));
      const wecomClaim = report?.wecomClaim || {};
      const claimToken = typeof wecomClaim.claimToken === "string" ? wecomClaim.claimToken.trim() : "";
      if (!claimToken) continue;
      const sourceType = typeof wecomClaim.sourceType === "string" ? wecomClaim.sourceType.trim() : "";
      if (sourceType !== "dynamic") continue;
      const updatedAt = String(report?.updatedAt || wecomClaim.updatedAt || report?.createdAt || report?.firstCreatedAt || "").trim();
      const updatedTime = new Date(updatedAt).getTime();
      if (!Number.isFinite(updatedTime)) continue;
      const ageMinutes = (now - updatedTime) / 60000;
      if (ageMinutes < 0 || ageMinutes > maxAgeMinutes) continue;
      candidates.push({ updatedTime, claimToken });
    } catch {
      continue;
    }
  }
  candidates.sort((a, b) => b.updatedTime - a.updatedTime);
  return candidates[0]?.claimToken || "";
}

async function ensureGeoReportWecomContactWay(report) {
  const claim = buildGeoReportWecomState(report.token || "", report.wecomClaim || {}, report.updatedAt || "");
  const existingUrl = String(claim.supportUrl || "").trim();
  const reportUrl = String(report?.reportUrl || "").trim();
  if (!isWecomContactReady()) {
    report.wecomClaim = claim;
    return claim;
  }
  if (String(claim.configId || "").trim() && existingUrl && existingUrl !== wecomSupportLink) {
    if (reportUrl) {
      try {
        await postWecomJson("/cgi-bin/externalcontact/update_contact_way", {
          config_id: String(claim.configId || "").trim(),
          conclusions: {
            text: {
              content: `你好，已为你准备好本次官网 GEO 详细报告：${reportUrl}`,
            },
          },
        });
        claim.lastError = "";
      } catch (error) {
        claim.lastError = error instanceof Error ? error.message : "企微联系我欢迎内容更新失败。";
      }
    }
    report.wecomClaim = claim;
    return claim;
  }
  try {
    const response = await postWecomJson("/cgi-bin/externalcontact/add_contact_way", {
      type: 1,
      scene: 2,
      style: 1,
      skip_verify: true,
      state: claim.claimToken || "",
      remark: `geo:${String(report.token || "").slice(0, 16)}`,
      user: [wecomAgentUserId],
      ...(reportUrl ? {
        conclusions: {
          text: {
            content: `你好，已为你准备好本次官网 GEO 详细报告：${reportUrl}`,
          },
        },
      } : {}),
    });
    claim.supportUrl = String(response.qr_code || "").trim() || existingUrl || wecomSupportLink;
    claim.configId = String(response.config_id || "").trim();
    claim.sourceType = "dynamic";
    claim.lastError = "";
  } catch (error) {
    claim.supportUrl = existingUrl || wecomSupportLink;
    claim.sourceType = "static";
    claim.lastError = error instanceof Error ? error.message : "企微联系我二维码创建失败。";
  }
  claim.updatedAt = report.updatedAt || claim.updatedAt || "";
  report.wecomClaim = claim;
  return claim;
}

async function sendWecomWelcomeMessage(welcomeCode, report) {
  const code = typeof welcomeCode === "string" ? welcomeCode.trim() : "";
  const reportUrl = String(report?.reportUrl || "").trim();
  if (!code || !reportUrl) {
    return false;
  }
  await postWecomJson("/cgi-bin/externalcontact/send_welcome_msg", {
    welcome_code: code,
    text: {
      content: `你好，已为你准备好本次官网 GEO 详细报告：${reportUrl}`,
    },
  });
  return true;
}

async function applyGeoReportInvite(inviteToken, currentReport, createdAt) {
  const token = typeof inviteToken === "string" ? inviteToken.trim() : "";
  if (!token) return null;
  if (token === (currentReport?.token || "")) {
    return { status: "self", invite: null };
  }

  let inviterReport;
  try {
    inviterReport = await readGeoReport(token);
  } catch {
    return { status: "missing", invite: null };
  }

  const inviterInput = inviterReport?.input || {};
  const inviterResult = inviterReport?.result || {};
  const currentInput = currentReport?.input || {};
  const currentResult = currentReport?.result || {};
  const inviterSiteKey = inviterReport?.siteKey || buildReportSiteKey(inviterInput.websiteUrl || inviterResult.checkedUrl || "");
  const currentSiteKey = currentReport?.siteKey || buildReportSiteKey(currentInput.websiteUrl || currentResult.checkedUrl || "");

  if (!currentSiteKey) {
    return { status: "invalid", invite: null };
  }
  if (inviterSiteKey && inviterSiteKey === currentSiteKey) {
    return { status: "self", invite: null };
  }

  const inviterContact = String(inviterInput.contact || "").trim().toLowerCase();
  const currentContact = String(currentInput.contact || "").trim().toLowerCase();
  if (inviterContact && currentContact && inviterContact === currentContact) {
    return { status: "self", invite: null };
  }

  const inviteState = buildGeoReportInviteState(token, inviterReport?.invite || {}, createdAt);
  if (inviteState.acceptedSiteKeys.includes(currentSiteKey)) {
    return { status: "duplicate", invite: inviteState };
  }

  inviteState.acceptedSiteKeys = [...inviteState.acceptedSiteKeys, currentSiteKey];
  inviteState.completedCount = inviteState.acceptedSiteKeys.length;
  inviteState.unlocked = inviteState.completedCount >= inviteState.requiredCount;
  inviteState.updatedAt = createdAt;
  inviterReport.invite = inviteState;
  inviterReport.updatedAt = createdAt;

  const filePath = path.join(geoReportDir, `${token}.json`);
  await mkdir(geoReportDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(inviterReport, null, 2), "utf8");
  return { status: "counted", invite: inviteState };
}

async function deliverGeoReportWecomClaim(claimToken, deliveredAt = "", externalUserId = "", followUserId = "") {
  const token = typeof claimToken === "string" ? claimToken.trim() : "";
  if (!token) {
    throw new Error("缺少企微领取 token。");
  }

  await mkdir(geoReportDir, { recursive: true });
  const entries = await readdir(geoReportDir);
  for (const fileName of entries) {
    if (!fileName.endsWith(".json")) continue;
    const filePath = path.join(geoReportDir, fileName);
    let report = null;
    try {
      report = JSON.parse(await readFile(filePath, "utf8"));
    } catch {
      continue;
    }
    const wecomClaim = report?.wecomClaim || {};
    if (String(wecomClaim.claimToken || "").trim() !== token) continue;
    const deliveredTime = deliveredAt || new Date().toISOString();
    report.wecomClaim = {
      ...buildGeoReportWecomState(report.token || "", wecomClaim, deliveredTime),
      status: "delivered",
      deliveredAt: deliveredTime,
      relationshipStatus: "active",
      unlockedAt: deliveredTime,
      lastVerifiedAt: deliveredTime,
      externalUserId: externalUserId || String(wecomClaim.externalUserId || "").trim(),
      followUserId: followUserId || String(wecomClaim.followUserId || "").trim(),
      updatedAt: deliveredTime,
    };
    report.updatedAt = deliveredTime;
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
    return report;
  }

  throw new Error("NOT_FOUND");
}

async function updateGeoReportWecomRelationship(externalUserId = "", followUserId = "", relationshipStatus = "removed") {
  const externalId = typeof externalUserId === "string" ? externalUserId.trim() : "";
  const userId = typeof followUserId === "string" ? followUserId.trim() : "";
  const nextStatus = typeof relationshipStatus === "string" && relationshipStatus.trim() ? relationshipStatus.trim() : "removed";
  if (!externalId) {
    throw new Error("缺少 external_user_id。");
  }
  await mkdir(geoReportDir, { recursive: true });
  const entries = await readdir(geoReportDir);
  for (const fileName of entries) {
    if (!fileName.endsWith(".json")) continue;
    const filePath = path.join(geoReportDir, fileName);
    let report = null;
    try {
      report = JSON.parse(await readFile(filePath, "utf8"));
    } catch {
      continue;
    }
    const wecomClaim = report?.wecomClaim || {};
    if (String(wecomClaim.externalUserId || "").trim() !== externalId) continue;
    if (userId && String(wecomClaim.followUserId || "").trim() !== userId) continue;
    const refreshedAt = new Date().toISOString();
    report.wecomClaim = {
      ...buildGeoReportWecomState(report.token || "", wecomClaim, refreshedAt),
      relationshipStatus: nextStatus,
      lastVerifiedAt: refreshedAt,
      status: nextStatus === "removed" ? "removed" : (String(wecomClaim.deliveredAt || "").trim() ? "delivered" : "pending"),
      updatedAt: refreshedAt,
    };
    report.updatedAt = refreshedAt;
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
    return report;
  }
  throw new Error("NOT_FOUND");
}

async function verifyGeoReportWecomRelationship(report, refreshAfterHours = 6) {
  const wecomClaim = report?.wecomClaim || {};
  const externalUserId = String(wecomClaim.externalUserId || "").trim();
  const followUserId = String(wecomClaim.followUserId || "").trim();
  const relationshipStatus = String(wecomClaim.relationshipStatus || "").trim() || "pending";
  const deliveredAt = String(wecomClaim.deliveredAt || "").trim();
  if (!externalUserId || !followUserId || !deliveredAt || relationshipStatus === "removed") {
    return report;
  }
  const lastVerifiedAt = String(wecomClaim.lastVerifiedAt || "").trim();
  if (lastVerifiedAt) {
    const verifiedTime = new Date(lastVerifiedAt).getTime();
    if (Number.isFinite(verifiedTime) && Date.now() - verifiedTime <= refreshAfterHours * 60 * 60 * 1000) {
      return report;
    }
  }
  try {
    const response = await getWecomJson("/cgi-bin/externalcontact/get", { external_userid: externalUserId });
    const followUsers = Array.isArray(response?.follow_user)
      ? response.follow_user
      : (response?.follow_user && typeof response.follow_user === "object" ? [response.follow_user] : []);
    const isActive = followUsers.some((item) => item && typeof item === "object" && String(item.userid || "").trim() === followUserId);
    const refreshedAt = new Date().toISOString();
    report.wecomClaim = {
      ...buildGeoReportWecomState(report.token || "", wecomClaim, refreshedAt),
      relationshipStatus: isActive ? "active" : "removed",
      lastVerifiedAt: refreshedAt,
      status: isActive ? "delivered" : "removed",
      updatedAt: refreshedAt,
    };
    report.updatedAt = refreshedAt;
    await writeGeoReport(report);
  } catch (error) {
    report.wecomClaim = {
      ...wecomClaim,
      lastError: error instanceof Error ? error.message : "企微关系校验失败。",
    };
  }
  return report;
}

function buildGeoReportAccessState(report = {}) {
  const wecomClaim = report?.wecomClaim || {};
  const relationshipStatus = String(wecomClaim.relationshipStatus || "").trim() || "pending";
  const deliveredAt = String(wecomClaim.deliveredAt || "").trim();
  const unlocked = Boolean(deliveredAt) && relationshipStatus !== "removed";
  if (unlocked) {
    return { locked: false, message: "" };
  }
  if (relationshipStatus === "removed") {
    return { locked: true, message: "你已不在当前企微客户关系中，请重新添加企微后继续查看详细报告。" };
  }
  return { locked: true, message: "添加企微后可继续查看详细报告。" };
}

function buildGeoReportLockedPayload(report = {}) {
  const result = report?.result || {};
  return {
    token: report?.token || "",
    createdAt: report?.createdAt || "",
    firstCreatedAt: report?.firstCreatedAt || "",
    updatedAt: report?.updatedAt || "",
    reportUrl: report?.reportUrl || "",
    siteKey: report?.siteKey || "",
    reportStatus: report?.reportStatus || "",
    unchangedWithin24h: Boolean(report?.unchangedWithin24h),
    input: report?.input || {},
    result: {
      score: Number(result?.score || 0),
      level: String(result?.level || ""),
      strengths: Array.isArray(result?.strengths) ? result.strengths : [],
      priorities: Array.isArray(result?.priorities) ? result.priorities : [],
      checkedUrl: String(result?.checkedUrl || ""),
    },
    wecomClaim: report?.wecomClaim || {},
  };
}

async function saveGeoReport(entry) {
  const token = buildReportToken(entry.websiteUrl || entry.result?.checkedUrl || "");
  const filePath = path.join(geoReportDir, `${token}.json`);
  let previous = {};

  try {
    previous = JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    previous = {};
  }

  const currentResult = entry.result || {};
  const reportExists = await stat(filePath).then(() => true).catch(() => false);
  const currentSnapshot = {
    createdAt: entry.createdAt,
    score: currentResult.score || 0,
    level: currentResult.level || "",
    checkedUrl: currentResult.checkedUrl || entry.websiteUrl || "",
    dimensions: (currentResult.dimensions || []).map((item) => ({
      key: item.key,
      title: item.title,
      score: item.score || 0,
        })),
  };

  const resultFingerprint = createHash("sha1")
    .update(
      JSON.stringify(
        {
          score: currentSnapshot.score,
          level: currentSnapshot.level,
          checkedUrl: currentSnapshot.checkedUrl,
          dimensions: currentSnapshot.dimensions,
        },
        null,
        0,
      ),
      "utf8",
    )
    .digest("hex");
  const previousFingerprint = previous.resultFingerprint || "";
  const previousUpdatedAt = previous.updatedAt || previous.createdAt || previous.firstCreatedAt || "";
  const currentTime = new Date(entry.createdAt).getTime();
  const previousTime = new Date(previousUpdatedAt).getTime();
  const sameWithin24Hours =
    reportExists
    && previousFingerprint
    && previousFingerprint === resultFingerprint
    && !Number.isNaN(currentTime)
    && !Number.isNaN(previousTime)
    && currentTime - previousTime <= 24 * 60 * 60 * 1000;

  if (sameWithin24Hours) {
    const refreshedReport = {
      ...previous,
      updatedAt: entry.createdAt,
      reportUrl: previous.reportUrl || `${publicSiteUrl}/geo-report/${token}/`,
      input: {
        ...(previous.input || {}),
        name: entry.name || "",
        company: entry.company || "",
        contact: entry.contact || "",
        websiteUrl: entry.websiteUrl || "",
        source: entry.source || "",
        page: entry.page || "",
      },
      reportStatus: "unchanged",
      unchangedWithin24h: true,
    };
    refreshedReport.invite = buildGeoReportInviteState(token, previous.invite || {}, entry.createdAt);
    refreshedReport.wecomClaim = buildGeoReportWecomState(token, previous.wecomClaim || {}, entry.createdAt);
    await ensureGeoReportWecomContactWay(refreshedReport);
    await mkdir(geoReportDir, { recursive: true });
    await writeFile(filePath, JSON.stringify(refreshedReport, null, 2), "utf8");
    return refreshedReport;
  }

  const previousHistory = Array.isArray(previous.history) ? previous.history : [];
  const filteredHistory = previousHistory.filter((item) => item?.createdAt !== currentSnapshot.createdAt);
  const history = [...filteredHistory, currentSnapshot].slice(-20);
  const report = {
    token,
    type: "geo-score",
    createdAt: entry.createdAt,
    firstCreatedAt: previous.firstCreatedAt || entry.createdAt,
    updatedAt: entry.createdAt,
    reportUrl: `${publicSiteUrl}/geo-report/${token}/`,
    siteKey: buildReportSiteKey(entry.websiteUrl || currentResult.checkedUrl || ""),
    input: {
      name: entry.name || "",
      company: entry.company || "",
      contact: entry.contact || "",
      websiteUrl: entry.websiteUrl || "",
      source: entry.source || "",
      page: entry.page || "",
    },
    result: currentResult,
    history,
    resultFingerprint,
  };
  report.invite = buildGeoReportInviteState(token, previous.invite || {}, entry.createdAt);
  report.wecomClaim = buildGeoReportWecomState(token, previous.wecomClaim || {}, entry.createdAt);
  await ensureGeoReportWecomContactWay(report);

  await mkdir(geoReportDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
  return {
    ...report,
    reportStatus: reportExists ? "updated" : "new",
    unchangedWithin24h: false,
  };
}

async function readGeoReport(token) {
  const filePath = path.join(geoReportDir, `${token}.json`);
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeGeoReport(report) {
  await mkdir(geoReportDir, { recursive: true });
  const filePath = path.join(geoReportDir, `${report.token}.json`);
  await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
}

function buildWecomCallbackStatus() {
  return {
    corpIdReady: Boolean(wecomCorpId),
    agentReady: Boolean(wecomAgentId && wecomAgentSecret && wecomAgentUserId),
    contactReady: isWecomContactReady(),
    callbackCryptoReady: Boolean(wecomCallbackToken && wecomCallbackAesKey),
  };
}

function verifyWecomSignature(msgSignature, timestamp, nonce, encrypted) {
  const expected = createHash("sha1")
    .update([wecomCallbackToken, timestamp || "", nonce || "", encrypted || ""].sort().join(""), "utf8")
    .digest("hex");
  return expected === String(msgSignature || "");
}

function pkcs7Unpad(buffer) {
  if (!buffer?.length) {
    throw new Error("企微回调解密失败：空数据。");
  }
  const pad = buffer[buffer.length - 1];
  if (pad < 1 || pad > 32) {
    throw new Error("企微回调解密失败：填充长度无效。");
  }
  for (let index = buffer.length - pad; index < buffer.length; index += 1) {
    if (buffer[index] !== pad) {
      throw new Error("企微回调解密失败：填充校验失败。");
    }
  }
  return buffer.subarray(0, buffer.length - pad);
}

function decryptWecomCiphertext(encrypted) {
  if (!wecomCallbackAesKey) {
    throw new Error("企微回调未配置 EncodingAESKey。");
  }
  const aesKey = Buffer.from(`${wecomCallbackAesKey}=`, "base64");
  const iv = aesKey.subarray(0, 16);
  const cipherText = Buffer.from(String(encrypted || ""), "base64");
  const decipher = createDecipheriv("aes-256-cbc", aesKey, iv);
  decipher.setAutoPadding(false);
  const decrypted = Buffer.concat([decipher.update(cipherText), decipher.final()]);
  const plain = pkcs7Unpad(decrypted);
  if (plain.length < 20) {
    throw new Error("企微回调解密失败：明文长度异常。");
  }
  const content = plain.subarray(16);
  const msgLength = content.readUInt32BE(0);
  const messageBuffer = content.subarray(4, 4 + msgLength);
  const receiveId = content.subarray(4 + msgLength).toString("utf8");
  if (wecomCorpId && receiveId && receiveId !== wecomCorpId) {
    throw new Error("企微回调校验失败：企业 ID 不匹配。");
  }
  return messageBuffer.toString("utf8");
}

const planOrderMeta = {
  solution: {
    title: "官网 GEO 优化方案",
    priceFen: wechatPaySolutionPriceFen,
  },
  standard: {
    title: "坚果猫AI增长引擎标准版",
    priceFen: wechatPayStandardPriceFen,
  },
};

function formatPriceLabel(amountFen, planKey) {
  const amount = Number(amountFen || 0) / 100;
  const amountText = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${amountText}元${planKey === "solution" ? "/次" : "/月"}`;
}

function buildGeoOrderNo(planKey) {
  const prefix = planKey === "solution" ? "JGS" : "JGP";
  return `${prefix}${new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14)}${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

function isWechatPayReady() {
  return Boolean(
    wechatPayAppId
      && wechatPayMchId
      && wechatPayApiV2Key
      && wechatPayNotifyUrl,
  );
}

async function createGeoPlanOrder({ planKey = "solution", reportToken = "", source = "geo-upgrade", page = "/geo-upgrade/" }) {
  if (!planOrderMeta[planKey]) {
    throw new Error("暂不支持的方案类型。");
  }

  const paidOrder = await findPaidGeoPlanOrder(planKey, reportToken);
  if (paidOrder) {
    paidOrder.paymentMessage = "本次官网 GEO 优化方案已支付，可直接查看交付页。";
    paidOrder.planUrl = buildGeoPlanUrlForOrder(paidOrder);
    return paidOrder;
  }

  let report = null;
  if (reportToken) {
    try {
      report = await readGeoReport(reportToken);
    } catch {
      report = null;
    }
  }

  const meta = planOrderMeta[planKey];
  const buyer = report?.input || {};
  const checkedUrl = report?.result?.checkedUrl || buyer.websiteUrl || "";
  const paymentReady = isWechatPayReady();
  const createdAt = new Date().toISOString();
  const order = {
    orderNo: buildGeoOrderNo(planKey),
    planKey,
    planTitle: meta.title,
    amountFen: meta.priceFen,
    amountLabel: formatPriceLabel(meta.priceFen, planKey),
    status: "created",
    paymentStatus: paymentReady ? "ready" : "not_configured",
    paymentMessage: paymentReady
      ? "订单已创建，微信支付已准备就绪，可继续完成支付。"
      : "订单已创建，当前微信支付商户参数尚未接入，先保留订单信息，支付打通后可直接使用。",
    source: source || "geo-upgrade",
    page: page || "/geo-upgrade/",
    reportToken: reportToken || "",
    reportUrl: report?.reportUrl || "",
    websiteUrl: buyer.websiteUrl || checkedUrl,
    company: buyer.company || "",
    contact: buyer.contact || "",
    createdAt,
    updatedAt: createdAt,
  };

  await mkdir(geoOrderDir, { recursive: true });
  await writeFile(path.join(geoOrderDir, `${order.orderNo}.json`), JSON.stringify(order, null, 2), "utf8");
  return order;
}

async function readGeoOrder(orderNo) {
  return JSON.parse(await readFile(path.join(geoOrderDir, `${orderNo}.json`), "utf8"));
}

async function writeGeoOrder(order) {
  await mkdir(geoOrderDir, { recursive: true });
  await writeFile(path.join(geoOrderDir, `${order.orderNo}.json`), JSON.stringify(order, null, 2), "utf8");
}

function buildWechatPaySign(params) {
  const sortedKeys = Object.keys(params)
    .filter((key) => key !== "sign" && params[key] !== undefined && params[key] !== null && String(params[key]) !== "")
    .sort();
  const base = `${sortedKeys.map((key) => `${key}=${params[key]}`).join("&")}&key=${wechatPayApiV2Key}`;
  return createHash("md5").update(base, "utf8").digest("hex").toUpperCase();
}

function buildWechatPayXml(params) {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && String(value) !== "")
    .map(([key, value]) => `<${key}><![CDATA[${String(value)}]]></${key}>`)
    .join("");
  return `<xml>${entries}</xml>`;
}

function parseWechatXml(xmlText) {
  const result = {};
  const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>|<(\w+)>(.*?)<\/\3>/gs;
  let match = regex.exec(xmlText);
  while (match) {
    if (match[1]) {
      result[match[1]] = match[2] || "";
    } else if (match[3]) {
      result[match[3]] = match[4] || "";
    }
    match = regex.exec(xmlText);
  }
  return result;
}

function isWechatBrowser(req) {
  const userAgent = String(req.headers["user-agent"] || "");
  return /MicroMessenger/i.test(userAgent);
}

function requestOrigin(req) {
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const proto = forwardedProto || (String(req.socket.encrypted ? "https" : "http"));
  const host = String(req.headers.host || `127.0.0.1:${port}`);
  return `${proto}://${host}`;
}

function sanitizePayReturnUrl(value, fallback, req) {
  const fallbackUrl = fallback || `${requestOrigin(req)}/geo-upgrade/?paid=1`;
  if (!value) return fallbackUrl;
  try {
    const parsed = new URL(value, requestOrigin(req));
    if (!["http:", "https:"].includes(parsed.protocol)) return fallbackUrl;
    return parsed.toString();
  } catch {
    return fallbackUrl;
  }
}

async function fetchWechatOauthOpenId(code) {
  const response = await fetch(
    `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${encodeURIComponent(wechatPayAppId)}&secret=${encodeURIComponent(wechatPayAppSecret)}&code=${encodeURIComponent(code)}&grant_type=authorization_code`,
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.openid) {
    throw new Error(payload?.errmsg || "微信授权换取 openid 失败。");
  }
  return payload.openid;
}

async function createWechatJsapiParams(order, openid, req) {
  const nonceStr = Math.random().toString(36).slice(2, 18);
  const ipRaw = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();
  const spbillCreateIp = ipRaw.includes(":") ? "127.0.0.1" : ipRaw;
  const params = {
    appid: wechatPayAppId,
    mch_id: wechatPayMchId,
    nonce_str: nonceStr,
    body: order.planTitle,
    out_trade_no: order.orderNo,
    total_fee: String(order.amountFen),
    spbill_create_ip: spbillCreateIp || "127.0.0.1",
    notify_url: wechatPayNotifyUrl,
    trade_type: "JSAPI",
    openid,
  };
  const sign = buildWechatPaySign(params);
  const xml = buildWechatPayXml({ ...params, sign });
  const response = await fetch("https://api.mch.weixin.qq.com/pay/unifiedorder", {
    method: "POST",
    headers: { "content-type": "text/xml; charset=utf-8" },
    body: xml,
  });
  const xmlText = await response.text();
  const payload = parseWechatXml(xmlText);
  if (!response.ok || payload.return_code !== "SUCCESS" || payload.result_code !== "SUCCESS" || !payload.prepay_id) {
    throw new Error(`微信统一下单失败：${payload.err_code_des || payload.err_code || payload.return_msg || "微信统一下单失败。"}`);
  }
  const payNonceStr = Math.random().toString(36).slice(2, 18);
  const timeStamp = String(Math.floor(Date.now() / 1000));
  const payParams = {
    appId: wechatPayAppId,
    timeStamp,
    nonceStr: payNonceStr,
    package: `prepay_id=${payload.prepay_id}`,
    signType: "MD5",
  };
  const paySign = buildWechatPaySign(payParams);
  return { ...payParams, paySign, prepayId: payload.prepay_id };
}

async function prepareWechatJsapiPayment(orderNo, returnUrl, code, req) {
  if (!orderNo) {
    throw new Error("缺少订单编号。");
  }
  if (!code) {
    throw new Error("缺少微信授权 code。");
  }
  if (!isWechatPayReady()) {
    throw new Error("微信支付商户参数尚未配置完成。");
  }

  const order = await readGeoOrder(orderNo);
  const openid = await fetchWechatOauthOpenId(code);
  const payParams = await createWechatJsapiParams(order, openid, req);
  order.openid = openid;
  order.prepayId = payParams.prepayId || "";
  order.updatedAt = new Date().toISOString();
  await writeGeoOrder(order);
  return { order, payParams, returnUrl };
}

function buildWechatJsapiPayHtml({ order, payParams, successUrl, errorMessage = "" }) {
  const successUrlJson = JSON.stringify(successUrl || "");
  const escapedError = errorMessage.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const payReady = Boolean(payParams.appId && payParams.timeStamp && payParams.nonceStr && payParams.package && payParams.paySign);
  const buttonHtml = payReady
    ? `<button class="btn" onclick="invokePay()">立即完成支付</button>`
    : `<button class="btn" type="button" disabled style="opacity:.45;cursor:not-allowed">暂时无法拉起支付</button>`;
  const helperText = payReady
    ? `如果支付没有自动弹出，可点击上方按钮再次发起。`
    : `支付初始化未完成，请根据下方提示检查配置后再试。`;
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>微信支付获取</title>
    <style>
      body{margin:0;background:#071224;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
      .card{max-width:420px;width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:28px;padding:28px;box-shadow:0 24px 80px rgba(2,8,23,.45)}
      .tag{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#8be9fd}
      h1{margin:14px 0 0;font-size:28px}
      p{line-height:1.8;color:#d6deeb}
      .meta{margin-top:18px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}
      .btn{margin-top:20px;width:100%;border:none;border-radius:999px;background:#2dd4bf;color:#04111d;padding:14px 16px;font-size:15px;font-weight:700}
      .muted{margin-top:12px;font-size:13px;color:#94a3b8}
      .error{margin-top:14px;color:#fecaca}
    </style>
  </head>
  <body>
    <div class="card">
      <div class="tag">微信支付获取</div>
      <h1>${order.planTitle}</h1>
      <div class="meta">订单编号：${order.orderNo}<br/>支付金额：${order.amountLabel}</div>
      <p>即将拉起微信支付。支付完成后，将自动返回方案页面继续查看结果。</p>
      ${buttonHtml}
      <div class="muted">${helperText}</div>
      ${escapedError ? `<div class="error">${escapedError}</div>` : ""}
    </div>
    <script>
      function onPayResult(res){
        if(res && res.err_msg === 'get_brand_wcpay_request:ok'){
          window.location.href = ${successUrlJson};
          return;
        }
        document.querySelector('.error')?.remove();
        const div = document.createElement('div');
        div.className = 'error';
        div.textContent = '支付未完成：' + ((res && res.err_msg) || 'unknown');
        document.querySelector('.card').appendChild(div);
      }
      function invokePay(){
        if(!${payReady ? "true" : "false"}){
          return;
        }
        if(!window.WeixinJSBridge){
          document.addEventListener('WeixinJSBridgeReady', invokePay, { once: true });
          return;
        }
        window.WeixinJSBridge.invoke('getBrandWCPayRequest', {
          appId: '${payParams.appId}',
          timeStamp: '${payParams.timeStamp}',
          nonceStr: '${payParams.nonceStr}',
          package: '${payParams.package}',
          signType: '${payParams.signType}',
          paySign: '${payParams.paySign}'
        }, onPayResult);
      }
      invokePay();
    </script>
  </body>
</html>`;
}

function reportDomainFromUrl(value) {
  if (!value) return "";
  try {
    return new URL(value).hostname;
  } catch {
    return String(value || "");
  }
}

function geoReportTitleText(report) {
  const company = report?.input?.company?.trim();
  if (company) return `${company}官网 GEO 详细诊断报告`;
  const domain = reportDomainFromUrl(report?.result?.checkedUrl || report?.input?.websiteUrl);
  if (domain) return `${domain} GEO 详细诊断报告`;
  return "企业官网 GEO 详细诊断报告";
}

function geoPlanTitleText(report) {
  const company = report?.input?.company?.trim();
  if (company) return `${company}官网 GEO 优化方案`;
  const domain = reportDomainFromUrl(report?.result?.checkedUrl || report?.input?.websiteUrl);
  if (domain) return `${domain} GEO 优化方案`;
  return "企业官网 GEO 优化方案";
}

function buildGeoReportShareHtml(report, token) {
  const title = geoReportTitleText(report);
  const description = "查看官网在抓取、主题结构、AI 可见性、内容资产与承接转化等维度的详细诊断结果。";
  const shareUrl = `${publicSiteUrl}/api/lead/submit?share=geo-report&token=${encodeURIComponent(token)}`;
  const reportUrl = `${publicSiteUrl}/geo-report/${token}/`;
  const imageUrl = `${publicSiteUrl}/geo-score-share-cover.png`;
  const escapedTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapedDescription = description.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapedShareUrl = shareUrl.replace(/&/g, "&amp;");
  const escapedImageUrl = imageUrl.replace(/&/g, "&amp;");
  const escapedReportUrl = reportUrl.replace(/&/g, "&amp;");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}" />
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <link rel="canonical" href="${escapedShareUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:image" content="${escapedImageUrl}" />
    <meta property="og:url" content="${escapedShareUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <meta name="twitter:image" content="${escapedImageUrl}" />
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at top, #0f2d57 0%, #071224 42%, #040812 100%);
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Helvetica Neue", sans-serif;
      }
      .card {
        width: min(92vw, 460px);
        padding: 28px 24px;
        border-radius: 24px;
        border: 1px solid rgba(125, 211, 252, 0.18);
        background: rgba(8, 15, 31, 0.86);
        box-shadow: 0 24px 90px rgba(2, 6, 23, 0.48);
      }
      .label {
        display: inline-flex;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.14);
        color: #bae6fd;
        font-size: 13px;
        letter-spacing: 0.02em;
      }
      h1 { margin: 16px 0 10px; font-size: 28px; line-height: 1.18; }
      p { margin: 0; color: rgba(226, 232, 240, 0.88); line-height: 1.7; font-size: 15px; }
      a {
        display: inline-flex;
        margin-top: 22px;
        padding: 12px 18px;
        border-radius: 999px;
        background: linear-gradient(135deg, #38bdf8, #2563eb);
        color: white;
        text-decoration: none;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <span class="label">企业官网 GEO 详细诊断报告</span>
      <h1>${escapedTitle}</h1>
      <p>${escapedDescription}</p>
      <a href="${escapedReportUrl}">正在打开详细报告</a>
    </main>
    <script>
      window.setTimeout(function () {
        window.location.replace(${JSON.stringify(reportUrl)});
      }, 120);
    </script>
  </body>
</html>`;
}

function buildGeoPlanShareHtml(report, token) {
  const title = geoPlanTitleText(report);
  const description = "查看官网在首页主题、FAQ 体系、专题页、结构化数据与承接路径等方面的具体优化方案。";
  const shareUrl = `${publicSiteUrl}/geo-plan-share/${encodeURIComponent(token)}/`;
  const planUrl = `${publicSiteUrl}/geo-plan/${token}/`;
  const imageUrl = `${publicSiteUrl}/geo-score-share-cover.png`;
  const escapedTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapedDescription = description.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapedShareUrl = shareUrl.replace(/&/g, "&amp;");
  const escapedImageUrl = imageUrl.replace(/&/g, "&amp;");
  const escapedPlanUrl = planUrl.replace(/&/g, "&amp;");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}" />
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <link rel="canonical" href="${escapedShareUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:image" content="${escapedImageUrl}" />
    <meta property="og:url" content="${escapedShareUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <meta name="twitter:image" content="${escapedImageUrl}" />
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at top, #0f2d57 0%, #071224 42%, #040812 100%);
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Helvetica Neue", sans-serif;
      }
      .card {
        width: min(92vw, 460px);
        padding: 28px 24px;
        border-radius: 24px;
        border: 1px solid rgba(125, 211, 252, 0.18);
        background: rgba(8, 15, 31, 0.86);
        box-shadow: 0 24px 90px rgba(2, 6, 23, 0.48);
      }
      .label {
        display: inline-flex;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.14);
        color: #bae6fd;
        font-size: 13px;
        letter-spacing: 0.02em;
      }
      h1 { margin: 16px 0 10px; font-size: 28px; line-height: 1.18; }
      p { margin: 0; color: rgba(226, 232, 240, 0.88); line-height: 1.7; font-size: 15px; }
      a {
        display: inline-flex;
        margin-top: 22px;
        padding: 12px 18px;
        border-radius: 999px;
        background: linear-gradient(135deg, #38bdf8, #2563eb);
        color: white;
        text-decoration: none;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <span class="label">企业官网 GEO 优化方案</span>
      <h1>${escapedTitle}</h1>
      <p>${escapedDescription}</p>
      <a href="${escapedPlanUrl}">正在打开优化方案</a>
    </main>
    <script>
      window.setTimeout(function () {
        window.location.replace(${JSON.stringify(planUrl)});
      }, 120);
    </script>
  </body>
</html>`;
}

async function countGeoScoreEntries() {
  try {
    const content = await readFile(leadLogFile, "utf8");
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .reduce((total, line) => {
        try {
          const entry = JSON.parse(line);
          return entry?.type === "geo-score" ? total + 1 : total;
        } catch {
          return total;
        }
      }, 0);
  } catch {
    return 0;
  }
}

function normalizeWebsiteUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    throw new Error("请填写官网网址。");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (!/^https?:$/i.test(parsed.protocol)) {
      throw new Error();
    }
    return parsed.toString();
  } catch {
    throw new Error("官网网址格式不正确，请检查后再试。");
  }
}

function buildReportSiteKey(value) {
  const normalized = normalizeWebsiteUrl(value);
  const parsed = new URL(normalized);
  let hostname = (parsed.hostname || "").toLowerCase();
  if (hostname.startsWith("www.")) {
    hostname = hostname.slice(4);
  }
  const port = parsed.port ? Number(parsed.port) : 0;
  if (port && port !== 80 && port !== 443) {
    hostname = `${hostname}:${port}`;
  }
  return hostname || normalized.toLowerCase();
}

function buildReportToken(value) {
  return createHash("sha1").update(buildReportSiteKey(value), "utf8").digest("hex").slice(0, 24);
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTagContent(html, pattern) {
  const match = html.match(pattern);
  return match?.[1]?.trim() || "";
}

const dimensionMeta = {
  crawl: {
    title: "抓取与索引基础",
    advice: "优先补齐 HTTPS、canonical、robots.txt 与 sitemap.xml，确保官网地址规范、抓取稳定、可被搜索与 AI 系统持续发现。",
  },
  theme: {
    title: "主题结构与页面语义",
    advice: "集中首页主题表达，补齐 H1、标题、描述和更清晰的页面语义，让 AI 与用户都能更快理解官网重点。",
  },
  ai: {
    title: "AI 可见性信号",
    advice: "继续完善 FAQ、结构化数据与分享语义，增强内容被 AI 理解、抽取、引用与推荐的稳定性。",
  },
  content: {
    title: "内容资产与 FAQ 体系",
    advice: "继续补齐 FAQ、案例、专题页与洞察栏目，让内容形成可复用、可沉淀、可持续扩展的资产体系。",
  },
  convert: {
    title: "承接路径与转化能力",
    advice: "强化电话、企微、表单与 CTA 等高意向承接入口，让官网不只被看见，也能有效承接咨询动作。",
  },
  trust: {
    title: "品牌可信度与信任信号",
    advice: "继续补齐公司信息、备案资质、客户背书与媒体报道等信任信号，增强官网的可信度与商务说服力。",
  },
};

function buildDetailedScore(metrics, finalUrl) {
  const totalWeight = metrics.reduce((sum, item) => sum + item.weight, 0);
  const rawScore = metrics.reduce((sum, item) => sum + (item.ok ? item.weight : 0), 0);
  const score = totalWeight ? Math.round((rawScore / totalWeight) * 100) : 0;

  const strengths = metrics.filter((item) => item.ok).map((item) => item.positive).slice(0, 3);
  const priorities = metrics.filter((item) => !item.ok).map((item) => item.negative).slice(0, 3);

  const grouped = metrics.reduce((acc, item) => {
    acc[item.dimension] ||= [];
    acc[item.dimension].push(item);
    return acc;
  }, {});

  const dimensionOrder = ["crawl", "theme", "ai", "content", "convert", "trust"];
  const dimensions = Object.entries(grouped).map(([key, items]) => {
    const maxScore = items.reduce((sum, item) => sum + item.weight, 0);
    const dimensionScore = items.reduce((sum, item) => sum + (item.ok ? item.weight : 0), 0);
    return {
      key,
      title: dimensionMeta[key]?.title || key,
      score: maxScore ? Math.round((dimensionScore / maxScore) * 100) : 0,
      rawScore: dimensionScore,
      maxScore,
      items: items.map((item) => ({
        key: item.key,
        label: item.label,
        ok: item.ok,
        weight: item.weight,
        positive: item.positive,
        negative: item.negative,
      })),
    };
  });

  dimensions.sort((a, b) => {
    const ai = dimensionOrder.indexOf(a.key);
    const bi = dimensionOrder.indexOf(b.key);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const deepAdvice = dimensions
    .filter((dimension) => dimension.score < 100)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((dimension, index) => ({
      priority: index + 1,
      title: dimension.title,
      summary: dimensionMeta[dimension.key]?.advice || "建议继续补齐这一维度的基础能力。",
    }));

  return {
    score,
    level: getScoreLevel(score),
    strengths: strengths.length ? strengths : ["官网已有一定基础，可以继续强化 GEO 结构与承接路径。"],
    priorities: priorities.length ? priorities : ["建议继续扩大 FAQ、专题页与结构化数据覆盖，进一步提升 GEO 表现。"],
    checkedUrl: finalUrl,
    dimensions,
    deepAdvice,
  };
}

async function checkRemoteFile(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "user-agent": "JGMAO GEO Score Bot/1.0",
      },
      redirect: "follow",
    });
    return response.ok;
  } catch {
    return false;
  }
}

function analyzeHomepage(html, finalUrl, sampledPages = []) {
  const title = extractTagContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescription = extractTagContent(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || extractTagContent(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const canonical = extractTagContent(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || extractTagContent(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const h1 = extractTagContent(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const hasOgTitle = /property=["']og:title["']/i.test(html);
  const hasOgDescription = /property=["']og:description["']/i.test(html);
  const contactSignal = /(400-\d{4}-\d{3}|@\w|联系电话|商务邮箱|联系我们|电话咨询|电话|邮箱|e-?mail|contact us|get in touch|call us|office)/i.test(html);
  const hasContentAssets = /(案例|客户案例|新闻|洞察|blog|blogs|insights|专题|白皮书|报告|FAQ|常见问题|portfolio|case stud(?:y|ies)|resources|knowledge|article|articles)/i.test(html)
    || sampledPages.some((item) => item?.contentAsset);
  const hasCtaSignal = /(预约|咨询|提交需求|立即联系|联系我们|电话咨询|扫码|表单|demo|book|schedule|quote|contact us|get in touch|enquiry|enquire|start now)/i.test(html);
  const hasCompanySignal = /(有限公司|公司地址|地址[:：]|北京市|商务邮箱|联系电话|电话|邮箱|e-?mail|service@|400-\d{4}-\d{3}|copyright|all rights reserved|about us|关于我们|studio|office|company)/i.test(html);
  const hasTrustSignal = /(高新技术企业|新华社|备案|ICP备|icp备|公网安备|许可证|license|certification|iso|认证|资质|奖项|award|awards|PICC|奥迪|沃尔沃|壳牌|美孚|中国平安|人民日报|客户案例|设计案例|合作客户|服务客户|合作伙伴|媒体报道|trusted by|featured in)/i.test(html);
  const contentText = stripHtml(html);
  const hasRelevantStructuredData = /"@type"\s*:\s*"(Organization|Corporation|LocalBusiness|WebSite|FAQPage|Article|NewsArticle|BlogPosting|BreadcrumbList)"/i.test(html);
  const faqHeadingSignal = /(FAQPage|常见问题|常见问答|\bfaq\b|frequently asked questions)/i.test(html);
  const questionSignalCount = countQuestionSignals(contentText);
  const themeTerms = extractThemeTerms(title, h1);
  const themeContext = [title, metaDescription, h1, contentText.slice(0, 1600)].join(" ").toLowerCase();
  const hasThemeFocus = Boolean(themeTerms.length && themeTerms.some((term) => {
    const matches = themeContext.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"));
    return (matches || []).length >= 2;
  }));
  const contactSignalWithSamples = contactSignal || sampledPages.some((item) => item?.contact);
  const hasCtaSignalWithSamples = hasCtaSignal || sampledPages.some((item) => item?.cta);
  const hasTopicDepth = contentText.length >= 1200
    || sampledPages.reduce((total, item) => total + Math.min(String(item?.text || "").trim().length, 2000), 0) >= 1200;
  const hasFaqSignal = /FAQPage/i.test(html) || (faqHeadingSignal && questionSignalCount >= 2) || sampledPages.some((item) => item?.faq);

  const metrics = [
    { ok: finalUrl.startsWith("https://"), weight: 8, positive: "已启用 HTTPS，基础可信度较好。", negative: "建议优先确保官网全站使用 HTTPS。", key: "https", label: "HTTPS", dimension: "crawl" },
    { ok: title.length >= 8 && title.length <= 65, weight: 6, positive: "页面标题长度较合适。", negative: "页面标题过短或过长，建议优化标题表达。", key: "title", label: "Title 标题长度", dimension: "theme" },
    { ok: metaDescription.length >= 30 && metaDescription.length <= 180, weight: 6, positive: "已配置较完整的 meta description。", negative: "缺少清晰的 meta description。", key: "description", label: "Meta Description", dimension: "theme" },
    { ok: Boolean(h1), weight: 6, positive: "首页已有明确 H1 主题。", negative: "首页缺少明确 H1，主题表达不够集中。", key: "h1", label: "首页 H1", dimension: "theme" },
    { ok: hasThemeFocus, weight: 6, positive: "首页主题关键词较集中，页面语义比较明确。", negative: "首页主题关键词分散，建议收紧主题表达与页面语义。", key: "theme-focus", label: "主题聚焦度", dimension: "theme" },
    { ok: Boolean(canonical), weight: 7, positive: "已配置 canonical 规范地址。", negative: "建议补 canonical，减少重复地址干扰。", key: "canonical", label: "Canonical", dimension: "crawl" },
    { ok: hasOgTitle && hasOgDescription, weight: 5, positive: "社交分享标题与描述较完整。", negative: "建议补全 og:title / og:description。", key: "og", label: "OG 分享信息", dimension: "ai" },
    { ok: hasRelevantStructuredData, weight: 7, positive: "页面已带与官网语义相关的结构化数据。", negative: "建议补充 Organization / FAQ / Article 等相关结构化数据。", key: "schema", label: "相关结构化数据", dimension: "ai" },
    { ok: hasFaqSignal, weight: 6, positive: "页面已有较清晰的 FAQ / 问答信号。", negative: "建议补更清晰的 FAQ / 问答结构，增强 AI 抽取与引用能力。", key: "faq", label: "FAQ / 问答信号", dimension: "ai" },
    { ok: hasTopicDepth, weight: 6, positive: "内容长度与主题覆盖基础尚可。", negative: "内容深度偏弱，建议补主题页与可复用内容资产。", key: "content-depth", label: "内容深度", dimension: "content" },
    { ok: hasContentAssets, weight: 7, positive: "已具备 FAQ、案例或洞察等内容资产信号。", negative: "建议补案例、FAQ、洞察或专题页，形成更完整的内容资产体系。", key: "content-assets", label: "内容资产信号", dimension: "content" },
    { ok: contactSignalWithSamples, weight: 6, positive: "联系方式与咨询入口较清晰。", negative: "建议补电话、邮箱或联系入口，增强转化承接。", key: "contact", label: "联系方式", dimension: "convert" },
    { ok: hasCtaSignalWithSamples, weight: 5, positive: "页面已有较明确的行动引导与转化入口。", negative: "建议补强 CTA、表单或咨询动作，让高意向用户更容易继续沟通。", key: "cta", label: "CTA / 转化动作", dimension: "convert" },
    { ok: hasCompanySignal, weight: 4, positive: "公司信息较完整，基础可信度较好。", negative: "建议补公司信息、地址、电话、邮箱等基础信任信息。", key: "company", label: "公司信息完整度", dimension: "trust" },
    { ok: hasTrustSignal, weight: 3, positive: "页面已有备案、资质或客户背书等信任信号。", negative: "建议补资质、备案、客户背书或媒体报道，增强品牌可信度。", key: "trust", label: "资质 / 背书信号", dimension: "trust" },
  ];
  return { metrics };
}

function getScoreLevel(score) {
  if (score >= 85) return "基础不错，适合进一步做深 GEO 与内容增长。";
  if (score >= 65) return "已有一定基础，但结构、FAQ 或承接能力还有明显优化空间。";
  return "当前 GEO 基础偏弱，建议尽快补齐抓取、结构与承接能力。";
}

function summarizeGeoResult(result) {
  const dimensions = Array.isArray(result?.dimensions) ? result.dimensions : [];
  if (!dimensions.length) return [];

  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  const weakest = sorted[0];
  const strongest = [...dimensions].sort((a, b) => b.score - a.score)[0];
  const overview = dimensions.map((item) => `${item.title}${item.score}`).join(" / ");

  return [
    `六维概览：${overview}`,
    ...(strongest ? [`当前强项：${strongest.title}（${strongest.score}）`] : []),
    ...(weakest ? [`当前短板：${weakest.title}（${weakest.score}）`] : []),
  ];
}

async function scoreWebsite(websiteUrl) {
  const normalizedUrl = normalizeWebsiteUrl(websiteUrl);
  const { finalUrl, html } = await fetchHtml(normalizedUrl, 15000);
  const baseUrl = new URL(finalUrl);
  const robotsOk = await checkRemoteFile(new URL("/robots.txt", baseUrl).toString());
  const sitemapOk = await checkRemoteFile(new URL("/sitemap.xml", baseUrl).toString());
  const sampledPages = await collectSiteSamples(html, finalUrl);
  const analysis = analyzeHomepage(html, finalUrl, sampledPages);
  const metrics = [
    ...analysis.metrics,
    {
      ok: robotsOk,
      weight: 8,
      positive: "站点已提供 robots.txt。",
      negative: "建议补 robots.txt，明确抓取边界。",
      key: "robots",
      label: "robots.txt",
      dimension: "crawl",
    },
    {
      ok: sitemapOk,
      weight: 8,
      positive: "站点已提供 sitemap.xml。",
      negative: "建议补 sitemap.xml，帮助搜索与 AI 系统理解站点结构。",
      key: "sitemap",
      label: "sitemap.xml",
      dimension: "crawl",
    },
  ];

  return buildDetailedScore(metrics, finalUrl);
}

function formatEntryPage(page) {
  const value = String(page || "").trim();
  if (!value) return publicSiteUrl;
  if (/^https?:\/\//i.test(value)) return value;
  return `${publicSiteUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

function formatBeijingTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}（北京时间）`;
}

function buildGeoPlanUrlForOrder(order) {
  const orderNo = encodeURIComponent(order?.orderNo || "");
  const reportToken = String(order?.reportToken || "").trim();
  if (reportToken) return `${publicSiteUrl}/geo-plan/${encodeURIComponent(reportToken)}/?paid=1&orderNo=${orderNo}`;
  return `${publicSiteUrl}/geo-plan/?paid=1&orderNo=${orderNo}`;
}

async function findPaidGeoPlanOrder(planKey = "solution", reportToken = "") {
  const token = String(reportToken || "").trim();
  if (!token) return null;
  let files = [];
  try {
    files = await readdir(geoOrderDir);
  } catch {
    return null;
  }
  const matches = [];
  for (const fileName of files) {
    if (!fileName.endsWith(".json")) continue;
    try {
      const order = JSON.parse(await readFile(path.join(geoOrderDir, fileName), "utf8"));
      if (order?.planKey !== planKey) continue;
      if (String(order?.reportToken || "").trim() !== token) continue;
      if (order?.paymentStatus !== "paid") continue;
      matches.push(order);
    } catch {
      // Ignore malformed historical order files.
    }
  }
  if (!matches.length) return null;
  matches.sort((a, b) => String(b.paidAt || b.updatedAt || b.createdAt || "").localeCompare(String(a.paidAt || a.updatedAt || a.createdAt || "")));
  const order = matches[0];
  order.planUrl = buildGeoPlanUrlForOrder(order);
  return order;
}

async function attachGeoReportPlanAccess(report) {
  if (!report) return report;
  const paidOrder = await findPaidGeoPlanOrder("solution", report.token || "");
  if (!paidOrder) return report;
  report.paidPlanUrl = paidOrder.planUrl || buildGeoPlanUrlForOrder(paidOrder);
  report.paidPlanOrder = {
    orderNo: paidOrder.orderNo || "",
    planTitle: paidOrder.planTitle || "",
    amountLabel: paidOrder.amountLabel || "",
    paidAt: paidOrder.paidAt || "",
  };
  return report;
}

async function pushLeadToFeishu(entry) {

  const lines = [
    entry?.type === "geo-score"
      ? entry?.reportStatus === "new"
        ? "收到一条新的官网 GEO 评分线索"
        : entry?.reportStatus === "unchanged"
          ? "同一官网评分结果无变化，当前报告仍为最新"
          : "同一官网已更新 GEO 评分报告"
      : "收到一条新的 H5 留资线索",
    `姓名 / 称呼：${entry.name || "未填写"}`,
    `公司 / 品牌：${entry.company || "未填写"}`,
    ...(entry.websiteUrl ? [`官网网址：${entry.websiteUrl}`] : []),
    `联系方式：${entry.contact || "未填写"}`,
    `需求简述：${entry.demand || "未填写"}`,
    ...(entry.result ? [`基础评分：${entry.result.score}/100`, `评分结论：${entry.result.level}`] : []),
    ...(entry?.type === "geo-score" && entry.result ? summarizeGeoResult(entry.result) : []),
    ...(entry.reportUrl ? [`详细报告：${entry.reportUrl}`] : []),
    `来源页面：${formatEntryPage(entry.page || "")}`,
    `提交时间：${formatBeijingTime(entry.createdAt)}`,
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

function buildGeoReportWecomSentFeishuMessage(report) {
  const reportInput = report?.input || {};
  const reportResult = report?.result || {};
  const lines = [
    "详细报告已通过企业微信发送",
    `公司 / 品牌：${reportInput.company || "未填写"}`,
    `姓名 / 称呼：${reportInput.name || "未填写"}`,
    `联系方式：${reportInput.contact || "未填写"}`,
    ...(reportInput.websiteUrl ? [`官网网址：${reportInput.websiteUrl}`] : []),
    ...(reportResult && typeof reportResult === "object"
      ? [`基础评分：${reportResult.score}/100`, `评分结论：${reportResult.level}`]
      : []),
    "发送方式：企业微信自动发送",
    ...(report?.reportUrl ? [`详细报告：${report.reportUrl}`] : []),
    `发送时间：${formatBeijingTime(new Date().toISOString())}`,
  ];
  return lines.join("\n");
}

async function pushGeoReportWecomSentToFeishu(report) {
  const messageText = buildGeoReportWecomSentFeishuMessage(report);

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

async function pushWechatPaySuccessToFeishu(order) {
  const messageText = [
    "微信支付已完成，优化方案可查看",
    `订单编号：${order?.orderNo || "未记录"}`,
    `购买内容：${order?.planTitle || "官网 GEO 优化方案"}`,
    `支付金额：${order?.amountLabel || "未记录"}`,
    `公司 / 品牌：${order?.company || "未填写"}`,
    ...(order?.websiteUrl ? [`官网网址：${order.websiteUrl}`] : []),
    `联系方式：${order?.contact || "未填写"}`,
    ...(order?.transactionId ? [`微信交易号：${order.transactionId}`] : []),
    `优化方案：${buildGeoPlanUrlForOrder(order)}`,
    `支付时间：${formatBeijingTime(order?.paidAt || order?.updatedAt || "")}`,
  ].join("\n");

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
    const type = typeof payload?.type === "string" ? payload.type.trim() : "";
    const name = typeof payload?.name === "string" ? payload.name.trim() : "";
    const company = typeof payload?.company === "string" ? payload.company.trim() : "";
    const contact = typeof payload?.contact === "string" ? payload.contact.trim() : "";
    const demand = typeof payload?.demand === "string" ? payload.demand.trim() : "";
    const source = typeof payload?.source === "string" ? payload.source.trim() : "website";
    const page = typeof payload?.page === "string" ? payload.page.trim() : "";
    const websiteUrl = typeof payload?.websiteUrl === "string" ? payload.websiteUrl.trim() : "";
    const inviteToken = typeof payload?.inviteToken === "string" ? payload.inviteToken.trim() : "";

    if (type === "geo-score-stats") {
      const count = await countGeoScoreEntries();
      const displayCount = count > 100 ? String(count) : "100+";
      res.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      res.end(JSON.stringify({ ok: true, count, displayCount }));
      return true;
    }

    if (type === "geo-score") {
      if (!websiteUrl || !contact) {
        res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: false, error: "请至少填写官网网址和联系方式。" }));
        return true;
      }

      const result = await scoreWebsite(websiteUrl);
      const entry = {
        type,
        name,
        company,
        contact,
        websiteUrl,
        inviteToken,
        source,
        page,
        result,
        createdAt: new Date().toISOString(),
      };
      const report = await saveGeoReport(entry);
      const inviteResult = await applyGeoReportInvite(inviteToken, report, entry.createdAt);

      await appendLeadLog(entry);
      await pushLeadToFeishu({
        ...entry,
        reportUrl: report.reportUrl,
        reportStatus: report.reportStatus,
        demand: `官网 GEO 基础评分：${result.score}/100；优先改进：${result.priorities.join("；")}`,
      });

      res.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      res.end(
        JSON.stringify({
          ok: true,
          result,
          reportToken: report.token,
          reportUrl: report.reportUrl,
          reportStatus: report.reportStatus,
          unchangedWithin24h: Boolean(report.unchangedWithin24h),
          wecomClaim: report.wecomClaim || {},
          invite: report.invite || {},
          inviteResult: inviteResult || {},
        }),
      );
      return true;
    }

    if (type === "geo-report-fetch") {
      const token = typeof payload?.token === "string" ? payload.token.trim() : "";
      if (!token) {
        res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: false, error: "缺少报告 token。" }));
        return true;
      }

      try {
        let report = await verifyGeoReportWecomRelationship(await readGeoReport(token));
        const accessState = buildGeoReportAccessState(report);
        if (!accessState.locked) {
          report = await attachGeoReportPlanAccess(report);
        }
        res.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        });
        res.end(JSON.stringify({
          ok: true,
          report: accessState.locked ? buildGeoReportLockedPayload(report) : report,
          accessLocked: accessState.locked,
          accessMessage: accessState.message,
        }));
        return true;
      } catch {
        res.writeHead(404, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
        res.end(JSON.stringify({ ok: false, error: "报告不存在或已过期。" }));
        return true;
      }
    }

    if (type === "geo-plan-order-create") {
      const planKey = typeof payload?.planKey === "string" ? payload.planKey.trim() : "solution";
      const reportToken = typeof payload?.reportToken === "string" ? payload.reportToken.trim() : "";
      const source = typeof payload?.source === "string" ? payload.source.trim() : "geo-upgrade";
      const page = typeof payload?.page === "string" ? payload.page.trim() : "/geo-upgrade/";

      const order = await createGeoPlanOrder({ planKey, reportToken, source, page });
      res.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      res.end(JSON.stringify({ ok: true, order }));
      return true;
    }

    if (type === "geo-report-wecom-deliver") {
      const claimToken = typeof payload?.claimToken === "string" ? payload.claimToken.trim() : "";
      if (!claimToken) {
        res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: false, error: "缺少企微领取 token。" }));
        return true;
      }
      try {
        const report = await deliverGeoReportWecomClaim(claimToken);
        res.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        });
        res.end(JSON.stringify({
          ok: true,
          reportToken: report.token || "",
          reportUrl: report.reportUrl || "",
          wecomClaim: report.wecomClaim || {},
        }));
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        const statusCode = message === "NOT_FOUND" ? 404 : 500;
        res.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: false, error: statusCode === 404 ? "未找到对应的报告领取记录。" : (message || "企微领取处理失败。") }));
        return true;
      }
    }

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

async function handleGeoScoreSubmit(req, res) {
  try {
    const payload = await readJsonBody(req);
    const websiteUrl = typeof payload?.websiteUrl === "string" ? payload.websiteUrl.trim() : "";
    const contact = typeof payload?.contact === "string" ? payload.contact.trim() : "";
    const company = typeof payload?.company === "string" ? payload.company.trim() : "";
    const name = typeof payload?.name === "string" ? payload.name.trim() : "";
    const source = typeof payload?.source === "string" ? payload.source.trim() : "geo-score";
    const page = typeof payload?.page === "string" ? payload.page.trim() : "";
    const inviteToken = typeof payload?.inviteToken === "string" ? payload.inviteToken.trim() : "";

    if (!websiteUrl || !contact) {
      res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "请至少填写官网网址和联系方式。" }));
      return true;
    }

    const result = await scoreWebsite(websiteUrl);
    const entry = {
      type: "geo-score",
      name,
      company,
      contact,
      websiteUrl,
      inviteToken,
      source,
      page,
      result,
      createdAt: new Date().toISOString(),
    };
    const report = await saveGeoReport(entry);
    const inviteResult = await applyGeoReportInvite(inviteToken, report, entry.createdAt);

    await appendLeadLog(entry);
    await pushLeadToFeishu({
      ...entry,
      reportUrl: report.reportUrl,
      reportStatus: report.reportStatus,
      demand: `官网 GEO 基础评分：${result.score}/100；优先改进：${result.priorities.join("；")}`,
      page: page || "/geo-score/",
    });

    res.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(
      JSON.stringify({
        ok: true,
        result,
        reportToken: report.token,
        reportUrl: report.reportUrl,
        reportStatus: report.reportStatus,
        unchangedWithin24h: Boolean(report.unchangedWithin24h),
        wecomClaim: report.wecomClaim || {},
        invite: report.invite || {},
        inviteResult: inviteResult || {},
      }),
    );
    return true;
  } catch (error) {
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "提交失败，请稍后再试。" }));
    return true;
  }
}

async function handleWechatShareConfig(req, res) {
  try {
    const payload = await readJsonBody(req);
    const pageUrl = typeof payload?.url === "string" ? payload.url.trim() : "";

    if (!pageUrl) {
      res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "缺少当前页面 URL。" }));
      return true;
    }

    if (!wechatAppId || !wechatAppSecret) {
      res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "尚未配置微信公众号 appId / appSecret。" }));
      return true;
    }

    const tokenResponse = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(wechatAppId)}&secret=${encodeURIComponent(wechatAppSecret)}`,
    );
    const tokenPayload = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || !tokenPayload?.access_token) {
      throw new Error(tokenPayload?.errmsg || "微信公众号 access_token 获取失败。");
    }

    const ticketResponse = await fetch(
      `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${encodeURIComponent(tokenPayload.access_token)}&type=jsapi`,
    );
    const ticketPayload = await ticketResponse.json().catch(() => ({}));
    if (!ticketResponse.ok || ticketPayload?.errcode !== 0 || !ticketPayload?.ticket) {
      throw new Error(ticketPayload?.errmsg || "微信公众号 jsapi_ticket 获取失败。");
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = Math.random().toString(36).slice(2, 18);
    const raw = `jsapi_ticket=${ticketPayload.ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${pageUrl}`;
    const crypto = await import("node:crypto");
    const signature = crypto.createHash("sha1").update(raw, "utf8").digest("hex");

    res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    res.end(
      JSON.stringify({
        ok: true,
        config: {
          appId: wechatAppId,
          timestamp: Number(timestamp),
          nonceStr,
          signature,
        },
      }),
    );
    return true;
  } catch (error) {
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "微信分享配置失败。" }));
    return true;
  }
}

async function handleWechatPayStart(req, res, urlPath) {
  const currentUrl = new URL(urlPath, requestOrigin(req));
  if (!["/api/wechat/pay/start", "/wechat/pay/start"].includes(currentUrl.pathname)) {
    return false;
  }

  const orderNo = currentUrl.searchParams.get("orderNo")?.trim() || "";
  const returnUrl = sanitizePayReturnUrl(currentUrl.searchParams.get("returnUrl")?.trim() || "", `${requestOrigin(req)}/geo-upgrade/?paid=1`, req);
  if (!orderNo) {
    res.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    res.end("缺少订单编号。");
    return true;
  }

  let order;
  try {
    order = await readGeoOrder(orderNo);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("订单不存在。");
    return true;
  }

  if (!isWechatPayReady()) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(buildWechatJsapiPayHtml({ order, payParams: { appId: "", timeStamp: "", nonceStr: "", package: "", signType: "MD5", paySign: "" }, successUrl: returnUrl, errorMessage: "微信支付商户参数尚未配置完成。" }));
    return true;
  }

  if (!isWechatBrowser(req)) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#071224;color:#fff;padding:24px"><h2>请在微信内打开继续支付</h2><p style="line-height:1.8;color:#d6deeb">当前这条支付链路使用微信内 JSAPI 支付，请在微信内重新打开此页面后继续。</p></body></html>`);
    return true;
  }

  const code = currentUrl.searchParams.get("code")?.trim() || "";
  if (!code) {
    const oauthBaseUrl = wechatPayOauthBaseUrl || requestOrigin(req);
    const callbackPath = wechatPayOauthCallbackPath.startsWith("/") ? wechatPayOauthCallbackPath : `/${wechatPayOauthCallbackPath}`;
    const separator = callbackPath.includes("?") ? "&" : "?";
    const callbackUrl = `${oauthBaseUrl}${callbackPath}${separator}orderNo=${encodeURIComponent(orderNo)}&returnUrl=${encodeURIComponent(returnUrl)}`;
    const oauthUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${encodeURIComponent(wechatPayAppId)}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=snsapi_base&state=${encodeURIComponent(orderNo)}#wechat_redirect`;
    res.writeHead(302, { Location: oauthUrl, "cache-control": "no-store" });
    res.end();
    return true;
  }

  try {
    const openid = await fetchWechatOauthOpenId(code);
    const payParams = await createWechatJsapiParams(order, openid, req);
    order.openid = openid;
    order.prepayId = payParams.prepayId;
    order.updatedAt = new Date().toISOString();
    await writeGeoOrder(order);
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    res.end(buildWechatJsapiPayHtml({ order, payParams, successUrl: returnUrl }));
    return true;
  } catch (error) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    res.end(buildWechatJsapiPayHtml({ order, payParams: { appId: "", timeStamp: "", nonceStr: "", package: "", signType: "MD5", paySign: "" }, successUrl: returnUrl, errorMessage: error instanceof Error ? error.message : "支付初始化失败。" }));
    return true;
  }
}

async function handleWechatPayCallback(req, res, urlPath) {
  const currentUrl = new URL(urlPath, requestOrigin(req));
  if (!["/api/wechat/pay/callback", "/wechat/pay/callback", "/pay/wechat/callback", "/pay/wechat/callback/", "/auth/callback"].includes(currentUrl.pathname)) {
    return false;
  }
  const handled = await handleWechatPayStart(req, res, `/wechat/pay/start?${currentUrl.searchParams.toString()}`);
  if (!handled) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
    res.end("微信支付回调处理失败。");
  }
  return true;
}

async function handleWechatPayPrepare(req, res, urlPath) {
  const currentUrl = new URL(urlPath, requestOrigin(req));
  if (!["/api/wechat/pay/prepare", "/wechat/pay/prepare"].includes(currentUrl.pathname)) {
    return false;
  }
  const orderNo = currentUrl.searchParams.get("orderNo")?.trim() || "";
  const returnUrl = sanitizePayReturnUrl(
    currentUrl.searchParams.get("returnUrl")?.trim() || "",
    `${requestOrigin(req)}/geo-upgrade/?paid=1`,
    req,
  );
  const code = currentUrl.searchParams.get("code")?.trim() || "";

  try {
    const payload = await prepareWechatJsapiPayment(orderNo, returnUrl, code, req);
    res.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(JSON.stringify({ ok: true, ...payload }));
    return true;
  } catch (error) {
    const status = error?.code === "ENOENT" ? 404 : 400;
    res.writeHead(status, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "支付初始化失败。" }));
    return true;
  }
}

async function handleWechatPayNotify(req, res, urlPath) {
  const currentUrl = new URL(urlPath, requestOrigin(req));
  if (!["/api/wechat/pay/notify", "/wechat/pay/notify", "/pay/notify"].includes(currentUrl.pathname)) {
    return false;
  }

  try {
    const rawBody = await readRawBody(req);
    const xmlText = rawBody.toString("utf8");
    const payload = parseWechatXml(xmlText);
    const receivedSign = payload.sign || "";
    const verifyPayload = Object.fromEntries(Object.entries(payload).filter(([key]) => key !== "sign"));
    const expectedSign = receivedSign ? buildWechatPaySign(verifyPayload) : "";

    if (!payload || !receivedSign || expectedSign !== receivedSign) {
      throw new Error("微信支付通知验签失败。");
    }
    if (payload.return_code !== "SUCCESS" || payload.result_code !== "SUCCESS") {
      throw new Error(payload.return_msg || payload.err_code_des || "微信支付未成功。");
    }

    const orderNo = String(payload.out_trade_no || "").trim();
    if (!orderNo) {
      throw new Error("微信支付通知缺少订单号。");
    }

    const order = await readGeoOrder(orderNo);
    const alreadyNotified = Boolean(order.feishuPaymentNotifiedAt);
    order.status = "paid";
    order.paymentStatus = "paid";
    order.paymentMessage = "微信支付已完成。";
    order.transactionId = payload.transaction_id || "";
    order.paidAt = new Date().toISOString();
    order.updatedAt = order.paidAt;
    order.notifyPayload = payload;
    await writeGeoOrder(order);

    if (!alreadyNotified) {
      try {
        await pushWechatPaySuccessToFeishu(order);
        order.feishuPaymentNotifiedAt = new Date().toISOString();
        order.updatedAt = order.feishuPaymentNotifiedAt;
        delete order.feishuPaymentNotifyError;
        await writeGeoOrder(order);
      } catch (feishuError) {
        order.feishuPaymentNotifyError = feishuError instanceof Error ? feishuError.message : "飞书发送失败。";
        order.updatedAt = new Date().toISOString();
        await writeGeoOrder(order);
        console.warn("[wechat-pay] feishu notify failed", orderNo, order.feishuPaymentNotifyError);
      }
    }

    res.writeHead(200, { "content-type": "text/xml; charset=utf-8" });
    res.end(buildWechatPayXml({ return_code: "SUCCESS", return_msg: "OK" }));
    return true;
  } catch (error) {
    res.writeHead(200, { "content-type": "text/xml; charset=utf-8" });
    res.end(buildWechatPayXml({ return_code: "FAIL", return_msg: error instanceof Error ? error.message : "FAIL" }));
    return true;
  }
}

async function handleWecomContactCallback(req, res, urlPath) {
  const currentUrl = new URL(urlPath, requestOrigin(req));
  if (!["/api/wecom/contact/callback", "/wecom/contact/callback"].includes(currentUrl.pathname)) {
    return false;
  }

  const status = buildWecomCallbackStatus();
  if (req.method === "GET") {
    const echostr = currentUrl.searchParams.get("echostr")?.trim() || "";
    const msgSignature = currentUrl.searchParams.get("msg_signature")?.trim() || "";
    const timestamp = currentUrl.searchParams.get("timestamp")?.trim() || "";
    const nonce = currentUrl.searchParams.get("nonce")?.trim() || "";
    if (status.callbackCryptoReady && echostr) {
      try {
        if (!verifyWecomSignature(msgSignature, timestamp, nonce, echostr)) {
          throw new Error("企微回调校验失败：msg_signature 不匹配。");
        }
        const plainEcho = decryptWecomCiphertext(echostr);
        res.writeHead(200, {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
        });
        res.end(plainEcho);
        return true;
      } catch (error) {
        res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
          ok: false,
          error: error instanceof Error ? error.message : "企微回调解密失败。",
          status,
        }));
        return true;
      }
    }

    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      ok: false,
      error: "企微回调地址已接通，但尚未配置回调 Token / EncodingAESKey，当前无法完成企微后台校验。",
      status,
    }));
    return true;
  }

  const rawBody = await readRawBody(req);
  if (!status.callbackCryptoReady) {
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      ok: false,
      error: "企微回调地址已接通，但尚未配置回调 Token / EncodingAESKey，当前无法验证并处理企微事件。",
      status,
    }));
    return true;
  }
  try {
    const msgSignature = currentUrl.searchParams.get("msg_signature")?.trim() || "";
    const timestamp = currentUrl.searchParams.get("timestamp")?.trim() || "";
    const nonce = currentUrl.searchParams.get("nonce")?.trim() || "";
    const bodyText = rawBody.toString("utf8");
    const encryptMatch = bodyText.match(/<Encrypt><!\[CDATA\[([\s\S]*?)\]\]><\/Encrypt>|<Encrypt>([\s\S]*?)<\/Encrypt>/i);
    const encrypted = String(encryptMatch?.[1] || encryptMatch?.[2] || "").trim();
    if (!encrypted) {
      throw new Error("企微回调缺少 Encrypt 字段。");
    }
    if (!verifyWecomSignature(msgSignature, timestamp, nonce, encrypted)) {
      throw new Error("企微回调校验失败：msg_signature 不匹配。");
    }
    const decryptedXml = decryptWecomCiphertext(encrypted);
    const event = {
      event: (decryptedXml.match(/<Event><!\[CDATA\[([\s\S]*?)\]\]><\/Event>|<Event>([\s\S]*?)<\/Event>/i)?.[1]
        || decryptedXml.match(/<Event><!\[CDATA\[([\s\S]*?)\]\]><\/Event>|<Event>([\s\S]*?)<\/Event>/i)?.[2]
        || "").trim(),
      changeType: (decryptedXml.match(/<ChangeType><!\[CDATA\[([\s\S]*?)\]\]><\/ChangeType>|<ChangeType>([\s\S]*?)<\/ChangeType>/i)?.[1]
        || decryptedXml.match(/<ChangeType><!\[CDATA\[([\s\S]*?)\]\]><\/ChangeType>|<ChangeType>([\s\S]*?)<\/ChangeType>/i)?.[2]
        || "").trim(),
      state: (decryptedXml.match(/<State><!\[CDATA\[([\s\S]*?)\]\]><\/State>|<State>([\s\S]*?)<\/State>/i)?.[1]
        || decryptedXml.match(/<State><!\[CDATA\[([\s\S]*?)\]\]><\/State>|<State>([\s\S]*?)<\/State>/i)?.[2]
        || "").trim(),
      userId: (decryptedXml.match(/<UserID><!\[CDATA\[([\s\S]*?)\]\]><\/UserID>|<UserID>([\s\S]*?)<\/UserID>/i)?.[1]
        || decryptedXml.match(/<UserID><!\[CDATA\[([\s\S]*?)\]\]><\/UserID>|<UserID>([\s\S]*?)<\/UserID>/i)?.[2]
        || "").trim(),
      externalUserId: (decryptedXml.match(/<ExternalUserID><!\[CDATA\[([\s\S]*?)\]\]><\/ExternalUserID>|<ExternalUserID>([\s\S]*?)<\/ExternalUserID>/i)?.[1]
        || decryptedXml.match(/<ExternalUserID><!\[CDATA\[([\s\S]*?)\]\]><\/ExternalUserID>|<ExternalUserID>([\s\S]*?)<\/ExternalUserID>/i)?.[2]
        || "").trim(),
      welcomeCode: (decryptedXml.match(/<WelcomeCode><!\[CDATA\[([\s\S]*?)\]\]><\/WelcomeCode>|<WelcomeCode>([\s\S]*?)<\/WelcomeCode>/i)?.[1]
        || decryptedXml.match(/<WelcomeCode><!\[CDATA\[([\s\S]*?)\]\]><\/WelcomeCode>|<WelcomeCode>([\s\S]*?)<\/WelcomeCode>/i)?.[2]
        || "").trim(),
    };
    if (event.changeType === "del_follow_user" && event.externalUserId && event.userId) {
      try {
        await updateGeoReportWecomRelationship(event.externalUserId, event.userId, "removed");
      } catch {
        // noop
      }
    }
    if (event.changeType === "add_external_contact") {
      try {
        let claimToken = event.state;
        if (!claimToken && event.externalUserId) {
          try {
            claimToken = await resolveGeoReportWecomClaimToken(event.externalUserId, event.userId);
          } catch {
            claimToken = "";
          }
        }
        if (!claimToken) {
          claimToken = await findRecentGeoReportClaim();
        }
        if (!claimToken) {
          res.writeHead(200, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
          res.end("success");
          return true;
        }
        const report = await deliverGeoReportWecomClaim(claimToken, "", event.externalUserId, event.userId);
        if (event.welcomeCode) {
          try {
            const previousWelcomeCode = typeof report?.wecomClaim?.lastWelcomeCode === "string"
              ? report.wecomClaim.lastWelcomeCode.trim()
              : "";
            const shouldSend = previousWelcomeCode !== event.welcomeCode;
            if (shouldSend) {
              await sendWecomWelcomeMessage(event.welcomeCode, report);
            }
            report.wecomClaim = {
              ...(report.wecomClaim || {}),
              welcomeSentAt: new Date().toISOString(),
              lastWelcomeCode: event.welcomeCode,
              lastError: "",
            };
            if (shouldSend) {
              try {
                await pushGeoReportWecomSentToFeishu(report);
              } catch (feishuError) {
                report.wecomClaim = {
                  ...(report.wecomClaim || {}),
                  lastError: feishuError instanceof Error ? feishuError.message : "飞书发送失败。",
                };
              }
            }
          } catch (welcomeError) {
            report.wecomClaim = {
              ...(report.wecomClaim || {}),
              lastError: welcomeError instanceof Error ? welcomeError.message : "欢迎语发送失败。",
            };
          }
          report.updatedAt = new Date().toISOString();
          await writeGeoReport(report);
        }
      } catch {
        // noop
      }
    }
    res.writeHead(200, {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end("success");
    return true;
  } catch (error) {
    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : "企微回调处理失败。",
      status,
    }));
    return true;
  }
}

async function handleGeoReportRequest(req, res, urlPath) {
  const currentUrl = new URL(urlPath, "http://127.0.0.1");
  if (currentUrl.pathname !== "/api/geo-report") {
    return false;
  }
  const token = currentUrl.searchParams.get("token")?.trim() || "";
  const shareMode = currentUrl.searchParams.get("share") === "1";
  if (!token) {
    res.writeHead(400, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    res.end(JSON.stringify({ ok: false, error: "缺少报告 token。" }));
    return true;
  }

  try {
    const report = await readGeoReport(token);
    if (shareMode) {
      const html = buildGeoReportShareHtml(report, token);
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store, no-cache, must-revalidate",
        pragma: "no-cache",
        expires: "0",
      });
      res.end(html);
      return true;
    }
    res.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(JSON.stringify({ ok: true, report }));
    return true;
  } catch {
    res.writeHead(404, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    res.end(JSON.stringify({ ok: false, error: "报告不存在或已过期。" }));
    return true;
  }
}

async function handleLeadShareRequest(req, res, urlPath) {
  const currentUrl = new URL(urlPath, "http://127.0.0.1");
  if (currentUrl.pathname !== "/api/lead/submit") {
    return false;
  }
  const paymentMode = (currentUrl.searchParams.get("payment") || "").trim().toLowerCase();
  if (paymentMode === "start") {
    return handleWechatPayStart(req, res, `/wechat/pay/start?${currentUrl.searchParams.toString()}`);
  }
  if (paymentMode === "prepare") {
    return handleWechatPayPrepare(req, res, `/wechat/pay/prepare?${currentUrl.searchParams.toString()}`);
  }
  if (paymentMode === "callback") {
    return handleWechatPayCallback(req, res, `/wechat/pay/callback?${currentUrl.searchParams.toString()}`);
  }
  const shareType = currentUrl.searchParams.get("share") || "";
  if (!["geo-report", "geo-plan"].includes(shareType)) {
    return false;
  }

  const token = currentUrl.searchParams.get("token")?.trim() || "";
  if (!token) {
    res.writeHead(400, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
    res.end("缺少报告 token。");
    return true;
  }

  try {
    const report = await readGeoReport(token);
    const html = shareType === "geo-plan" ? buildGeoPlanShareHtml(report, token) : buildGeoReportShareHtml(report, token);
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate",
      pragma: "no-cache",
      expires: "0",
    });
    res.end(html);
    return true;
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
    res.end("报告不存在或已过期。");
    return true;
  }
}

async function handleGeoPlanShareRequest(req, res, urlPath) {
  const currentUrl = new URL(urlPath, "http://127.0.0.1");
  if (!currentUrl.pathname.startsWith("/geo-plan-share/")) {
    return false;
  }

  const token = currentUrl.pathname.slice("/geo-plan-share/".length).replace(/^\/+|\/+$/g, "");
  if (!token) {
    res.writeHead(400, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
    res.end("缺少报告 token。");
    return true;
  }

  try {
    const report = await readGeoReport(token);
    const html = buildGeoPlanShareHtml(report, token);
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate",
      pragma: "no-cache",
      expires: "0",
    });
    res.end(html);
    return true;
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
    res.end("报告不存在或已过期。");
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

  if (req.method === "GET" && urlPath.startsWith("/api/lead/submit")) {
    const handled = await handleLeadShareRequest(req, res, urlPath);
    if (handled) {
      return;
    }
  }

  if (req.method === "POST" && urlPath === "/api/geo-score/submit") {
    await handleGeoScoreSubmit(req, res);
    return;
  }

  if (req.method === "POST" && urlPath === "/api/wechat/share-config") {
    await handleWechatShareConfig(req, res);
    return;
  }

  if (req.method === "GET" && (urlPath.startsWith("/api/wechat/pay/start") || urlPath.startsWith("/wechat/pay/start"))) {
    const handled = await handleWechatPayStart(req, res, urlPath);
    if (handled) {
      return;
    }
  }

  if (req.method === "GET" && (urlPath.startsWith("/api/wechat/pay/prepare") || urlPath.startsWith("/wechat/pay/prepare"))) {
    const handled = await handleWechatPayPrepare(req, res, urlPath);
    if (handled) {
      return;
    }
  }

  if (req.method === "GET" && (urlPath.startsWith("/api/wechat/pay/callback") || urlPath.startsWith("/wechat/pay/callback") || urlPath.startsWith("/pay/wechat/callback") || urlPath.startsWith("/auth/callback"))) {
    const handled = await handleWechatPayCallback(req, res, urlPath);
    if (handled) {
      return;
    }
  }

  if ((req.method === "GET" || req.method === "POST") && (urlPath.startsWith("/api/wecom/contact/callback") || urlPath.startsWith("/wecom/contact/callback"))) {
    const handled = await handleWecomContactCallback(req, res, urlPath);
    if (handled) {
      return;
    }
  }

  if (req.method === "POST" && (urlPath.startsWith("/api/wechat/pay/notify") || urlPath.startsWith("/wechat/pay/notify") || urlPath.startsWith("/pay/notify"))) {
    const handled = await handleWechatPayNotify(req, res, urlPath);
    if (handled) {
      return;
    }
  }

  if (req.method === "GET" && urlPath.startsWith("/api/geo-report")) {
    const handled = await handleGeoReportRequest(req, res, urlPath);
    if (handled) {
      return;
    }
  }

  if (req.method === "GET" && urlPath.startsWith("/geo-plan-share/")) {
    const handled = await handleGeoPlanShareRequest(req, res, urlPath);
    if (handled) {
      return;
    }
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
    const headers = { "content-type": contentType };
    if (ext === ".html") {
      headers["cache-control"] = "no-store, no-cache, must-revalidate";
      headers.pragma = "no-cache";
      headers.expires = "0";
    }

    res.writeHead(200, headers);
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
