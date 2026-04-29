import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { faqItems } from "../src/content/faqs.ts";
import { insightArticles } from "../src/content/insights.ts";
import {
  aiGrowthGeoShell,
  aiGrowthNewGeoShell,
  applyGeoShellToHtml,
  geoScoreGeoShell,
  geoUpgradeGeoShell,
  h5GeoShell,
  siteUrl,
  type GeoShellConfig,
} from "./shared-geo-shell.mts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

type PageConfig = {
  routePath: string;
  geoShell: GeoShellConfig;
  contentHtml: string;
};

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInsightList() {
  return `
    <main style="background:#050816;color:#e5eef8;min-height:100vh;padding:48px 24px;font-family:'IBM Plex Sans',system-ui,sans-serif;">
      <section style="max-width:1080px;margin:0 auto;">
        <p style="margin:0 0 12px;color:#8fa3bc;font-size:12px;letter-spacing:.24em;text-transform:uppercase;">新闻 / 洞察</p>
        <h1 style="margin:0;font-size:40px;line-height:1.15;color:#fff;">持续更新的内容栏目</h1>
        <p style="margin:20px 0 0;max-width:760px;font-size:16px;line-height:1.9;color:#b8c7d9;">
          这里承载坚果猫 JGMAO 关于 GEO、AI 增长网站、内容结构、案例延展与增长方法论的持续内容输出。
        </p>
        <div style="margin-top:32px;display:grid;gap:16px;">
          ${insightArticles
            .map(
              (article) => `
              <article style="border:1px solid rgba(255,255,255,.1);border-radius:24px;background:rgba(255,255,255,.04);padding:24px;">
                <p style="margin:0 0 10px;color:#8fa3bc;font-size:12px;letter-spacing:.18em;text-transform:uppercase;">${escapeHtml(article.category.zh)} · ${escapeHtml(article.publishedAt)}</p>
                <h2 style="margin:0 0 12px;font-size:28px;line-height:1.3;color:#fff;">${escapeHtml(article.title.zh)}</h2>
                <p style="margin:0;color:#c9d6e5;font-size:15px;line-height:1.8;">${escapeHtml(article.summary.zh)}</p>
              </article>
            `,
            )
            .join("")}
        </div>
      </section>
    </main>
  `;
}

function renderFaqList() {
  return `
    <main style="background:#050816;color:#e5eef8;min-height:100vh;padding:48px 24px;font-family:'IBM Plex Sans',system-ui,sans-serif;">
      <section style="max-width:1080px;margin:0 auto;">
        <p style="margin:0 0 12px;color:#8fa3bc;font-size:12px;letter-spacing:.24em;text-transform:uppercase;">FAQ</p>
        <h1 style="margin:0;font-size:40px;line-height:1.15;color:#fff;">持续更新的 FAQ 栏目</h1>
        <p style="margin:20px 0 0;max-width:760px;font-size:16px;line-height:1.9;color:#b8c7d9;">
          这里持续沉淀坚果猫 JGMAO 关于 GEO、AI 增长网站、内容系统、智能获客与合作方式的高频问题。
        </p>
        <div style="margin-top:32px;display:grid;gap:16px;">
          ${faqItems
            .map(
              (item, index) => `
              <article id="${escapeHtml(item.id)}" style="border:1px solid rgba(255,255,255,.1);border-radius:24px;background:rgba(255,255,255,.04);padding:24px;">
                <p style="margin:0 0 10px;color:#8fa3bc;font-size:12px;letter-spacing:.18em;text-transform:uppercase;">问题 ${String(index + 1).padStart(2, "0")}</p>
                <h2 style="margin:0 0 12px;font-size:24px;line-height:1.35;color:#fff;">${escapeHtml(item.question.zh)}</h2>
                <p style="margin:0;color:#c9d6e5;font-size:15px;line-height:1.8;">${escapeHtml(item.answer.zh)}</p>
              </article>
            `,
            )
            .join("")}
        </div>
      </section>
    </main>
  `;
}

