const siteUrl = "https://www.jgmao.com";

export type StructuredData =
  | Record<string, unknown>
  | Array<Record<string, unknown>>;

export type GeoShellConfig = {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  canonicalUrl: string;
  structuredData?: StructuredData;
  hiddenSeoHtml?: string;
};

function stripIndent(text: string) {
  const lines = text.replace(/^\n+|\n+$/g, "").split("\n");
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^(\s*)/)?.[1].length ?? 0);
  const minIndent = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(minIndent)).join("\n");
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function replaceMeta(html: string, name: string, content: string) {
  const pattern = new RegExp(
    `<meta\\s+name="${name}"\\s+content="[^"]*"\\s*/?>`,
  );
  if (pattern.test(html)) {
    return html.replace(
      pattern,
      `<meta name="${name}" content="${escapeHtml(content)}" />`,
    );
  }
  return html.replace(
    "</head>",
    `  <meta name="${name}" content="${escapeHtml(content)}" />\n</head>`,
  );
}

function replacePropertyMeta(html: string, property: string, content: string) {
  const pattern = new RegExp(
    `<meta\\s+property="${property}"\\s+content="[^"]*"\\s*/?>`,
  );
  if (pattern.test(html)) {
    return html.replace(
      pattern,
      `<meta property="${property}" content="${escapeHtml(content)}" />`,
    );
  }
  return html.replace(
    "</head>",
    `  <meta property="${property}" content="${escapeHtml(content)}" />\n</head>`,
  );
}

function normalizeStructuredData(
  structuredData?: StructuredData,
): Array<Record<string, unknown>> {
  if (!structuredData) return [];
  return Array.isArray(structuredData) ? structuredData : [structuredData];
}

function renderStructuredDataScripts(structuredData?: StructuredData) {
  return normalizeStructuredData(structuredData)
    .map(
      (item) =>
        `  <script type="application/ld+json">${JSON.stringify(item)}</script>`,
    )
    .join("\n");
}

function renderHiddenShell(hiddenSeoHtml?: string) {
  if (!hiddenSeoHtml) return "";
  return stripIndent(`
    <div
      aria-hidden="true"
      style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"
    >
    ${hiddenSeoHtml
      .split("\n")
      .map((line) => `      ${line}`)
      .join("\n")}
    </div>
  `);
}

export function applyGeoShellToHtml(html: string, config: GeoShellConfig) {
  let nextHtml = html;

  nextHtml = nextHtml.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(config.title)}</title>`,
  );
  nextHtml = replaceMeta(nextHtml, "description", config.description);
  if (config.keywords) {
    nextHtml = replaceMeta(nextHtml, "keywords", config.keywords);
  }
  nextHtml = replacePropertyMeta(
    nextHtml,
    "og:title",
    config.ogTitle ?? config.title,
  );
  nextHtml = replacePropertyMeta(
    nextHtml,
    "og:description",
    config.ogDescription ?? config.description,
  );
  nextHtml = replacePropertyMeta(
    nextHtml,
    "og:type",
    config.ogType ?? "website",
  );
  nextHtml = replacePropertyMeta(nextHtml, "og:url", config.canonicalUrl);

  if (config.ogImage) {
    nextHtml = replacePropertyMeta(nextHtml, "og:image", config.ogImage);
    nextHtml = replaceMeta(nextHtml, "twitter:card", "summary_large_image");
    nextHtml = replaceMeta(nextHtml, "twitter:title", config.ogTitle ?? config.title);
    nextHtml = replaceMeta(
      nextHtml,
      "twitter:description",
      config.ogDescription ?? config.description,
    );
    nextHtml = replaceMeta(nextHtml, "twitter:image", config.ogImage);
  }

  if (nextHtml.includes('rel="canonical"')) {
    nextHtml = nextHtml.replace(
      /<link rel="canonical" href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${config.canonicalUrl}" />`,
    );
  } else {
    nextHtml = nextHtml.replace(
      "</head>",
      `  <link rel="canonical" href="${config.canonicalUrl}" />\n</head>`,
    );
  }

  nextHtml = nextHtml.replace(
    /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
    "",
  );

  const structuredDataScripts = renderStructuredDataScripts(config.structuredData);
  if (structuredDataScripts) {
    nextHtml = nextHtml.replace("</head>", `${structuredDataScripts}\n</head>`);
  }

  const hiddenShell = renderHiddenShell(config.hiddenSeoHtml);
  nextHtml = nextHtml.replace(
    /<div\s+aria-hidden="true"[\s\S]*?<\/div>\s*(?=<div id="root">)/,
    hiddenShell ? `${hiddenShell}\n` : "",
  );

  return nextHtml;
}

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "坚果猫 JGMAO",
  alternateName: "JGMAO",
  url: `${siteUrl}/`,
  email: "service@jgmao.com",
  telephone: "400-9588-315",
  description:
    "坚果猫（JGMAO）专注于帮助企业提升 AI 可见性、内容生产效率、官网转化与智能获客能力，把 AI 可见性、内容、官网、获客与推荐反馈连成一个真正可运转的增长系统。",
};

