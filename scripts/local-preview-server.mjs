import { createReadStream } from "node:fs";
import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { appendFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

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

async function saveGeoReport(entry) {
  const token = randomUUID().replaceAll("-", "");
  const report = {
    token,
    type: "geo-score",
    createdAt: entry.createdAt,
    reportUrl: `${publicSiteUrl}/geo-report/${token}/`,
    input: {
      name: entry.name || "",
      company: entry.company || "",
      contact: entry.contact || "",
      websiteUrl: entry.websiteUrl || "",
      source: entry.source || "",
      page: entry.page || "",
    },
    result: entry.result,
  };

  await mkdir(geoReportDir, { recursive: true });
  await writeFile(path.join(geoReportDir, `${token}.json`), JSON.stringify(report, null, 2), "utf8");
  return report;
}

async function readGeoReport(token) {
  const filePath = path.join(geoReportDir, `${token}.json`);
  return JSON.parse(await readFile(filePath, "utf8"));
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

function analyzeHomepage(html, finalUrl) {
  const title = extractTagContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescription = extractTagContent(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || extractTagContent(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const canonical = extractTagContent(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || extractTagContent(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const h1 = extractTagContent(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const hasStructuredData = /application\/ld\+json/i.test(html);
  const hasFaqSignal = /FAQPage|常见问题|faq/i.test(html);
  const hasOgTitle = /property=["']og:title["']/i.test(html);
  const hasOgDescription = /property=["']og:description["']/i.test(html);
  const contactSignal = /(400-\d{4}-\d{3}|@\w|联系电话|商务邮箱|联系我们|电话咨询)/i.test(html);
  const hasThemeFocus = /(GEO|AI增长|增长飞轮|智能获客|AI 可见性|官网 GEO)/i.test([title, metaDescription, h1, contentText.slice(0, 800)].join(" "));
  const hasContentAssets = /(案例|新闻|洞察|blog|insights|专题|白皮书|报告|FAQ|常见问题)/i.test(html);
  const hasCtaSignal = /(预约|咨询|提交需求|立即联系|联系我们|电话咨询|扫码|表单|demo)/i.test(html);
  const hasCompanySignal = /(有限公司|公司地址|北京市|商务邮箱|联系电话|service@|400-\d{4}-\d{3})/i.test(html);
  const hasTrustSignal = /(高新技术企业|新华社|备案|许可证|PICC|奥迪|沃尔沃|壳牌|美孚|中国平安|人民日报)/i.test(html);
  const contentText = stripHtml(html);
  const hasTopicDepth = contentText.length >= 1200;

  const metrics = [
    { ok: finalUrl.startsWith("https://"), weight: 8, positive: "已启用 HTTPS，基础可信度较好。", negative: "建议优先确保官网全站使用 HTTPS。", key: "https", label: "HTTPS", dimension: "crawl" },
    { ok: title.length >= 8 && title.length <= 65, weight: 6, positive: "页面标题长度较合适。", negative: "页面标题过短或过长，建议优化标题表达。", key: "title", label: "Title 标题长度", dimension: "theme" },
    { ok: metaDescription.length >= 30 && metaDescription.length <= 180, weight: 6, positive: "已配置较完整的 meta description。", negative: "缺少清晰的 meta description。", key: "description", label: "Meta Description", dimension: "theme" },
    { ok: Boolean(h1), weight: 6, positive: "首页已有明确 H1 主题。", negative: "首页缺少明确 H1，主题表达不够集中。", key: "h1", label: "首页 H1", dimension: "theme" },
    { ok: hasThemeFocus, weight: 6, positive: "首页主题关键词较集中，页面语义比较明确。", negative: "首页主题关键词分散，建议收紧主题表达与页面语义。", key: "theme-focus", label: "主题聚焦度", dimension: "theme" },
    { ok: Boolean(canonical), weight: 7, positive: "已配置 canonical 规范地址。", negative: "建议补 canonical，减少重复地址干扰。", key: "canonical", label: "Canonical", dimension: "crawl" },
    { ok: hasOgTitle && hasOgDescription, weight: 5, positive: "社交分享标题与描述较完整。", negative: "建议补全 og:title / og:description。", key: "og", label: "OG 分享信息", dimension: "ai" },
    { ok: hasStructuredData, weight: 7, positive: "页面已带结构化数据。", negative: "建议补充 Organization / FAQ / Article 等结构化数据。", key: "schema", label: "结构化数据", dimension: "ai" },
    { ok: hasFaqSignal, weight: 6, positive: "页面已有 FAQ / 问答信号。", negative: "建议补 FAQ 区块，增强 AI 抽取与引用能力。", key: "faq", label: "FAQ 信号", dimension: "ai" },
    { ok: hasTopicDepth, weight: 6, positive: "内容长度与主题覆盖基础尚可。", negative: "内容深度偏弱，建议补主题页与可复用内容资产。", key: "content-depth", label: "内容深度", dimension: "content" },
    { ok: hasContentAssets, weight: 7, positive: "已具备 FAQ、案例或洞察等内容资产信号。", negative: "建议补案例、FAQ、洞察或专题页，形成更完整的内容资产体系。", key: "content-assets", label: "内容资产信号", dimension: "content" },
    { ok: contactSignal, weight: 6, positive: "联系方式与咨询入口较清晰。", negative: "建议补电话、邮箱或联系入口，增强转化承接。", key: "contact", label: "联系方式", dimension: "convert" },
    { ok: hasCtaSignal, weight: 5, positive: "页面已有较明确的行动引导与转化入口。", negative: "建议补强 CTA、表单或咨询动作，让高意向用户更容易继续沟通。", key: "cta", label: "CTA / 转化动作", dimension: "convert" },
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
  const homepageResponse = await fetch(normalizedUrl, {
    headers: {
      "user-agent": "JGMAO GEO Score Bot/1.0",
      accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });

  if (!homepageResponse.ok) {
    throw new Error(`官网暂时无法访问（${homepageResponse.status}），请确认网址是否可正常打开。`);
  }

  const finalUrl = homepageResponse.url || normalizedUrl;
  const html = await homepageResponse.text();
  const baseUrl = new URL(finalUrl);
  const robotsOk = await checkRemoteFile(new URL("/robots.txt", baseUrl).toString());
  const sitemapOk = await checkRemoteFile(new URL("/sitemap.xml", baseUrl).toString());
  const analysis = analyzeHomepage(html, finalUrl);
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

async function pushLeadToFeishu(entry) {
  const formatEntryPage = (page) => {
    const value = String(page || "").trim();
    if (!value) return publicSiteUrl;
    if (/^https?:\/\//i.test(value)) return value;
    return `${publicSiteUrl}${value.startsWith("/") ? value : `/${value}`}`;
  };

  const formatBeijingTime = (value) => {
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
  };

  const lines = [
    entry?.type === "geo-score" ? "收到一条新的官网 GEO 评分线索" : "收到一条新的 H5 留资线索",
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
        source,
        page,
        result,
        createdAt: new Date().toISOString(),
      };
      const report = await saveGeoReport(entry);

      await appendLeadLog(entry);
      await pushLeadToFeishu({
        ...entry,
        reportUrl: report.reportUrl,
        demand: `官网 GEO 基础评分：${result.score}/100；优先改进：${result.priorities.join("；")}`,
      });

      res.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      res.end(JSON.stringify({ ok: true, result }));
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
        const report = await readGeoReport(token);
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
      source,
      page,
      result,
      createdAt: new Date().toISOString(),
    };
    const report = await saveGeoReport(entry);

    await appendLeadLog(entry);
    await pushLeadToFeishu({
      ...entry,
      reportUrl: report.reportUrl,
      demand: `官网 GEO 基础评分：${result.score}/100；优先改进：${result.priorities.join("；")}`,
      page: page || "/geo-score/",
    });

    res.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(JSON.stringify({ ok: true, result }));
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

async function handleGeoReportRequest(req, res, urlPath) {
  const currentUrl = new URL(urlPath, "http://127.0.0.1");
  if (currentUrl.pathname !== "/api/geo-report") {
    return false;
  }
  const token = currentUrl.searchParams.get("token")?.trim() || "";
  if (!token) {
    res.writeHead(400, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    res.end(JSON.stringify({ ok: false, error: "缺少报告 token。" }));
    return true;
  }

  try {
    const report = await readGeoReport(token);
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

  if (req.method === "POST" && urlPath === "/api/geo-score/submit") {
    await handleGeoScoreSubmit(req, res);
    return;
  }

  if (req.method === "POST" && urlPath === "/api/wechat/share-config") {
    await handleWechatShareConfig(req, res);
    return;
  }

  if (req.method === "GET" && urlPath.startsWith("/api/geo-report")) {
    const handled = await handleGeoReportRequest(req, res, urlPath);
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