function renderInsightDetail(slug: string) {
  const article = insightArticles.find((item) => item.slug === slug);
  if (!article) return "";

  const relatedFaqs = faqItems.filter((item) => article.relatedFaqIds.includes(item.id));

  return `
    <main style="background:#050816;color:#e5eef8;min-height:100vh;padding:48px 24px;font-family:'IBM Plex Sans',system-ui,sans-serif;">
      <section style="max-width:980px;margin:0 auto;display:grid;gap:24px;">
        <article style="border:1px solid rgba(255,255,255,.1);border-radius:28px;background:rgba(255,255,255,.04);padding:28px;">
          <p style="margin:0 0 12px;color:#8fa3bc;font-size:12px;letter-spacing:.22em;text-transform:uppercase;">${escapeHtml(article.category.zh)} · ${escapeHtml(article.publishedAt)}</p>
          <h1 style="margin:0;font-size:42px;line-height:1.18;color:#fff;">${escapeHtml(article.title.zh)}</h1>
          <p style="margin:20px 0 0;font-size:16px;line-height:1.9;color:#c9d6e5;">${escapeHtml(article.description.zh)}</p>
        </article>

        <article style="border:1px solid rgba(255,255,255,.1);border-radius:28px;background:rgba(255,255,255,.04);padding:28px;">
          ${article.sections
            .map(
              (section) => `
              <section style="padding:0 0 24px;margin:0 0 24px;border-bottom:1px solid rgba(255,255,255,.08);">
                <h2 style="margin:0 0 12px;font-size:28px;line-height:1.3;color:#fff;">${escapeHtml(section.title.zh)}</h2>
                <p style="margin:0;font-size:15px;line-height:1.9;color:#c9d6e5;">${escapeHtml(section.body.zh)}</p>
                ${
                  section.bullets?.length
                    ? `<ul style="margin:16px 0 0;padding-left:20px;color:#d9e3ef;">${section.bullets
                        .map((bullet) => `<li style="margin:8px 0;line-height:1.8;">${escapeHtml(bullet.zh)}</li>`)
                        .join("")}</ul>`
                    : ""
                }
              </section>
            `,
            )
            .join("")}
        </article>

        ${
          relatedFaqs.length
            ? `
          <article style="border:1px solid rgba(255,255,255,.1);border-radius:28px;background:rgba(255,255,255,.04);padding:28px;">
            <p style="margin:0 0 12px;color:#8fa3bc;font-size:12px;letter-spacing:.22em;text-transform:uppercase;">相关 FAQ</p>
            <h2 style="margin:0;font-size:30px;line-height:1.25;color:#fff;">继续查看高频问题与标准回答</h2>
            <div style="margin-top:20px;display:grid;gap:14px;">
              ${relatedFaqs
                .map(
                  (faq) => `
                  <div style="border:1px solid rgba(255,255,255,.08);border-radius:20px;background:rgba(255,255,255,.03);padding:18px;">
                    <h3 style="margin:0 0 10px;font-size:18px;line-height:1.5;color:#fff;">${escapeHtml(faq.question.zh)}</h3>
                    <p style="margin:0;color:#c9d6e5;font-size:14px;line-height:1.8;">${escapeHtml(faq.answer.zh)}</p>
                  </div>
                `,
                )
                .join("")}
            </div>
          </article>
        `
            : ""
        }
      </section>
    </main>
  `;
}

