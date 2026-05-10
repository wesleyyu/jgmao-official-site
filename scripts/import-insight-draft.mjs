#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const insightsPath = path.join(rootDir, "src/content/insights.ts");

function usage() {
  console.log(`Usage:
  npm run insight:import -- docs/feishu-insight-draft.example.json
  npm run insight:import -- docs/feishu-insight-draft.example.json --check

The draft JSON should contain:
  slug, title, summary, description, sections

Optional fields:
  category, seoTitle, seoDescription, publishedAt, readingTime, status,
  relatedFaqIds, metric, metricLabel, iconKey, accent, glow
`);
}

function assertString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required string field: ${field}`);
  }
  return value.trim();
}

function localized(value, fallback = "") {
  if (typeof value === "string") {
    const text = value.trim() || fallback;
    return { zh: text, en: text };
  }

  if (value && typeof value === "object") {
    const zh = typeof value.zh === "string" && value.zh.trim() ? value.zh.trim() : fallback;
    const en = typeof value.en === "string" && value.en.trim() ? value.en.trim() : zh;
    return { zh, en };
  }

  return { zh: fallback, en: fallback };
}

function localizedArray(items = []) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => localized(item)).filter((item) => item.zh);
}

function normalizeDraft(draft) {
  const slug = assertString(draft.slug, "slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("slug should use lowercase letters, numbers, and hyphens only.");
  }

  const title = localized(draft.title);
  const summary = localized(draft.summary);
  const description = localized(draft.description || draft.summary);
  const sections = Array.isArray(draft.sections) ? draft.sections : [];

  if (!title.zh) throw new Error("title.zh is required.");
  if (!summary.zh) throw new Error("summary.zh is required.");
  if (!sections.length) throw new Error("At least one section is required.");

  return {
    slug,
    category: localized(draft.category, "GEO 洞察"),
    title,
    summary,
    description,
    seoTitle: localized(draft.seoTitle, `${title.zh} | 坚果猫 JGMAO`),
    seoDescription: localized(draft.seoDescription, summary.zh),
    publishedAt: draft.publishedAt || new Date().toISOString().slice(0, 10),
    readingTime: draft.readingTime || "5 min",
    featured: Boolean(draft.featured),
    accent: draft.accent || "#52E6FF",
    glow: draft.glow || "rgba(82, 230, 255, 0.18)",
    metric: draft.metric || "GEO",
    metricLabel: localized(draft.metricLabel, "内容资产"),
    iconKey: draft.iconKey || "file-search",
    publishing: {
      status: draft.status === "published" ? "published" : "draft",
      source: "local",
      openclawAgent: draft.openclawAgent || "jgmao-support-agent",
      distributionTargets: Array.isArray(draft.distributionTargets) ? draft.distributionTargets : ["website", "feishu"],
      feishuReady: Boolean(draft.feishuReady),
    },
    relatedFaqIds: Array.isArray(draft.relatedFaqIds) ? draft.relatedFaqIds : [],
    sections: sections.map((section, index) => {
      const titleValue = localized(section.title);
      const body = localized(section.body);

      if (!titleValue.zh) throw new Error(`sections[${index}].title is required.`);
      if (!body.zh) throw new Error(`sections[${index}].body is required.`);

      const normalized = {
        title: titleValue,
        body,
      };

      const bullets = localizedArray(section.bullets);
      if (bullets.length) normalized.bullets = bullets;

      return normalized;
    }),
  };
}

function serializeArticle(article) {
  return JSON.stringify(article, null, 2)
    .replaceAll('"slug":', "slug:")
    .replaceAll('"category":', "category:")
    .replaceAll('"title":', "title:")
    .replaceAll('"summary":', "summary:")
    .replaceAll('"description":', "description:")
    .replaceAll('"seoTitle":', "seoTitle:")
    .replaceAll('"seoDescription":', "seoDescription:")
    .replaceAll('"publishedAt":', "publishedAt:")
    .replaceAll('"readingTime":', "readingTime:")
    .replaceAll('"featured":', "featured:")
    .replaceAll('"accent":', "accent:")
    .replaceAll('"glow":', "glow:")
    .replaceAll('"metric":', "metric:")
    .replaceAll('"metricLabel":', "metricLabel:")
    .replaceAll('"iconKey":', "iconKey:")
    .replaceAll('"publishing":', "publishing:")
    .replaceAll('"status":', "status:")
    .replaceAll('"source":', "source:")
    .replaceAll('"openclawAgent":', "openclawAgent:")
    .replaceAll('"distributionTargets":', "distributionTargets:")
    .replaceAll('"feishuReady":', "feishuReady:")
    .replaceAll('"relatedFaqIds":', "relatedFaqIds:")
    .replaceAll('"sections":', "sections:")
    .replaceAll('"body":', "body:")
    .replaceAll('"bullets":', "bullets:")
    .replaceAll('"zh":', "zh:")
    .replaceAll('"en":', "en:");
}

async function main() {
  const draftPath = process.argv[2];
  const checkOnly = process.argv.includes("--check") || process.argv.includes("--dry-run");
  if (!draftPath || draftPath === "--help" || draftPath === "-h") {
    usage();
    process.exit(draftPath ? 0 : 1);
  }

  const absoluteDraftPath = path.resolve(process.cwd(), draftPath);
  const draft = JSON.parse(await readFile(absoluteDraftPath, "utf8"));
  const article = normalizeDraft(draft);
  const source = await readFile(insightsPath, "utf8");

  if (source.includes(`slug: "${article.slug}"`) || source.includes(`"slug": "${article.slug}"`)) {
    throw new Error(`Article slug already exists: ${article.slug}`);
  }

  const marker = "export const insightArticles: InsightArticle[] = [";
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error("Could not find insightArticles array in src/content/insights.ts");
  }

  if (checkOnly) {
    console.log(`Draft is valid: ${article.slug}`);
    console.log(`Status: ${article.publishing.status}`);
    console.log("No files changed because --check was used.");
    return;
  }

  const insertIndex = markerIndex + marker.length;
  const articleSource = `\n  ${serializeArticle(article).replaceAll("\n", "\n  ")},`;
  const updated = `${source.slice(0, insertIndex)}${articleSource}${source.slice(insertIndex)}`;

  await writeFile(insightsPath, updated, "utf8");
  console.log(`Imported insight draft: ${article.slug}`);
  console.log(`Status: ${article.publishing.status}`);
  console.log("Next: review src/content/insights.ts, then run npm run build.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
