#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const defaultOutputDir = path.join(rootDir, "tmp", "insight-drafts");
const feishuBaseUrl = process.env.FEISHU_BASE_URL || "https://open.feishu.cn";

function usage() {
  console.log(`Usage:
  FEISHU_APP_ID=cli_xxx FEISHU_APP_SECRET=xxx npm run insight:feishu -- "https://xxx.feishu.cn/docx/xxxx"
  FEISHU_APP_ID=cli_xxx FEISHU_APP_SECRET=xxx npm run insight:feishu -- docx_document_token --out tmp/insight-drafts

Supported Feishu document format:
  slug: ai-search-visible-growth-assets
  status: draft
  category: GEO 洞察
  title: 文章标题
  summary: 文章摘要
  description: 文章描述
  seoTitle: SEO 标题
  seoDescription: SEO 描述
  readingTime: 5 min
  metric: GEO
  metricLabel: 可信内容资产
  relatedFaqIds: what-is-jgmao-growth-engine, geo-vs-seo
  ---
  ## 第一节标题
  第一节正文
  - 要点一
  - 要点二

  ## 第二节标题
  第二节正文
`);
}

function getArgValue(flag, fallback = "") {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function extractDocumentId(input) {
  const raw = input.trim();
  if (!raw) throw new Error("Missing Feishu document URL or document token.");

  if (!raw.startsWith("http")) return raw;

  const url = new URL(raw);
  const docxMatch = url.pathname.match(/\/docx\/([a-zA-Z0-9]+)/);
  if (docxMatch?.[1]) return docxMatch[1];

  const docMatch = url.pathname.match(/\/doc\/([a-zA-Z0-9]+)/);
  if (docMatch?.[1]) {
    throw new Error("This script currently supports new Feishu docx URLs. Please convert the old doc link to docx first.");
  }

  const wikiMatch = url.pathname.match(/\/wiki\/([a-zA-Z0-9]+)/);
  if (wikiMatch?.[1]) {
    throw new Error("Wiki links need token resolution first. Please open the actual docx document URL and use that link.");
  }

  throw new Error("Could not find a docx document token in the Feishu URL.");
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let payload;

  try {
    payload = JSON.parse(text);
  } catch (error) {
    throw new Error(`Feishu API returned non-JSON response (${response.status}): ${text.slice(0, 200)}`);
  }

  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.msg || payload.error?.message || `Feishu API request failed (${response.status}).`);
  }

  return payload;
}

async function fetchTenantAccessToken() {
  const appId = process.env.FEISHU_APP_ID || "";
  const appSecret = process.env.FEISHU_APP_SECRET || "";

  if (!appId || !appSecret) {
    throw new Error("Please set FEISHU_APP_ID and FEISHU_APP_SECRET before reading Feishu documents.");
  }

  const payload = await requestJson(`${feishuBaseUrl}/open-apis/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret,
    }),
  });

  if (!payload.data?.tenant_access_token && !payload.tenant_access_token) {
    throw new Error("Feishu tenant_access_token was not returned.");
  }

  return payload.data?.tenant_access_token || payload.tenant_access_token;
}

async function fetchRawDocumentContent(documentId, tenantAccessToken) {
  const payload = await requestJson(
    `${feishuBaseUrl}/open-apis/docx/v1/documents/${encodeURIComponent(documentId)}/raw_content`,
    {
      headers: {
        Authorization: `Bearer ${tenantAccessToken}`,
      },
    },
  );

  const content = payload.data?.content || payload.data?.raw_content || payload.content || "";
  if (!content.trim()) {
    throw new Error("Feishu document content is empty or not readable by the current app.");
  }

  return content;
}

function readMetadata(lines) {
  const metadata = {};
  const contentLines = [];
  let inMetadata = true;

  for (const line of lines) {
    const trimmed = line.trim();

    if (inMetadata && trimmed === "---") {
      inMetadata = false;
      continue;
    }

    if (inMetadata) {
      const match = trimmed.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.+)$/);
      if (match) {
        metadata[match[1]] = match[2].trim();
        continue;
      }

      if (trimmed) {
        inMetadata = false;
      }
    }

    contentLines.push(line);
  }

  return { metadata, contentLines };
}

function parseSections(contentLines) {
  const sections = [];
  let current = null;

  function flushCurrent() {
    if (!current) return;

    const bodyLines = [];
    const bullets = [];

    for (const line of current.lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
      if (bulletMatch) {
        bullets.push(bulletMatch[1].trim());
      } else {
        bodyLines.push(trimmed);
      }
    }

    sections.push({
      title: current.title,
      body: bodyLines.join("\n\n"),
      ...(bullets.length ? { bullets } : {}),
    });
  }

  for (const line of contentLines) {
    const heading = line.trim().match(/^#{2,3}\s+(.+)$/);
    if (heading) {
      flushCurrent();
      current = { title: heading[1].trim(), lines: [] };
      continue;
    }

    if (!current && line.trim()) {
      current = { title: "正文", lines: [] };
    }

    current?.lines.push(line);
  }

  flushCurrent();

  return sections.filter((section) => section.title && section.body);
}

function parseFeishuTextToDraft(content, documentId) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const { metadata, contentLines } = readMetadata(lines);
  const sections = parseSections(contentLines);
  const title = metadata.title || sections[0]?.title || "未命名文章";
  const summary = metadata.summary || sections[0]?.body?.slice(0, 110) || title;
  const slug = metadata.slug || slugify(title) || `feishu-${documentId.slice(0, 8)}`;

  if (!sections.length) {
    throw new Error("No article sections found. Please add section headings like: ## 第一节标题");
  }

  return {
    slug,
    status: metadata.status === "published" ? "published" : "draft",
    category: metadata.category || "GEO 洞察",
    title,
    summary,
    description: metadata.description || summary,
    seoTitle: metadata.seoTitle || `${title} | 坚果猫 JGMAO`,
    seoDescription: metadata.seoDescription || summary,
    publishedAt: metadata.publishedAt || new Date().toISOString().slice(0, 10),
    readingTime: metadata.readingTime || "5 min",
    metric: metadata.metric || "GEO",
    metricLabel: metadata.metricLabel || "内容资产",
    iconKey: metadata.iconKey || "file-search",
    relatedFaqIds: metadata.relatedFaqIds
      ? metadata.relatedFaqIds.split(",").map((item) => item.trim()).filter(Boolean)
      : [],
    feishuReady: true,
    source: {
      type: "feishu_docx",
      documentId,
      fetchedAt: new Date().toISOString(),
    },
    sections,
  };
}

async function main() {
  const input = process.argv[2];
  if (!input || input === "--help" || input === "-h") {
    usage();
    process.exit(input ? 0 : 1);
  }

  const outputDir = path.resolve(process.cwd(), getArgValue("--out", defaultOutputDir));
  const documentId = extractDocumentId(input);
  const token = await fetchTenantAccessToken();
  const content = await fetchRawDocumentContent(documentId, token);
  const draft = parseFeishuTextToDraft(content, documentId);
  const outputPath = path.join(outputDir, `${draft.slug}.json`);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8");

  console.log(`Generated insight draft: ${outputPath}`);
  console.log(`Title: ${draft.title}`);
  console.log(`Status: ${draft.status}`);
  console.log(`Sections: ${draft.sections.length}`);
  console.log(`Next: npm run insight:import -- ${path.relative(process.cwd(), outputPath)} --check`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