export const homeGeoShell: GeoShellConfig = {
  title:
    "坚果猫 JGMAO AI 增长引擎 | GEO优化引擎 | AI内容工厂 | AI增长网站 | 智能获客系统 | AI推荐分析",
  description:
    "坚果猫 JGMAO AI 增长引擎帮助企业在 AI 时代构建 AI 增长飞轮，包含 GEO 优化引擎、AI 内容工厂、AI 增长网站、智能获客系统和 AI推荐分析五大部分。",
  keywords:
    "坚果猫, JGMAO, 坚果猫 JGMAO, AI增长引擎, GEO优化引擎, AI内容工厂, AI增长网站, 智能获客系统, AI推荐分析, GEO优化, AI搜索优化",
  ogTitle: "坚果猫 JGMAO AI 增长引擎 | 企业 AI 增长飞轮",
  ogDescription:
    "通过 GEO 优化、AI 内容工厂、AI 增长网站、智能获客系统与 AI推荐分析，帮助企业在 AI 时代构建增长飞轮。",
  canonicalUrl: `${siteUrl}/`,
  structuredData: [
    organizationStructuredData,
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "坚果猫 JGMAO",
      url: `${siteUrl}/`,
      description:
        "帮助企业构建 AI 时代的增长飞轮，提升 AI 可见性、内容资产、官网承接与智能获客能力。",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "什么是坚果猫 JGMAO AI 增长引擎？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "坚果猫 JGMAO AI 增长引擎是一套帮助企业在 AI 时代构建增长飞轮的系统，包含 GEO 优化引擎、AI 内容工厂、AI 增长网站、智能获客系统和 AI 推荐分析五大部分。",
          },
        },
        {
          "@type": "Question",
          name: "GEO 优化和传统 SEO 有什么区别？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "SEO 更偏向网页排名，GEO 更关注品牌在 AI 问答、生成式搜索和推荐场景中是否容易被抽取、总结、引用和采信。",
          },
        },
        {
          "@type": "Question",
          name: "AI 增长网站的重点是什么？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "重点在于让官网从展示页面升级为可解释、可信、可转化的增长入口，并把 FAQ、案例、专题页、联系方式和转化路径连成统一结构。",
          },
        },
      ],
    },
  ],
  hiddenSeoHtml: stripIndent(`
    <h1>帮助企业构建 AI 时代的增长飞轮</h1>
    <p>
      坚果猫（JGMAO）专注于帮助企业提升 AI 可见性、内容生产效率、官网转化与智能获客能力，把 AI 可见性、内容、官网、获客与推荐反馈连成一个真正可运转的增长系统。
    </p>
    <p>
      我们围绕 GEO 优化、AI 增长网站、内容资产、智能获客与推荐反馈，帮助企业构建可持续放大的增长闭环。官网不仅是展示页面，更应该成为可解释、可信、可转化的增长入口。
    </p>
    <p>
      常见问题包括：什么是 GEO 优化、为什么官网需要 FAQ 结构、AI 可见性如何提升、内容资产如何沉淀、官网承接如何升级、如何通过电话咨询、商务邮箱和企微客服承接高意向线索。
    </p>
    <p>
      联系坚果猫：官网 www.jgmao.com，商务邮箱 service@jgmao.com，电话 400-9588-315。我们通过 FAQ、案例、专题页、结构化数据、canonical、robots.txt 与 sitemap.xml，持续完善官网 GEO 基础设施。
    </p>
    <p>
      坚果猫的官网增长方法并不只看流量，而是看 AI 可见性、内容资产、官网承接与商机转化是否真正形成增长闭环。我们会围绕首页主题表达、FAQ 问答结构、案例证据、专题页覆盖、联系方式承接、线索入口与推荐反馈持续迭代官网结构，帮助企业在 AI 搜索、问答与推荐场景中被更稳定地理解、引用与推荐。
    </p>
    <p>
      对于 GEO 优化而言，官网必须具备更清晰的主题聚焦、层级标题、答案先行的表达方式、可信证据块、FAQ 问答结构、案例引用、联系承接路径和结构化数据基础。坚果猫会将这些能力放在同一套增长飞轮里统一优化，而不是把内容、官网、线索和推荐判断拆开单独处理。
    </p>
    <p>
      在内容资产层，官网需要形成可持续沉淀的专题页、行业页、方案页、FAQ、案例页与高意图入口。内容不是零散页面堆砌，而是围绕关键主题建立统一结构、统一语义和长期复用能力，从而支撑 AI 可见性、官网承接和持续获客。没有内容资产，企业就很难在 AI 时代形成长期稳定的增长基础。
    </p>
    <p>
      在官网承接层，用户来到网站后需要快速看懂企业是谁、能做什么、适合什么场景、为什么值得信任以及下一步如何联系。官网不能只是展示页面，而要成为可解释、可信、可转化的增长入口。因此我们强调公司介绍、能力模块、FAQ、案例、联系方式、企微入口、电话咨询和表单留资等承接设计，让高意向用户更容易完成咨询动作。
    </p>
    <p>
      在智能获客层，我们关注的不只是点击，而是高意向咨询动作、线索承接效率与后续跟进质量。通过电话、企微、表单、飞书线索流转以及统一的线索记录机制，企业可以把官网访问、FAQ 阅读、案例浏览和咨询动作连接起来，逐步形成对内容、官网和商机之间关系的真实判断，而不是只停留在表面的访问量统计。
    </p>
    <p>
      常见的官网 GEO 优化问题包括：首页主题表达不集中、缺少明确 H1、FAQ 不成体系、案例证明不足、canonical 缺失、结构化数据不完整、robots.txt 与 sitemap.xml 未正确配置、联系方式不清晰、内容深度不足、专题页覆盖不够、页面难以被 AI 抽取与引用等。坚果猫围绕这些关键问题建立标准化评估和持续优化机制，帮助企业把官网打造成 AI 时代真正可运转的增长系统。
    </p>
    <p>
      对潜在客户而言，官网 GEO 不是一个孤立动作，而是企业在 AI 搜索、问答、推荐与官网承接之间建立统一结构的基础工程。只有当首页主题、FAQ、案例、专题页、联系入口与内容资产形成持续协同，企业才能在 AI 时代获得更稳定的曝光、更清晰的品牌理解、更高质量的咨询动作以及更可持续的增长结果。
    </p>
  `),
};

