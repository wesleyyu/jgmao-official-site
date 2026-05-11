#!/usr/bin/env node

import * as Lark from "@larksuiteoapi/node-sdk";
import http from "node:http";
import https from "node:https";

const appId = process.env.FEISHU_APP_ID || "";
const appSecret = process.env.FEISHU_APP_SECRET || "";
const gatewayUrl = process.env.FEISHU_INSIGHT_GATEWAY_URL || "http://127.0.0.1:18788/feishu/insight/events";
const targetChatId = process.env.FEISHU_TARGET_CHAT_ID || "";
const loggerLevelName = process.env.FEISHU_WS_LOG_LEVEL || "info";

function usage() {
  console.log(`Usage:
  FEISHU_APP_ID=cli_xxx FEISHU_APP_SECRET=xxx npm run insight:feishu-ws

Optional env:
  FEISHU_TARGET_CHAT_ID=oc_xxx
  FEISHU_INSIGHT_GATEWAY_URL=http://127.0.0.1:18788/feishu/insight/events
  FEISHU_WS_LOG_LEVEL=info

Supported group commands:
  发布官网文章 https://xxx.feishu.cn/docx/xxxx
  确认发布 article-slug
  取消发布 article-slug
  查看待发布文章
`);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  usage();
  process.exit(0);
}

if (!appId || !appSecret) {
  console.error("Missing FEISHU_APP_ID or FEISHU_APP_SECRET.");
  usage();
  process.exit(1);
}

const loggerLevel = Lark.LoggerLevel?.[loggerLevelName] ?? Lark.LoggerLevel?.info ?? Lark.LoggerLevel?.debug;

function parseTextContent(content) {
  if (!content) return "";
  if (typeof content === "object") return content.text || "";
  try {
    const parsed = JSON.parse(content);
    return parsed?.text || "";
  } catch {
    return String(content || "");
  }
}

async function forwardEventToGateway(eventData) {
  const payload = await postJson(
    gatewayUrl,
    {
      event: eventData,
      header: {
        event_type: "im.message.receive_v1",
      },
    },
  );

  if (payload?.ok === false) {
    throw new Error(payload?.error || "Gateway returned an error");
  }

  return payload;
}

function postJson(url, body) {
  const target = new URL(url);
  const bodyText = JSON.stringify(body);
  const transport = target.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const request = transport.request(
      target,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": Buffer.byteLength(bodyText),
        },
        timeout: 15000,
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const responseText = Buffer.concat(chunks).toString("utf8");
          let payload = {};
          try {
            payload = responseText ? JSON.parse(responseText) : {};
          } catch {
            payload = {};
          }

          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(payload?.error || `Gateway returned ${response.statusCode}`));
            return;
          }

          resolve(payload);
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error("Gateway request timed out"));
    });
    request.on("error", reject);
    request.write(bodyText);
    request.end();
  });
}

const wsClient = new Lark.WSClient({
  appId,
  appSecret,
  loggerLevel,
});

const eventDispatcher = new Lark.EventDispatcher({}).register({
  "im.message.receive_v1": async (data) => {
    const message = data?.message || {};
    const chatId = message.chat_id || "";
    const messageType = message.message_type || "";
    const text = parseTextContent(message.content).trim();

    if (targetChatId && chatId && chatId !== targetChatId) {
      return;
    }

    if (messageType && messageType !== "text") {
      return;
    }

    if (!/(发布官网文章|发布文章|生成官网文章|确认发布|取消发布|查看待发布文章|发布队列)/.test(text)) {
      return;
    }

    console.log(`[feishu-ws] command from chat=${chatId || "-"} text=${text.slice(0, 120)}`);
    const result = await forwardEventToGateway(data);
    console.log(`[feishu-ws] gateway result handled=${Boolean(result?.handled)}`);
  },
});

console.log(`[feishu-ws] starting long connection for app ${appId}`);
console.log(`[feishu-ws] forwarding commands to ${gatewayUrl}`);
if (targetChatId) {
  console.log(`[feishu-ws] only accepting chat ${targetChatId}`);
}

wsClient.start({ eventDispatcher });
