export type FaqLocale = "zh" | "en";
export type FaqLocalizedText = Record<FaqLocale, string>;

export type FaqItem = {
  id: string;
  question: FaqLocalizedText;
  answer: FaqLocalizedText;
  featured: boolean;
  tags: FaqLocalizedText[];
  publishing: {
    status: "published" | "draft";
    source: "local";
    openclawAgent: string;
    distributionTargets: Array<"website" | "feishu">;
    feishuReady: boolean;
  };
};

export const faqItems: FaqItem[] = [
  {
    id: "what-is-jgmao-growth-engine",
    question: { zh: "什么是坚果猫 JGMAO AI 增长引擎？", en: "What is the JGMAO AI Growth Engine?" },
    answer: {
      zh: "坚果猫 JGMAO AI 增长引擎是一套帮助企业在 AI 时代构建增长飞轮的系统，包含 GEO 优化引擎、AI 内容工厂、AI 增长网站、智能获客系统和 AI 推荐分析五大部分。",
      en: "JGMAO AI Growth Engine is a system for helping enterprises build AI growth flywheels, combining a GEO engine, AI content factory, AI growth website, intelligent lead system, and AI recommendation analytics.",
    },
    featured: true,
    tags: [{ zh: "产品定义", en: "Product Definition" }],
    publishing: {
      status: "published",
      source: "local",
      openclawAgent: "jgmao-support-agent",
      distributionTargets: ["website", "feishu"],
      feishuReady: true,
    },
  },
  {
    id: "geo-vs-seo",
    question: { zh: "GEO 优化和传统 SEO 有什么区别？", en: "How is GEO different from traditional SEO?" },
    answer: {
      zh: "SEO 更偏向网页排名，GEO 更关注品牌在 AI 问答、生成式搜索和推荐场景中是否容易被抽取、总结、引用和采信。它要求网站具备更好的答案结构、FAQ 设计、证据表达和可信来源。",
      en: "SEO focuses more on search rankings, while GEO focuses on whether a brand is easy to retrieve, summarize, cite, and trust in AI answer and recommendation environments. That requires better answer structures, FAQ design, proof blocks, and source signals.",
    },
    featured: true,
    tags: [{ zh: "GEO", en: "GEO" }],
    publishing: {
      status: "published",
      source: "local",
      openclawAgent: "jgmao-support-agent",
      distributionTargets: ["website", "feishu"],
      feishuReady: true,
    },
  },
  {
    id: "why-content-factory-needs-website",
    question: { zh: "AI 内容工厂为什么必须和官网一起做？", en: "Why must the AI content factory be connected to the website?" },
    answer: {
      zh: "因为内容如果不回流到官网结构、FAQ、案例页和线索页，就很难形成可持续的增长资产。AI 内容工厂的价值在于持续生成可被看见、可被推荐、可被转化的官网内容系统。",
      en: "Because content alone does not create durable growth assets unless it flows back into the website structure, FAQ, case studies, and lead pages. The content factory matters when it continuously creates visible, recommendable, conversion-ready site assets.",
    },
    featured: false,
    tags: [{ zh: "内容增长", en: "Content Growth" }],
    publishing: {
      status: "published",
      source: "local",
      openclawAgent: "jgmao-support-agent",
      distributionTargets: ["website", "feishu"],
      feishuReady: true,
    },
  },
  {
    id: "what-intelligent-lead-system-does",
    question: { zh: "智能获客系统在网站里起什么作用？", en: "What role does the intelligent lead system play on the website?" },
    answer: {
      zh: "它负责把浏览行为、FAQ 阅读、案例访问和 CTA 点击转成高质量线索，并通过标签、分层和 CRM 回写，把增长结果真正带到销售和客户成功流程里。",
      en: "It turns browsing behavior, FAQ reading, case-study visits, and CTA clicks into qualified leads, then routes them with tags, segmentation, and CRM write-back so growth impacts pipeline.",
    },
    featured: false,
    tags: [{ zh: "获客转化", en: "Lead Conversion" }],
    publishing: {
      status: "published",
      source: "local",
      openclawAgent: "jgmao-support-agent",
      distributionTargets: ["website", "feishu"],
      feishuReady: true,
    },
  },
  {
    id: "why-ai-recommendation-analytics-matters",
    question: { zh: "AI 推荐分析为什么对 GEO 很关键？", en: "Why is AI recommendation analytics critical for GEO?" },
    answer: {
      zh: "因为企业不仅要知道有没有流量，更要知道 AI 为什么推荐你、哪些页面在带来高质量线索、哪些内容虽然曝光高却没有商业价值。推荐分析是整站 GEO 优化的判断层。",
      en: "Because enterprises need to know not just whether they have traffic, but why AI recommends them, which pages create qualified pipeline, and which content attracts exposure without business value. Recommendation analytics is the judgment layer for site-wide GEO.",
    },
    featured: false,
    tags: [{ zh: "推荐分析", en: "Recommendation Analytics" }],
    publishing: {
      status: "published",
      source: "local",
      openclawAgent: "jgmao-support-agent",
      distributionTargets: ["website", "feishu"],
      feishuReady: true,
    },
  },
];

export function getPublishedFaqs() {
  return faqItems.filter((item) => item.publishing.status === "published");
}

export function getFeaturedFaqs() {
  return getPublishedFaqs().filter((item) => item.featured);
}