const growthFlywheelService = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "AI 增长飞轮咨询",
  provider: {
    "@type": "Organization",
    name: "坚果猫 JGMAO",
    url: siteUrl,
  },
  areaServed: "CN",
  serviceType: "GEO 优化、AI 增长网站、内容增长与企业增长系统咨询",
  description: "帮助企业提升 AI 可见性、官网 GEO、内容资产与获客承接能力。",
};

const h5HiddenSeoHtml = stripIndent(`
  <h1>帮助企业构建 AI 时代的增长飞轮</h1>
  <p>
    坚果猫 JGMAO 的 AI 增长飞轮咨询页，围绕 AI 可见性、官网 GEO、内容增长与获客转化，帮助企业把内容、官网、线索与推荐反馈连成统一的增长系统。
  </p>
  <p>
    这张 H5 页面面向需要官网升级、GEO 优化、FAQ 结构完善、案例内容沉淀、内容资产建设与高意向咨询承接的企业团队，适合在微信和社群场景中转发传播。
  </p>
`);

export const aiGrowthGeoShell: GeoShellConfig = {
  title: "帮助企业构建 AI 时代的增长飞轮 | 坚果猫 JGMAO",
  description:
    "帮助企业把 AI 可见性、内容、官网、获客与推荐反馈连成一个可持续运转的增长系统。",
  canonicalUrl: `${siteUrl}/ai-growth/`,
  ogImage: `${siteUrl}/h5-share-cover.jpg`,
  structuredData: [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "帮助企业构建 AI 时代的增长飞轮 | 坚果猫 JGMAO",
      url: `${siteUrl}/ai-growth/`,
      description:
        "帮助企业把 AI 可见性、内容、官网、获客与推荐反馈连成一个可持续运转的增长系统。",
      inLanguage: "zh-CN",
    },
    growthFlywheelService,
  ],
  hiddenSeoHtml: h5HiddenSeoHtml,
};

