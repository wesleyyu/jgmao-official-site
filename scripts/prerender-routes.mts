import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { faqItems } from "../src/content/faqs.ts";
import { insightArticles } from "../src/content/insights.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const siteUrl = "https://www.jgmao.com";

type PageConfig = {
  routePath: string;
  title: string;
  description: string;
  ogType?: "website" | "article";
  ogImage?: string;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
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

function replaceMeta(html: string, name: string, content: string) {
  const pattern = new RegExp(`<meta\\s+name="${name}"\\s+content="[^"]*"\\s*/?>`);
  return html.replace(pattern, `<meta name="${name}" content="${escapeHtml(content)}" />`);
}

function replacePropertyMeta(html: string, property: string, content: string) {
  const pattern = new RegExp(`<meta\\s+property="${property}"\\s+content="[^"]*"\\s*/?>`);
  if (pattern.test(html)) {
    return html.replace(pattern, `<meta property="${property}" content="${escapeHtml(content)}" />`);
  }
  return html.replace("</head>", `  <meta property="${property}" content="${escapeHtml(content)}" />\n</head>`);
}

function replaceOrAppendNamedMeta(html: string, name: string, content: string) {
  const pattern = new RegExp(`<meta\\s+name="${name}"\\s+content="[^"]*"\\s*/?>`);
  if (pattern.test(html)) {
    return html.replace(pattern, `<meta name="${name}" content="${escapeHtml(content)}" />`);
  }
  return html.replace("</head>", `  <meta name="${name}" content="${escapeHtml(content)}" />\n</head>`);
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
      </section>
    </main>
  `;
}

async function writeRoute(config: PageConfig, template: string) {
  const routeUrl = `${siteUrl}${config.routePath}`;
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(config.title)}</title>`);
  html = replaceMeta(html, "description", config.description);
  html = replacePropertyMeta(html, "og:title", config.title);
  html = replacePropertyMeta(html, "og:description", config.description);
  html = replacePropertyMeta(html, "og:type", config.ogType || "website");
  if (config.ogImage) {
    html = replacePropertyMeta(html, "og:image", config.ogImage);
    html = replaceOrAppendNamedMeta(html, "twitter:card", "summary_large_image");
    html = replaceOrAppendNamedMeta(html, "twitter:title", config.title);
    html = replaceOrAppendNamedMeta(html, "twitter:description", config.description);
    html = replaceOrAppendNamedMeta(html, "twitter:image", config.ogImage);
  }

  if (html.includes('rel="canonical"')) {
    html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${routeUrl}" />`);
  } else {
    html = html.replace("</head>", `  <link rel="canonical" href="${routeUrl}" />\n</head>`);
  }

  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${config.contentHtml}</div>`,
  );

  if (config.structuredData) {
    const payload = Array.isArray(config.structuredData) ? config.structuredData : [config.structuredData];
    html = html.replace(
      "</head>",
      `${payload
        .map(
          (item) =>
            `  <script type="application/ld+json">${JSON.stringify(item)}</script>`,
        )
        .join("\n")}\n</head>`,
    );
  }

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
      routePath: "/faq",
      title: "FAQ | 坚果猫 JGMAO",
      description: "持续更新的 FAQ 栏目，围绕坚果猫 JGMAO 的 GEO、AI 增长网站、内容系统、获客转化与合作方式沉淀高频问题。",
      structuredData: faqStructuredData,
      contentHtml: renderFaqList(),
    },
    template,
  );

  await writeRoute(
    {
      routePath: "/insights",
      title: "新闻 / 洞察 | 坚果猫 JGMAO",
      description: "坚果猫 JGMAO 关于 GEO、AI 增长网站、内容结构与增长方法论的持续洞察栏目。",
      contentHtml: renderInsightList(),
    },
    template,
  );

  const h5Title = "帮助企业构建 AI 时代的增长飞轮 | 坚果猫 JGMAO";
  const h5Description = "帮助企业把 AI 可见性、内容、官网、获客与推荐反馈连成一个可持续运转的增长系统。";
  const h5Image = `${siteUrl}/h5-share-cover.jpg`;

  for (const routePath of ["/h5", "/ai-growth"]) {
    await writeRoute(
      {
        routePath,
        title: h5Title,
        description: h5Description,
        ogImage: h5Image,
        contentHtml: renderH5Landing(),
      },
      template,
    );
  }

  for (const article of insightArticles) {
    await writeRoute(
      {
        routePath: `/insights/${article.slug}`,
        title: article.seoTitle.zh,
        description: article.seoDescription.zh,
        ogType: "article",
        structuredData: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title.zh,
          description: article.seoDescription.zh,
          articleSection: article.category.zh,
          datePublished: article.publishedAt,
          dateModified: article.publishedAt,
          mainEntityOfPage: `${siteUrl}/insights/${article.slug}`,
          url: `${siteUrl}/insights/${article.slug}`,
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
