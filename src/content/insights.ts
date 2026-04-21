export type InsightLocale = "zh" | "en";
export type InsightLocalizedText = Record<InsightLocale, string>;

export type InsightSection = {
  title: InsightLocalizedText;
  body: InsightLocalizedText;
  bullets?: InsightLocalizedText[];
};

export type InsightArticle = {
  slug: string;
  category: InsightLocalizedText;
  title: InsightLocalizedText;
  summary: InsightLocalizedText;
  description: InsightLocalizedText;
  seoTitle: InsightLocalizedText;
  seoDescription: InsightLocalizedText;
  publishedAt: string;
  readingTime: string;
  featured: boolean;
  accent: string;
  glow: string;
  metric: string;
  metricLabel: InsightLocalizedText;
  iconKey: "radar" | "workflow" | "file-search";
  publishing: {
    status: "published" | "draft";
    source: "local";
    openclawAgent: string;
    distributionTargets: Array<"website" | "feishu">;
    feishuReady: boolean;
  };
  relatedFaqIds: string[];
  sections: InsightSection[];
};

export const insightArticles: InsightArticle[] = [
  {
    slug: "ai-search-answer-first-website-structure",
    category: {
      zh: "GEO 洞察",
      en: "GEO Insight",
    },
    title: {
      zh: "AI 搜索时代，官网内容为什么要从页面思维转向答案思维",
      en: "Why websites must shift from page thinking to answer thinking in the AI search era",
    },
    summary: {
      zh: "从 AI 可见性、FAQ 结构到证据内容，拆解官网为什么需要重新组织信息表达方式。",
      en: "A look at why site structure, FAQ design, and proof-led content must adapt for AI visibility.",
    },
    description: {
      zh: "AI 时代的官网不只是页面集合，更是可被理解、可被引用、可被转化的答案系统。首页、专题页、FAQ 与案例页都要围绕问题和答案重新组织。",
      en: "In the AI era, websites are no longer just collections of pages. They need to be answer systems that are understandable, citable, and conversion-ready.",
    },
    seoTitle: {
      zh: "AI 搜索时代官网为什么要转向答案思维 | 坚果猫 JGMAO",
      en: "Why websites must move to answer thinking in AI search | JGMAO",
    },
    seoDescription: {
      zh: "解析官网在 AI 搜索时代如何从页面思维转向答案思维，提升可见性、可引用性与转化效率。",
      en: "Learn how websites must shift from page thinking to answer thinking to improve visibility, citation, and conversion in the AI search era.",
    },
    publishedAt: "2026-04-21",
    readingTime: "6 min",
    featured: true,
    accent: "#52E6FF",
    glow: "rgba(82, 230, 255, 0.18)",
    metric: "GEO",
    metricLabel: {
      zh: "可见性信号",
      en: "Visibility Signals",
    },
    iconKey: "radar",
    publishing: {
      status: "published",
      source: "local",
      openclawAgent: "jgmao-support-agent",
      distributionTargets: ["website", "feishu"],
      feishuReady: true,
    },
    relatedFaqIds: ["geo-vs-seo", "what-is-jgmao-growth-engine"],
    sections: [
      {
        title: {
          zh: "为什么官网不再只是页面",
          en: "Why websites are no longer just pages",
        },
        body: {
          zh: "过去的网站主要服务于人类浏览与搜索引擎收录，而 AI 搜索与问答系统更偏好结构清晰、答案明确、证据充分的内容。官网如果仍然停留在展示页思维，就很难在 AI 时代获得稳定可见性。",
          en: "Websites used to serve human browsing and search indexing. AI answer systems now prefer content that is structured, explicit, and evidence-backed.",
        },
      },
      {
        title: {
          zh: "答案思维意味着什么",
          en: "What answer thinking means",
        },
        body: {
          zh: "所谓答案思维，不是把所有页面都写成 FAQ，而是让页面结构优先服务问题理解与答案抽取。一个好的官网结构，应该让 AI 和访客都能快速抓到主题、结论、证据和下一步行动。",
          en: "Answer thinking does not mean turning every page into FAQ. It means structuring pages so both AI systems and visitors can identify questions, answers, proof, and next steps quickly.",
        },
        bullets: [
          {
            zh: "标题语义更清晰",
            en: "Clearer heading semantics",
          },
          {
            zh: "结论与摘要前置",
            en: "Front-loaded conclusions and summaries",
          },
          {
            zh: "案例、FAQ 与证据块形成统一结构",
            en: "Unified use of cases, FAQ, and proof blocks",
          },
        ],
      },
      {
        title: {
          zh: "坚果猫建议的第一步",
          en: "The first step we recommend",
        },
        body: {
          zh: "先梳理官网里最重要的高意图问题场景，再围绕这些场景重新组织首页、方案页、FAQ 与案例页。这比单独写更多文章，更能快速提升整站 GEO 质量。",
          en: "Start by mapping the highest-intent problem scenarios, then rebuild the homepage, solution pages, FAQ, and case studies around them.",
        },
      },
    ],
  },
  {
    slug: "enterprise-growth-flywheel-is-an-operating-system",
    category: {
      zh: "增长方法",
      en: "Growth Method",
    },
    title: {
      zh: "企业增长飞轮不是概念，而是一套可持续运转的内容与转化系统",
      en: "The enterprise growth flywheel is a working system, not just a concept",
    },
    summary: {
      zh: "把内容生产、官网承接、智能获客与推荐决策连成闭环，才能真正形成增长资产。",
      en: "Growth becomes durable when content, website conversion, lead capture, and recommendation intelligence work as one loop.",
    },
    description: {
      zh: "增长飞轮不是一张图，而是让内容、官网、获客和推荐分析彼此放大的系统。企业只有把这些环节连起来，增长才会真正持续。",
      en: "A growth flywheel is not a diagram; it is a system in which content, website conversion, lead capture, and recommendation analysis reinforce one another.",
    },
    seoTitle: {
      zh: "企业增长飞轮为什么是一套系统 | 坚果猫 JGMAO",
      en: "Why the enterprise growth flywheel is a system | JGMAO",
    },
    seoDescription: {
      zh: "理解企业增长飞轮如何把内容、官网、获客和推荐决策连成持续运转的增长系统。",
      en: "Understand how the enterprise growth flywheel connects content, websites, lead capture, and recommendation decisions into a compounding system.",
    },
    publishedAt: "2026-04-18",
    readingTime: "5 min",
    featured: true,
    accent: "#F5C55C",
    glow: "rgba(245, 197, 92, 0.16)",
    metric: "Loop",
    metricLabel: {
      zh: "增长方法论",
      en: "Growth Logic",
    },
    iconKey: "workflow",
    publishing: {
      status: "published",
      source: "local",
      openclawAgent: "jgmao-support-agent",
      distributionTargets: ["website", "feishu"],
      feishuReady: true,
    },
    relatedFaqIds: [
      "what-is-jgmao-growth-engine",
      "why-content-factory-needs-website",
      "what-intelligent-lead-system-does",
    ],
    sections: [
      {
        title: {
          zh: "为什么很多企业增长总是断",
          en: "Why enterprise growth often breaks down",
        },
        body: {
          zh: "很多企业会分别做内容、做官网、做广告、做销售跟进，但这些动作彼此不连通。结果是每个动作都投入了，整体却没有形成持续放大的效果。",
          en: "Many enterprises invest in content, websites, campaigns, and sales follow-up separately. Without connection, those efforts fail to compound.",
        },
      },
      {
        title: {
          zh: "增长飞轮真正解决什么",
          en: "What the flywheel actually solves",
        },
        body: {
          zh: "增长飞轮解决的不是单点动作，而是让上一环的输出，成为下一环的输入。这样内容生产、官网承接、线索获客与推荐判断才会持续互相放大。",
          en: "The flywheel makes the output of one stage become the input of the next, so content, website conversion, lead capture, and recommendation signals reinforce one another.",
        },
        bullets: [
          {
            zh: "内容让品牌更容易被发现",
            en: "Content improves discoverability",
          },
          {
            zh: "官网把注意力变成意向",
            en: "The website turns attention into intent",
          },
          {
            zh: "线索和推荐分析反向优化内容",
            en: "Lead and recommendation signals improve content",
          },
        ],
      },
      {
        title: {
          zh: "为什么这对 GEO 更重要",
          en: "Why this matters even more for GEO",
        },
        body: {
          zh: "GEO 不是单篇页面优化，而是整站结构、内容生产和线索验证的联动结果。没有增长飞轮，GEO 很容易停留在“被看见”而不是“带来增长”。",
          en: "GEO is not page-level optimization alone. It depends on how site structure, content production, and lead validation work together.",
        },
      },
    ],
  },
  {
    slug: "faq-and-case-pages-for-ai-citation",
    category: {
      zh: "案例延展",
      en: "Case Extension",
    },
    title: {
      zh: "从 FAQ 到案例页：哪些内容更容易被 AI 理解、引用与推荐",
      en: "From FAQ to case pages: what content is easier for AI to understand and recommend",
    },
    summary: {
      zh: "总结高质量官网内容的常见结构，帮助后续博客、案例和问答栏目形成统一体系。",
      en: "Patterns for building high-quality site content across FAQs, case studies, and answer-led articles.",
    },
    description: {
      zh: "FAQ 和案例页是官网里最容易形成高质量语义信号的两种页面类型。把这两类内容做好，会直接提升 AI 对品牌的理解和引用机会。",
      en: "FAQ and case-study pages are among the easiest pages on a website to turn into strong semantic signals for AI systems.",
    },
    seoTitle: {
      zh: "FAQ 与案例页如何提升 AI 引用与推荐 | 坚果猫 JGMAO",
      en: "How FAQ and case pages improve AI citation and recommendation | JGMAO",
    },
    seoDescription: {
      zh: "了解 FAQ 与案例页的高质量内容结构，提升品牌在 AI 搜索与推荐中的被理解、被引用与被推荐机会。",
      en: "Learn how FAQ and case pages can improve AI understanding, citation, and recommendation through better content structure.",
    },
    publishedAt: "2026-04-15",
    readingTime: "4 min",
    featured: false,
    accent: "#B592FF",
    glow: "rgba(181, 146, 255, 0.16)",
    metric: "Case",
    metricLabel: {
      zh: "内容结构",
      en: "Content Structure",
    },
    iconKey: "file-search",
    publishing: {
      status: "published",
      source: "local",
      openclawAgent: "jgmao-support-agent",
      distributionTargets: ["website", "feishu"],
      feishuReady: true,
    },
    relatedFaqIds: ["geo-vs-seo", "why-ai-recommendation-analytics-matters"],
    sections: [
      {
        title: {
          zh: "为什么 FAQ 有独特价值",
          en: "Why FAQ has unique value",
        },
        body: {
          zh: "FAQ 天然具备问题与答案的结构，对 AI 抽取和引用非常友好。它不仅帮助用户快速理解品牌，也帮助模型快速理解网站的能力边界和适用场景。",
          en: "FAQ naturally provides a question-and-answer format that is highly usable for AI extraction and citation.",
        },
      },
      {
        title: {
          zh: "案例页为什么也关键",
          en: "Why case pages are also critical",
        },
        body: {
          zh: "案例页提供了可信证据、业务背景、解决方案和结果指标。相比抽象描述，它更容易被 AI 视作可信来源，从而提升推荐概率。",
          en: "Case-study pages provide proof, business context, solution details, and outcome metrics. They are more credible than abstract claims.",
        },
      },
      {
        title: {
          zh: "内容结构该怎么统一",
          en: "How to standardize the structure",
        },
        body: {
          zh: "建议把 FAQ、案例页和后续洞察文章统一成“问题—答案/挑战—动作—结果”的结构。这样整个内容体系会更容易被 AI 理解，也更容易持续扩写。",
          en: "A consistent format such as question-answer or challenge-action-result makes the whole content system easier to expand and easier for AI systems to understand.",
        },
      },
    ],
  },
];

export function getInsightArticleBySlug(slug: string) {
  return insightArticles.find((item) => item.slug === slug);
}

export function getPublishedInsights() {
  return insightArticles
    .filter((item) => item.publishing.status === "published")
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getPublishedInsightsBySlugs(slugs: string[]) {
  const published = getPublishedInsights();
  return slugs
    .map((slug) => published.find((item) => item.slug === slug))
    .filter((item): item is InsightArticle => Boolean(item));
}
