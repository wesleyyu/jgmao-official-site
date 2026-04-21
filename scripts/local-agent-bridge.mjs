import { readFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const port = Number(process.env.PORT || 8788);
const sharedToken = process.env.AGENT_BRIDGE_TOKEN || "";
const publicChatModel = process.env.PUBLIC_CHAT_MODEL || "qwen3.6-plus";
const publicChatApiBaseUrl = (process.env.PUBLIC_CHAT_API_BASE_URL || "https://coding.dashscope.aliyuncs.com/v1").replace(/\/$/, "");
const publicChatApiKey = process.env.PUBLIC_CHAT_API_KEY || "";
const publicChatApiKeyFile = process.env.PUBLIC_CHAT_API_KEY_FILE || "";
const publicChatTimeoutMs = Number(process.env.PUBLIC_CHAT_TIMEOUT_MS || 120000);
const publicChatMaxTokens = Number(process.env.PUBLIC_CHAT_MAX_TOKENS || 240);
const publicChatTemperature = Number(process.env.PUBLIC_CHAT_TEMPERATURE || 0.3);
const streamChunkDelayMs = Number(process.env.CHAT_STREAM_CHUNK_DELAY_MS || 26);
const streamChunkSize = Number(process.env.CHAT_STREAM_CHUNK_SIZE || 22);
let cachedApiKey = null;

const instantReplyRules = [
  {
    match: /^(你好|您好|hi|hello|hey)[!！,.。 ]*$/i,
    reply: {
      zh: "你好，我是坚果猫官网咨询助手。坚果猫（JGMAO）专注于帮助企业提升 AI 可见性、内容生产效率、官网转化与智能获客能力。请简述你的行业场景、官网现状与核心诉求。",
      en: "Hi, I’m here. You can share your company, website URL, or the main growth issue you want to improve.",
    },
  },
  {
    match: /(怎么联系|如何联系|联系你们|联系顾问|怎么合作|如何合作|预约咨询|预约演示|demo|consultation|contact)/i,
    reply: {
      zh: "可以直接在这里说你的公司、官网和当前问题，我会先帮你梳理需求；如果合适，也可以继续留下联系方式，方便顾问跟进。",
      en: "You can share your company, website, and current issue here. I’ll help qualify the need first, and you can leave contact details for follow-up if useful.",
    },
  },
  {
    match: /(你们做什么|做什么的|是什么|能做什么|jgmao是做什么|what do you do|what is jgmao)/i,
    reply: {
      zh: "坚果猫（JGMAO）专注于帮助企业提升 AI 可见性、内容生产效率、官网转化与智能获客能力。你可以继续告诉我行业场景、官网现状与核心诉求，我会按官网公开业务范围为你判断合适方向。",
      en: "JGMAO helps businesses connect AI visibility, content production, website conversion, lead capture, and recommendation insights into one working growth flywheel.",
    },
  },
  {
    match: /(价格|收费|多少钱|报价|套餐|price|pricing|quote)/i,
    reply: {
      zh: "报价会根据行业、当前网站基础和你最想解决的问题来定。你可以先告诉我官网地址和当前目标，我先帮你判断适合从哪一块开始。",
      en: "Pricing depends on your industry, website baseline, and what you want to solve first. Share your website and current goal, and I can help narrow down the right starting point.",
    },
  },
  {
    match: /(企业怎么做增长|怎么做增长|如何做增长|怎么提升增长|how to grow a business|how to drive growth)/i,
    reply: {
      zh: "企业做增长，核心不是单纯加投流，而是先找清楚卡点，再把获客、转化、留存和复购这条链路逐段提效。如果你愿意，可以直接告诉我行业、官网和当前最卡的一段，我帮你先判断从哪里下手。",
      en: "Growth usually starts with finding the main bottleneck first, then improving acquisition, conversion, retention, and repeat purchase step by step. If you want, share your industry, website, and current bottleneck, and I’ll help narrow down the best starting point.",
    },
  },
  {
    match: /(官网.*怎么优化|网站.*怎么优化|官网优化|网站优化|how to improve (our )?(website|site))/i,
    reply: {
      zh: "官网优化通常先看三件事：信息是否足够清晰、页面是否能承接转化、内容是否容易被 AI 和搜索理解。如果你愿意，可以把官网地址发给我，我先帮你判断最值得优先改的部分。",
      en: "Website optimization usually starts with three things: clarity of messaging, conversion flow, and whether the content is easy for AI/search systems to understand. If you share the website URL, I can help identify the best place to start.",
    },
  },
];

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

function normalizeModelError(output) {
  const text = output || "";

  if (/timed out|timeout/i.test(text)) {
    return "咨询助手响应稍慢，请稍后重试，或直接留下官网地址和问题重点，我会尽量用更简短的方式回答。";
  }

  if (/429|too many requests|rate limit/i.test(text)) {
    return "咨询量有点高，我这边稍后再试一次；如果比较着急，也可以直接通过官网联系方式与我们沟通。";
  }

  if (/50[0-9]|bad gateway|upstream/i.test(text)) {
    return "咨询助手暂时连接不稳定，请稍后再试；如果比较着急，也可以直接通过官网联系方式与我们沟通。";
  }

  return "";
}

function isSensitiveCredentialRequest(message) {
  const text = (message || "").toLowerCase();
  return [
    /ssh/,
    /private key/,
    /public key/,
    /api key/,
    /access token/,
    /password/,
    /cookie/,
    /秘钥/,
    /密钥/,
    /私钥/,
    /公钥/,
    /密码/,
    /令牌/,
    /凭据/,
    /token/,
  ].some((pattern) => pattern.test(text));
}

function getLocalizedCopy(copy, message) {
  const zh = /[\u4e00-\u9fff]/.test(message || "");
  return zh ? copy.zh : copy.en;
}

function getInstantReply(message) {
  const trimmed = (message || "").trim();
  if (!trimmed) {
    return "";
  }

  const matchedRule = instantReplyRules.find((rule) => rule.match.test(trimmed));
  return matchedRule ? getLocalizedCopy(matchedRule.reply, trimmed) : "";
}

function createStreamChunks(text) {
  const normalized = (text || "").replace(/\r/g, "").trim();
  if (!normalized) {
    return [];
  }

  const chunks = [];
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    if (paragraph.length <= streamChunkSize) {
      chunks.push(paragraph);
      continue;
    }

    const segments = paragraph
      .split(/(?<=[。！？!?；;：:])\s*|(?<=\.)\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (!segments.length) {
      chunks.push(paragraph);
      continue;
    }

    let current = "";
    for (const segment of segments) {
      if (!current) {
        current = segment;
        continue;
      }

      if ((current + segment).length <= streamChunkSize) {
        current += segment;
        continue;
      }

      chunks.push(current);
      current = segment;
    }

    if (current) {
      chunks.push(current);
    }
  }

  return chunks;
}

function writeStreamEvent(res, event) {
  res.write(`${JSON.stringify(event)}\n`);
}

async function streamReply(res, reply, meta = {}, options = {}) {
  if (!options.skipStart) {
    writeStreamEvent(res, { type: "start", ...meta });
  }

  const chunks = createStreamChunks(reply);
  if (!chunks.length) {
    writeStreamEvent(res, { type: "done", reply });
    res.end();
    return;
  }

  for (const chunk of chunks) {
    writeStreamEvent(res, { type: "delta", delta: chunk });
    await sleep(streamChunkDelayMs);
  }

  writeStreamEvent(res, { type: "done", reply });
  res.end();
}

function getSensitiveCredentialRefusal(message) {
  const zh = /[\u4e00-\u9fff]/.test(message || "");
  if (zh) {
    return "不要在聊天里提供 SSH 密钥、密码、API Key 或其他敏感凭据。我可以继续帮你梳理官网、业务目标、技术栈和接入需求；如果需要正式技术对接，我们会通过安全方式安排工程师跟进。";
  }

  return "Please do not share SSH keys, passwords, API keys, cookies, or any other sensitive credentials in chat. I can still help with your website context, goals, stack, and integration needs, and an engineer can follow up through a secure process if needed.";
}

function createPublicChatPrompt(message) {
  return [
    "你是坚果猫（JGMAO）官网对外咨询助手，底层模型为 qwen-3.6-plus。",
    "坚果猫（JGMAO）专注于帮助企业提升 AI 可见性、内容生产效率、官网转化与智能获客能力。",
    "你的职责只包括：介绍坚果猫公开能力、判断是否适合、回答公开 FAQ、收集基础需求、引导用户通过官网/电话/邮箱继续联系。",
    "严格禁止：索要源码、SSH、密码、密钥、Token、Cookie、后台权限、数据库信息、私有仓库内容、内部配置文件。",
    "如果用户问题涉及技术接入、权限操作、代码部署、内容发布后台或任何敏感凭据，只能提醒不要在聊天中提供敏感信息，并引导其通过正式商务/工程师对接方式继续。",
    "如果用户问题与坚果猫官网公开业务明显无关，不要发散回答通用知识；先用 1 句说明坚果猫的业务范围，再请用户简述行业场景、官网现状与核心诉求。",
    "回答要求：默认中文、简洁、可信、官网口吻；优先 1 句核心判断 + 最多 3 个短点；尽量控制在 120 字以内，除非用户明确要求更详细。",
    "不要暴露内部 Agent、OpenClaw、飞书或后台工作流细节。",
    "在合适时，可自然补一句：完整资料与演示预约请访问官网或致电/邮件客服，我们将安排专人对接。",
    "",
    "用户消息：",
    message,
  ].join("\n");
}

async function runPublicModel({ message, sessionId }) {
  console.log(`[bridge] running public model for session=${sessionId}`);
  const apiKey = getPublicChatApiKey();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), publicChatTimeoutMs);

  try {
    const response = await fetch(`${publicChatApiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: publicChatModel,
        temperature: publicChatTemperature,
        max_tokens: publicChatMaxTokens,
        messages: [
          {
            role: "system",
            content: createPublicChatPrompt(message),
          },
        ],
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(async () => {
      const text = await response.text();
      throw new Error(normalizeModelError(text) || text || "咨询助手暂时没有成功返回结果，请稍后重试。");
    });

    if (!response.ok) {
      throw new Error(
        normalizeModelError(JSON.stringify(payload)) ||
          payload?.error?.message ||
          payload?.message ||
          `Public chat model request failed with status ${response.status}`,
      );
    }

    const reply = Array.isArray(payload?.choices)
      ? payload.choices
          .map((choice) => {
            const content = choice?.message?.content;
            if (typeof content === "string") {
              return content.trim();
            }
            if (Array.isArray(content)) {
              return content
                .map((item) => (typeof item?.text === "string" ? item.text.trim() : ""))
                .filter(Boolean)
                .join("\n");
            }
            return "";
          })
          .filter(Boolean)
          .join("\n\n")
      : "";

    if (!reply) {
      throw new Error("咨询助手暂时没有成功返回结果，请稍后重试。");
    }

    return { reply, raw: payload };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("咨询助手响应稍慢，请稍后重试，或直接留下官网地址和问题重点，我会尽量用更简短的方式回答。");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function getPublicChatApiKey() {
  if (cachedApiKey) {
    return cachedApiKey;
  }

  const value = publicChatApiKey || (publicChatApiKeyFile ? readFileSync(publicChatApiKeyFile, "utf8").trim() : "");
  if (!value) {
    throw new Error("Missing public chat API key.");
  }

  cachedApiKey = value;
  return cachedApiKey;
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
    const stream = Boolean(payload?.stream);
    console.log(`[bridge] incoming request session=${sessionId || "missing"} messageLength=${message.length}`);

    if (!message || !sessionId) {
      res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Missing message or sessionId" }));
      return;
    }

    if (isSensitiveCredentialRequest(message)) {
      const reply = getSensitiveCredentialRefusal(message);
      if (stream) {
        res.writeHead(200, { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" });
        await streamReply(res, reply, { route: "sensitive-guard" });
        return;
      }

      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(JSON.stringify({ ok: true, reply }));
      return;
    }

    const instantReply = getInstantReply(message);
    if (instantReply) {
      if (stream) {
        res.writeHead(200, { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" });
        await streamReply(res, instantReply, { route: "instant" });
        return;
      }

      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(JSON.stringify({ ok: true, reply: instantReply }));
      return;
    }

    if (stream) {
      res.writeHead(200, { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" });
      writeStreamEvent(res, { type: "start", route: "public-model" });
      writeStreamEvent(res, {
        type: "status",
        message: /[\u4e00-\u9fff]/.test(message) ? "我先快速整理问题，再给你一个简短答复。" : "Reviewing the question and preparing a concise reply.",
      });
      const result = await runPublicModel({ message, sessionId });
      await streamReply(res, result.reply, { route: "public-model" }, { skipStart: true });
      return;
    }

    const result = await runPublicModel({ message, sessionId });

    res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    res.end(JSON.stringify({ ok: true, reply: result.reply }));
  } catch (error) {
    console.error("[bridge] request failed", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (req.headers.accept?.includes("application/x-ndjson")) {
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" });
      }
      writeStreamEvent(res, { type: "error", error: errorMessage });
      res.end();
      return;
    }

    res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: errorMessage }));
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Local agent bridge listening on http://0.0.0.0:${port}/chat`);
  console.log(`Forwarding website chat directly to public model: ${publicChatModel}`);
});