function renderH5Landing() {
  return `
    <main style="background:#050816;color:#e5eef8;min-height:100vh;padding:40px 20px 88px;font-family:'IBM Plex Sans',system-ui,sans-serif;">
      <section style="max-width:430px;margin:0 auto;border:1px solid rgba(255,255,255,.1);border-radius:32px;background:rgba(255,255,255,.04);padding:24px;">
        <p style="margin:0 0 12px;color:#8fa3bc;font-size:12px;letter-spacing:.24em;text-transform:uppercase;">坚果猫 JGMAO</p>
        <h1 style="margin:0;font-size:40px;line-height:1.15;color:#fff;">帮助企业构建<br/>AI 时代的增长飞轮</h1>
        <p style="margin:20px 0 0;font-size:16px;line-height:1.9;color:#c9d6e5;">
          把 AI 可见性、内容、官网、获客与推荐反馈连成一个可持续运转的增长系统。
        </p>
        <div style="margin-top:24px;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,.08);">
          <img src="${siteUrl}/h5-share-cover.jpg" alt="AI 时代增长飞轮主视觉" style="display:block;width:100%;height:auto;" />
        </div>
        <div style="margin-top:24px;display:grid;gap:14px;">
          <article style="border:1px solid rgba(255,255,255,.08);border-radius:22px;background:rgba(255,255,255,.03);padding:18px;">
            <h2 style="margin:0 0 10px;font-size:20px;line-height:1.35;color:#fff;">适合哪些团队</h2>
            <p style="margin:0;font-size:14px;line-height:1.8;color:#c9d6e5;">
              适合需要提升 AI 可见性、官网 GEO 与内容增长能力的企业团队，尤其适合正在升级官网、FAQ、案例页、专题页与获客承接路径的品牌方。
            </p>
          </article>
          <article style="border:1px solid rgba(255,255,255,.08);border-radius:22px;background:rgba(255,255,255,.03);padding:18px;">
            <h2 style="margin:0 0 10px;font-size:20px;line-height:1.35;color:#fff;">核心增长问题</h2>
            <p style="margin:0;font-size:14px;line-height:1.8;color:#c9d6e5;">
              常见问题包括 AI 搜索中看不见、官网既难被看见也难以转化、内容做了很多却没有形成增长资产。坚果猫会通过 GEO、官网结构优化、FAQ、案例与内容资产体系，帮助企业建立真正可持续的增长闭环。
            </p>
          </article>
        </div>
      </section>
    </main>
  `;
}

function renderGeoScoreLanding() {
  return `
    <main style="background:#050816;color:#e5eef8;min-height:100vh;padding:40px 20px 88px;font-family:'IBM Plex Sans',system-ui,sans-serif;">
      <section style="max-width:430px;margin:0 auto;border:1px solid rgba(255,255,255,.1);border-radius:32px;background:rgba(255,255,255,.04);padding:24px;">
        <p style="margin:0 0 12px;color:#8fa3bc;font-size:12px;letter-spacing:.24em;text-transform:uppercase;">官网 GEO 评分器</p>
        <h1 style="margin:0;font-size:40px;line-height:1.15;color:#fff;">输入官网网址，<br/>快速获取基础 GEO 评分</h1>
        <p style="margin:20px 0 0;font-size:16px;line-height:1.9;color:#c9d6e5;">
          快速查看官网在抓取、结构、FAQ 与承接方面的基础表现，并领取详细分析建议。
        </p>
        <div style="margin-top:24px;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,.08);padding:16px;background:rgba(255,255,255,.03);">
          <p style="margin:0 0 8px;color:#fff;font-size:18px;">适合谁</p>
          <p style="margin:0;color:#c9d6e5;font-size:14px;line-height:1.8;">需要提升 AI 可见性、官网 GEO 与内容增长能力的企业团队。</p>
        </div>
        <div style="margin-top:24px;display:grid;gap:14px;">
          <article style="border:1px solid rgba(255,255,255,.08);border-radius:22px;background:rgba(255,255,255,.03);padding:18px;">
            <h2 style="margin:0 0 10px;font-size:20px;line-height:1.35;color:#fff;">评分会看什么</h2>
            <p style="margin:0;font-size:14px;line-height:1.8;color:#c9d6e5;">
              评分会重点检查 HTTPS、标题与描述、首页主题表达、canonical、结构化数据、FAQ 信号、联系方式、robots.txt、sitemap.xml 以及官网内容深度，快速判断官网在 GEO 方面的基础完整度。
            </p>
          </article>
          <article style="border:1px solid rgba(255,255,255,.08);border-radius:22px;background:rgba(255,255,255,.03);padding:18px;">
            <h2 style="margin:0 0 10px;font-size:20px;line-height:1.35;color:#fff;">提交后会得到什么</h2>
            <p style="margin:0;font-size:14px;line-height:1.8;color:#c9d6e5;">
              你会先看到一个基础 GEO 分数和优先改进项，留下联系方式后，顾问团队会结合官网结构、FAQ、主题覆盖与承接路径，继续给出更具体的优化建议。
            </p>
          </article>
        </div>
      </section>
    </main>
  `;
}