export const h5GeoShell: GeoShellConfig = {
  ...aiGrowthGeoShell,
  canonicalUrl: `${siteUrl}/h5/`,
  structuredData: [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "帮助企业构建 AI 时代的增长飞轮 | 坚果猫 JGMAO",
      url: `${siteUrl}/h5/`,
      description:
        "帮助企业把 AI 可见性、内容、官网、获客与推荐反馈连成一个可持续运转的增长系统。",
      inLanguage: "zh-CN",
    },
    growthFlywheelService,
  ],
};

export const geoScoreGeoShell: GeoShellConfig = {
  title: "官网 GEO 评分器 | 坚果猫 JGMAO",
  description:
    "输入官网网址和联系方式，快速获取官网 GEO 基础评分，并领取详细分析建议。",
  canonicalUrl: `${siteUrl}/geo-score/`,
  ogImage: `${siteUrl}/h5-share-cover.jpg`,
  structuredData: [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "官网 GEO 评分器 | 坚果猫 JGMAO",
      url: `${siteUrl}/geo-score/`,
      description:
        "输入官网网址和联系方式，快速获取官网 GEO 基础评分，并领取详细分析建议。",
      inLanguage: "zh-CN",
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "官网 GEO 评分服务",
      provider: {
        "@type": "Organization",
        name: "坚果猫 JGMAO",
        url: siteUrl,
      },
      serviceType: "官网 GEO 评分与优化建议",
      description:
        "检查官网在抓取、结构、FAQ、内容深度与承接路径方面的基础表现，并给出优先改进项。",
    },
  ],
  hiddenSeoHtml: stripIndent(`
    <h1>官网 GEO 评分器</h1>
    <p>
      输入官网网址和联系方式，快速获取官网在抓取、结构、FAQ、内容深度与承接路径方面的基础 GEO 评分，并领取详细分析建议。
    </p>
    <p>
      这是一张面向企业官网负责人与增长团队的获客页，适合用来快速评估 AI 可见性、主题结构、FAQ 完整度、robots.txt、sitemap.xml、canonical 与联系方式承接能力。
    </p>
  `),
};

export const geoShellByRoute = {
  "/": homeGeoShell,
  "/ai-growth/": aiGrowthGeoShell,
  "/h5/": h5GeoShell,
  "/geo-score/": geoScoreGeoShell,
};

export { siteUrl };