async function writeRoute(config: PageConfig, template: string) {
  let html = applyGeoShellToHtml(template, config.geoShell);
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${config.contentHtml}</div>`,
  );

  const outputDir = path.join(distDir, config.routePath.replace(/^\//, ""));
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "index.html"), html, "utf8");
}

async function main() {
  const template = await readFile(path.join(distDir, "index.html"), "utf8");

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question.zh,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer.zh,
      },
    })),
  };

  await writeRoute(
    {
      routePath: "/faq/",
      geoShell: {
        title: "FAQ | 坚果猫 JGMAO",
        description:
          "持续更新的 FAQ 栏目，围绕坚果猫 JGMAO 的 GEO、AI 增长网站、内容系统、获客转化与合作方式沉淀高频问题。",
        canonicalUrl: `${siteUrl}/faq/`,
        structuredData: faqStructuredData,
      },
      contentHtml: renderFaqList(),
    },
    template,
  );

  await writeRoute(
    {
      routePath: "/insights/",
      geoShell: {
        title: "新闻 / 洞察 | 坚果猫 JGMAO",
        description:
          "坚果猫 JGMAO 关于 GEO、AI 增长网站、内容结构与增长方法论的持续洞察栏目。",
        canonicalUrl: `${siteUrl}/insights/`,
      },
      contentHtml: renderInsightList(),
    },
    template,
  );

  await writeRoute(
    {
      routePath: "/h5/",
      geoShell: h5GeoShell,
      contentHtml: renderH5Landing(),
    },
    template,
  );

  await writeRoute(
    {
      routePath: "/ai-growth/",
      geoShell: aiGrowthGeoShell,
      contentHtml: renderH5Landing(),
    },
    template,
  );

  await writeRoute(
    {
      routePath: "/ai-growth-new/",
      geoShell: aiGrowthNewGeoShell,
      contentHtml: "",
    },
    template,
  );

  await writeRoute(
    {
      routePath: "/geo-score/",
      geoShell: geoScoreGeoShell,
      contentHtml: "",
    },
    template,
  );

  await writeRoute(
    {
      routePath: "/geo-upgrade/",
      geoShell: geoUpgradeGeoShell,
      contentHtml: "",
    },
    template,
  );

  for (const article of insightArticles) {
    await writeRoute(
      {
        routePath: `/insights/${article.slug}/`,
        geoShell: {
          title: article.seoTitle.zh,
          description: article.seoDescription.zh,
          ogType: "article",
          canonicalUrl: `${siteUrl}/insights/${article.slug}/`,
          structuredData: {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: article.title.zh,
            description: article.seoDescription.zh,
            articleSection: article.category.zh,
            datePublished: article.publishedAt,
            dateModified: article.publishedAt,
            mainEntityOfPage: `${siteUrl}/insights/${article.slug}/`,
            url: `${siteUrl}/insights/${article.slug}/`,
            inLanguage: "zh-CN",
            author: {
              "@type": "Organization",
              name: "坚果猫 JGMAO",
            },
            publisher: {
              "@type": "Organization",
              name: "坚果猫 JGMAO",
            },
          },
        },
        contentHtml: renderInsightDetail(article.slug),
      },
      template,
    );
  }

  console.log("Prerendered FAQ and insights routes.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
