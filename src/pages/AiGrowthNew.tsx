import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  FileText,
  Globe2,
  LayoutTemplate,
  Menu,
  MessageCircle,
  Radar,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

import GrowthEntryFloating from "@/components/GrowthEntryFloating";
import growthFlywheelImage from "@/assets/h5-growth-flywheel.jpg";
import logoImage from "@/assets/jgmao-logo-black-square.png";
import wecomSupportQrImage from "@/assets/wecom-support-qr.png";
import { siteOrigin } from "@/lib/share";

const pageTitle = "坚果猫 JGMAO AI 增长引擎";
const pageDescription =
  "从被 AI 看见走向被 AI 采信与推荐，帮助企业构建 AI 时代的可信增长基础设施。";

type Locale = "zh" | "en";
type LocalizedText = { zh: string; en: string };

const navItems = [
  { href: "#engine", label: { zh: "能力", en: "Engines" } },
  { href: "#plans", label: { zh: "方案", en: "Plans" } },
  { href: "#process", label: { zh: "流程", en: "Flow" } },
  { href: "#contact", label: { zh: "咨询", en: "Consult" }, highlight: true },
];

function text(value: LocalizedText, locale: Locale) {
  return value[locale];
}

const heroCopy = {
  eyebrow: { zh: "AI 时代企业可信增长基础设施", en: "Trusted growth infrastructure for AI-era enterprises" },
  titleStart: { zh: "从被 AI 看见，", en: "From being seen by AI" },
  titleHighlight: { zh: "到被 AI 信任和推荐", en: "to being trusted and recommended" },
  intro: {
    zh: "坚果猫 JGMAO AI 增长引擎，帮助企业从“被 AI 看见”走向“被 AI 采信”，并通过诊断、官网、内容、监测、获客五大引擎协同运转，把 AI 推荐转化为可承接、可跟进的增长线索。",
    en: "JGMAO AI Growth Engine helps companies move from being seen by AI to being trusted by AI. Through diagnosis, websites, content, monitoring, and lead conversion, it turns AI recommendations into actionable growth leads.",
  },
  scoreCta: { zh: "先做官网 GEO 评分", en: "Start with GEO scoring" },
  websiteCta: { zh: "了解官网生成", en: "Explore website generation" },
  flywheelLabel: { zh: "AI Growth Flywheel", en: "AI Growth Flywheel" },
  flywheelTitle: { zh: "帮助企业构建 AI 时代的增长飞轮", en: "Build a growth flywheel for the AI era" },
};

const breakpointCopy = {
  eyebrow: { zh: "增长断点", en: "Growth Breakpoints" },
  title: { zh: "AI 时代企业常见的增长断点", en: "Common growth breakpoints in the AI era" },
  solutionLabel: { zh: "JGMAO 解法", en: "JGMAO Solution" },
  solutionBody: {
    zh: "面对这些问题，JGMAO 会把官网、可信内容资产、企业知识库、推荐监测与获客承接连接起来，形成一套持续优化的增长飞轮。",
    en: "JGMAO connects the website, trusted content assets, enterprise knowledge base, recommendation monitoring, and lead handoff into a continuously optimized growth flywheel.",
  },
};

const breakpointProblems = [
  {
    title: {
      zh: "AI 回答中很少出现自己的品牌",
      en: "The brand rarely appears in AI answers",
    },
    body: {
      zh: "客户在 AI 搜索相关问题时看不到企业，就意味着少了被发现的机会。",
      en: "When customers search with AI, the company is not visible and loses a chance to be discovered.",
    },
  },
  {
    title: {
      zh: "官网和内容难以被 AI 准确理解",
      en: "The website and content are hard for AI to understand accurately",
    },
    body: {
      zh: "页面有内容，但主题、结构和证据表达不清晰，AI 不容易抓取和引用。",
      en: "The content exists, but weak topics, structure, and proof make it harder for AI to retrieve and cite.",
    },
  },
  {
    title: {
      zh: "内容生产零散，无法沉淀为可信内容资产",
      en: "Content is scattered and does not become trusted assets",
    },
    body: {
      zh: "文章、案例、FAQ 和资料分散发布，难以长期复用，也难以形成可被 AI 采信的资产。",
      en: "Articles, cases, FAQs, and materials are scattered, making them hard to reuse or turn into assets AI can trust.",
    },
  },
  {
    title: {
      zh: "官网有访问，但缺少有效咨询和线索承接",
      en: "The website has traffic but weak lead handoff",
    },
    body: {
      zh: "用户来了，但不知道下一步该做什么，咨询入口、表单、企微和客服没有形成顺畅路径。",
      en: "Visitors arrive but do not know the next step because consultation entries, forms, WeCom, and service paths are not connected.",
    },
  },
  {
    title: {
      zh: "不清楚 AI 是否推荐了自己，也不知道推荐质量如何",
      en: "The team cannot tell whether AI recommends the brand",
    },
    body: {
      zh: "企业看不到哪些问题触发了推荐、推荐内容是否准确，也难以判断下一步该优化哪里。",
      en: "The team cannot see which questions trigger recommendations, whether they are accurate, or what to optimize next.",
    },
  },
];

const breakpointSteps = [
  {
    title: { zh: "发现需求路径", en: "Discover demand paths" },
    body: {
      zh: "识别客户会在 AI 搜索中提出的问题、比较的方案和关注的证据。",
      en: "Identify the questions, alternatives, and proof points customers search for with AI.",
    },
    icon: Radar,
  },
  {
    title: { zh: "沉淀可信内容资产", en: "Build trusted content assets" },
    body: {
      zh: "把产品、案例、FAQ、专题页和行业观点整理成可持续复用的内容资产。",
      en: "Turn products, cases, FAQ, topic pages, and viewpoints into reusable content assets.",
    },
    icon: FileText,
  },
  {
    title: { zh: "建立企业知识库", en: "Create the enterprise knowledge base" },
    body: {
      zh: "让官网、内容系统和知识库共同表达企业能力，减少信息断层。",
      en: "Let the website, content system, and knowledge base express company capabilities together.",
    },
    icon: Bot,
  },
  {
    title: { zh: "监测推荐质量", en: "Monitor recommendation quality" },
    body: {
      zh: "持续观察 AI 回答中的提及、引用、比较和推荐表现。",
      en: "Track mentions, citations, comparisons, and recommendations in AI answers.",
    },
    icon: BarChart3,
  },
  {
    title: { zh: "承接增长机会", en: "Capture growth opportunities" },
    body: {
      zh: "把被看见后的访问、咨询和线索接住，形成可跟进的增长路径。",
      en: "Convert visibility into visits, inquiries, and leads that can be followed up.",
    },
    icon: MessageCircle,
  },
];

const engineModules = [
  {
    title: { zh: "GEO 优化引擎", en: "GEO Optimization Engine" },
    body: {
      zh: "从 AI 搜索问题、品牌表达、官网结构、可信内容资产、企业知识库和外部可信信号等维度，识别企业为什么不容易被 AI 看见、引用和推荐。",
      en: "Identify why a company is not easily seen, cited, or recommended by AI across search questions, brand expression, website structure, trusted content assets, enterprise knowledge, and external trust signals.",
    },
    icon: Radar,
  },
  {
    title: { zh: "可信内容资产", en: "Trusted Content Assets" },
    body: {
      zh: "把文章、案例、FAQ、专题页和产品资料，沉淀成可复用、可追踪、可持续优化的可信内容资产。",
      en: "Turn articles, cases, FAQ, topic pages, and product materials into reusable, trackable, and continuously optimizable trusted content assets.",
    },
    icon: FileText,
  },
  {
    title: { zh: "AI 增长网站", en: "AI Growth Website" },
    body: {
      zh: "让官网不只是展示页面，而是连接 GEO、可信内容资产、企业知识库、咨询入口和线索承接的增长界面。",
      en: "Make the website the operating interface that connects GEO, trusted content assets, enterprise knowledge, consultation entries, and lead handoff.",
    },
    icon: Globe2,
  },
  {
    title: { zh: "智能获客系统", en: "Intelligent Lead System" },
    body: {
      zh: "把 AI 推荐、官网访问、内容咨询和表单线索接住，并通过企微、客服、飞书通知和复测反馈形成跟进路径。",
      en: "Capture AI recommendations, website visits, content inquiries, and form leads, then route them through WeCom, support, Feishu notifications, and retest feedback.",
    },
    icon: MessageCircle,
  },
  {
    title: { zh: "AI 推荐监测", en: "AI Recommendation Monitoring" },
    body: {
      zh: "持续观察品牌、产品和内容在 AI 回答中的出现、引用、比较和推荐表现，帮助企业判断下一步该优化什么。",
      en: "Monitor how brands, products, and content appear, get cited, compared, and recommended in AI answers so teams know what to optimize next.",
    },
    icon: BarChart3,
  },
];

const plans = [
  {
    name: { zh: "官网 GEO 优化方案", en: "Website GEO Optimization Plan" },
    price: { zh: "199 元 / 次", en: "RMB 199 / plan" },
    tag: { zh: "适合先看清怎么改", en: "Best for clarifying what to improve" },
    body: {
      zh: "基于本次官网评分结果，进一步生成页面级分析、具体改造清单与优先级路线图。",
      en: "Based on the website score, generate page-level analysis, concrete improvement tasks, and a priority roadmap.",
    },
    points: [
      { zh: "页面级问题判断", en: "Page-level issue diagnosis" },
      { zh: "FAQ / 专题页补齐方向", en: "FAQ and topic page gaps" },
      { zh: "结构化数据与信任信号建议", en: "Structured data and trust signal suggestions" },
      { zh: "优先级路线图", en: "Priority roadmap" },
    ],
    href: "/geo-upgrade/",
    cta: { zh: "查看优化方案", en: "View optimization plan" },
  },
  {
    name: { zh: "坚果猫AI增长引擎标准版", en: "JGMAO AI Growth Engine Standard" },
    price: { zh: "2000 元/月", en: "RMB 2000 / month" },
    tag: { zh: "适合持续运营和获客", en: "Best for ongoing operation and leads" },
    body: {
      zh: "通过 GEO 诊断与优化、可信内容资产、AI 增长官网、AI 推荐监测与智能获客转化，帮助企业从被 AI 看见，到被 AI 理解、信任和推荐，并把内容曝光转化为真实线索。",
      en: "Through GEO diagnosis and optimization, trusted content assets, AI growth websites, AI recommendation monitoring, and smart lead conversion, it helps companies move from being seen by AI to being understood, trusted, and recommended, turning content exposure into real leads.",
    },
    points: [
      { zh: "GEO 诊断与优化引擎", en: "GEO diagnosis and optimization engine" },
      { zh: "可信内容资产中心", en: "Trusted content asset center" },
      { zh: "AI 增长官网系统", en: "AI growth website system" },
      { zh: "面向 AI 大模型的企业知识库", en: "Enterprise knowledge base for large AI models" },
      { zh: "AI 推荐监测系统", en: "AI recommendation monitoring system" },
      { zh: "智能获客与转化系统", en: "Smart lead and conversion system" },
      { zh: "持续获得官网 GEO 详细报告与优化方案", en: "Ongoing website GEO detailed reports and optimization plans" },
      { zh: "数字内容区块链可信登记 200 份/月", en: "200 digital content blockchain trusted registrations per month" },
    ],
    href: "/website-create/",
    cta: { zh: "了解标准版", en: "Learn about Standard" },
  },
  {
    name: { zh: "坚果猫AI增长引擎专业版", en: "JGMAO AI Growth Engine Professional" },
    price: { zh: "6000 元/月", en: "RMB 6000 / month" },
    tag: { zh: "适合独立部署和可信赋能", en: "Best for dedicated deployment and trust enablement" },
    body: {
      zh: "在标准版全部能力基础上，进一步提供独立 IP 服务器、日常运维、企业向量数据库、AI 智能客服、数字内容区块链可信登记与技术支持，适合更重视稳定运行和咨询承接的企业。",
      en: "Includes all Standard capabilities, plus dedicated IP/server deployment, operations support, enterprise vector database setup, AI customer service, blockchain trusted registrations, and technical support for teams that need more stable operations and lead handoff.",
    },
    points: [
      { zh: "标准版全部能力", en: "All Standard capabilities" },
      { zh: "独立 IP 与独立服务器部署", en: "Dedicated IP and server deployment" },
      { zh: "服务器日常运维与基础安全维护", en: "Server operations and basic security maintenance" },
      { zh: "可信内容资产中心：内容资产区块链可信登记 600 份/月", en: "Trusted content asset center: 600 blockchain trusted content registrations per month" },
      { zh: "企业向量数据库建设企业内容资产大脑", en: "Enterprise vector database for a content asset brain" },
      { zh: "AI 智能体辅助内容运营与知识库补齐", en: "AI agent assistance for content operations and knowledge-base completion" },
      { zh: "AI 智能客服与咨询承接系统", en: "AI customer service and consultation handoff system" },
      { zh: "基础故障排查与技术支持", en: "Basic troubleshooting and technical support" },
    ],
    href: "/geo-upgrade/?plan=professional#professional-plan",
    cta: { zh: "了解专业版", en: "Learn about Professional" },
  },
];

const processSteps = [
  {
    title: { zh: "官网 GEO 评分", en: "Website GEO Scoring" },
    body: {
      zh: "先判断官网在 AI 抓取、理解、采信和推荐中的基础表现，看清当前短板在哪里。",
      en: "Start by assessing how the website performs in AI crawling, understanding, trust, and recommendation.",
    },
  },
  {
    title: { zh: "详细诊断报告", en: "Detailed Diagnostic Report" },
    body: {
      zh: "进一步拆解官网结构、内容资产、信任信号和转化承接问题，明确为什么会影响 AI 采信。",
      en: "Break down structure, content assets, trust signals, and conversion issues to understand what affects AI trust.",
    },
  },
  {
    title: { zh: "官网 GEO 优化方案", en: "Website GEO Optimization Plan" },
    body: {
      zh: "把问题转成页面级改造清单、优先级路线图和内容补齐方向，知道下一步先改哪里。",
      en: "Turn findings into page-level fixes, a priority roadmap, and content improvement directions.",
    },
  },
  {
    title: { zh: "AI 增长系统建设", en: "AI Growth System Buildout" },
    body: {
      zh: "围绕官网、内容资产、知识库、监测和获客入口，逐步搭建可持续运营的增长基础设施。",
      en: "Build an operating infrastructure around the website, content assets, knowledge base, monitoring, and lead entries.",
    },
  },
  {
    title: { zh: "持续复测与增长迭代", en: "Retesting & Growth Iteration" },
    body: {
      zh: "定期复测评分、观察 AI 推荐表现、对比优化前后变化，让官网和内容持续进入增长循环。",
      en: "Retest regularly, monitor AI recommendation signals, and compare improvements to keep growth compounding.",
    },
  },
];

const fitList = [
  {
    title: { zh: "还没有官网，想先建立可信承接入口", en: "No website yet, but need a trusted entry point" },
    body: {
      zh: "适合准备启动线上获客，但还缺少一个可展示、可更新、可评分、可持续优化的企业官网。",
      en: "For teams that need a website that can be presented, updated, scored, and improved over time.",
    },
  },
  {
    title: { zh: "已有官网，但 AI 可见性和线索转化偏弱", en: "Have a website, but weak AI visibility and conversion" },
    body: {
      zh: "适合官网长期未更新、内容结构分散，用户能看到但 AI 不容易理解、采信和推荐的企业。",
      en: "For companies whose content is scattered or hard for AI to understand, trust, and recommend.",
    },
  },
  {
    title: { zh: "有内容积累，但没有形成可信内容资产", en: "Have content, but not trusted content assets" },
    body: {
      zh: "适合已有文章、案例、产品资料或常见问答，但内容还分散在不同渠道，尚未沉淀为可被 AI 采信的资产。",
      en: "For teams with articles, cases, product materials, or FAQ that have not yet become AI-trusted assets.",
    },
  },
  {
    title: { zh: "想持续监测 AI 推荐表现和增长结果", en: "Need ongoing AI recommendation and growth monitoring" },
    body: {
      zh: "适合希望定期复测官网表现，持续观察品牌在 AI 回答中的提及、比较、引用与推荐变化的团队。",
      en: "For teams that want retesting, AI mention monitoring, and ongoing conversion path optimization.",
    },
  },
  {
    title: { zh: "希望通过可信赋能扩大品牌影响力", en: "Want to expand influence through trusted enablement" },
    body: {
      zh: "适合已有产品、案例或行业积累，希望通过权威媒体合作、专家观点、案例证明与区块链可信记录，增强品牌可信度，提升被 AI 引用和推荐的机会。",
      en: "For companies with products, cases, or industry expertise that want to strengthen credibility and increase AI citation and recommendation opportunities.",
    },
  },
];

const trustedFlowCopy = {
  eyebrow: { zh: "可信增长路径", en: "Trusted Growth Path" },
  title: { zh: "从可信信息，到可信引用", en: "From trusted information to trusted citation" },
  body: {
    zh: "坚果猫 JGMAO AI 增长引擎，不只是帮助企业提升 AI 可见性，更重要的是帮助品牌逐步建立可被 AI 理解、采信和推荐的可信增长基础。",
    en: "JGMAO AI Growth Engine does more than improve AI visibility. It helps brands build a trusted growth foundation that AI can understand, accept, and recommend.",
  },
  closing: {
    zh: "当可信信息被持续沉淀，可信支撑被不断补强，品牌才更有机会从“被 AI 看见”，进一步走向“被 AI 采信”和“被 AI 推荐”。",
    en: "When trusted information keeps accumulating and trust support keeps strengthening, a brand has a better chance to move from being seen by AI to being trusted and recommended by AI.",
  },
};

const trustedFlowItems = [
  {
    title: { zh: "可信信息", en: "Trusted Information" },
    body: {
      zh: "把官网、产品介绍、客户案例、FAQ、知识内容、资质材料和行业观点，整理成更清晰、更结构化、更容易被 AI 理解的数字内容资产。",
      en: "Turn websites, product descriptions, customer cases, FAQ, knowledge content, credentials, and industry viewpoints into clearer, structured digital content assets.",
    },
    icon: FileText,
    tone: "border-cyan-300/18 bg-cyan-300/[0.07] text-cyan-100",
  },
  {
    title: { zh: "可信赋能", en: "Trusted Enablement" },
    body: {
      zh: "通过知识库沉淀、结构化官网、权威媒体合作、专家观点、案例证明与区块链可信记录，为品牌建立持续可积累的信任支撑。",
      en: "Use knowledge bases, structured websites, authority partnerships, expert viewpoints, proof cases, and trusted records to strengthen brand credibility.",
    },
    icon: ShieldCheck,
    tone: "border-amber-300/18 bg-amber-300/[0.07] text-amber-100",
  },
  {
    title: { zh: "可信引用", en: "Trusted Citation" },
    body: {
      zh: "持续观察品牌、产品和内容在豆包、通义千问、DeepSeek、Kimi、文心一言等 AI 回答中的提及、比较、引用与推荐表现，并反向优化内容和转化路径。",
      en: "Monitor how brands, products, and content are mentioned, compared, cited, and recommended in AI answers, then use those signals to optimize content and conversion paths.",
    },
    icon: Radar,
    tone: "border-emerald-300/18 bg-emerald-300/[0.07] text-emerald-100",
  },
];

const sectionCopy = {
  scoreCardTag: { zh: "免费入口", en: "Free Entry" },
  scoreCardTitle: { zh: "立即免费获得 GEO 官网评分", en: "Get a free GEO website score" },
  scoreCardBody: {
    zh: "已有官网的企业，可以先提交官网链接，快速查看 AI 可见性、内容结构、信任信号与承接转化等基础评分。",
    en: "Submit your website URL to quickly evaluate AI visibility, content structure, trust signals, and conversion readiness.",
  },
  scoreCardCta: { zh: "开始评分", en: "Start scoring" },
  websiteCardTag: { zh: "没有官网？", en: "No website yet?" },
  websiteCardTitle: { zh: "立即制作一个适合 GEO 的企业官网", en: "Create a GEO-ready business website" },
  websiteCardBody: {
    zh: "如果还没有官网，可以先选择行业起点，让 AI 生成官网框架，再逐步填充品牌、产品、案例、FAQ 与获客入口。",
    en: "Choose an industry starting point, let AI generate the website framework, then fill in brand, products, cases, FAQ, and lead entries.",
  },
  websiteCardCta: { zh: "查看官网生成", en: "View website generation" },
  engineEyebrow: { zh: "五大引擎", en: "Five Engines" },
  engineTitle: { zh: "五大引擎：核心能力", en: "Five engines: core capabilities" },
  engineBody: {
    zh: "解决从 AI 可见性、可信内容资产、官网承接到推荐监测与获客转化的关键断点，协同运转后形成完整的 AI 增长飞轮。",
    en: "Each engine contributes to GEO visibility, trusted content assets, website handoff, recommendation monitoring, and lead conversion. Together, they form a complete AI growth flywheel.",
  },
  plansEyebrow: { zh: "产品层级", en: "Product Layers" },
  plansTitle: { zh: "先低门槛看清问题，再进入持续服务", en: "Start with a low-friction diagnosis, then move into ongoing service." },
  plansBody: {
    zh: "官网 GEO 优化方案适合先看清当前官网该从哪里开始改；标准版则进一步承接官网系统、内容资产、AI 推荐监测与长期增长运营。",
    en: "The Website GEO Optimization Plan helps clarify where the current website should improve first. The Standard plan then supports the website system, content assets, AI recommendation monitoring, and long-term growth operations.",
  },
  processEyebrow: { zh: "落地路径", en: "Implementation Flow" },
  processTitle: { zh: "从一次评分，进入持续增长闭环", en: "From one score into an ongoing growth loop" },
  fitTitle: { zh: "更适合这 5 类企业", en: "Best for these 5 types of companies" },
  contactEyebrow: { zh: "开始构建", en: "Start Building" },
  contactTitle: { zh: "准备构建 AI 时代的可信增长基础设施？", en: "Ready to build trusted growth infrastructure for the AI era?" },
  contactBody: {
    zh: "如果你希望进一步评估官网 GEO 优化方案、AI 增长官网系统或标准版持续服务，可以添加企微客服，沟通当前官网、内容资产、AI 推荐监测与获客承接的具体推进方式。",
    en: "If you want to evaluate the GEO optimization plan, AI growth website system, or Standard ongoing service, add WeCom support to discuss your website, content assets, AI recommendation monitoring, and lead conversion workflow.",
  },
  qrTitle: { zh: "扫码添加企微客服", en: "Scan to add WeCom support" },
  qrDesc: { zh: "可沟通官网生成、GEO 优化方案和标准版开通。", en: "Discuss website generation, GEO plans, and Standard service." },
};

function setMeta() {
  document.title = pageTitle;

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute("content", pageDescription);
  }

  const ensureProperty = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("property", property);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };

  const ensureNamedMeta = (name: string, content: string) => {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", name);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };

  let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", `${siteOrigin}/ai-growth-new/`);
  ensureProperty("og:title", pageTitle);
  ensureProperty("og:description", pageDescription);
  ensureProperty("og:type", "website");
  ensureProperty("og:url", `${siteOrigin}/ai-growth-new/`);
  ensureProperty("og:image", `${siteOrigin}/h5-share-cover.jpg`);
  ensureNamedMeta("twitter:card", "summary_large_image");
  ensureNamedMeta("twitter:title", pageTitle);
  ensureNamedMeta("twitter:description", pageDescription);
  ensureNamedMeta("twitter:image", `${siteOrigin}/h5-share-cover.jpg`);
}

export default function AiGrowthNewPage() {
  const [locale, setLocale] = useState<Locale>("zh");
  const [menuOpen, setMenuOpen] = useState(false);
  const trustedFlowSectionRef = useRef<HTMLElement | null>(null);
  const [trustedFlowMotionActive, setTrustedFlowMotionActive] = useState(true);

  useEffect(() => {
    setMeta();
  }, []);

  useEffect(() => {
    const target = trustedFlowSectionRef.current;

    if (!target) {
      return undefined;
    }

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let sectionVisible = true;

    const syncMotionState = () => {
      setTrustedFlowMotionActive(sectionVisible && !document.hidden && !reduceMotionQuery.matches);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        sectionVisible = entries[0]?.isIntersecting ?? true;
        syncMotionState();
      },
      {
        rootMargin: "10% 0px -12% 0px",
        threshold: [0, 0.1, 0.25],
      },
    );

    observer.observe(target);
    document.addEventListener("visibilitychange", syncMotionState);
    reduceMotionQuery.addEventListener("change", syncMotionState);
    syncMotionState();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncMotionState);
      reduceMotionQuery.removeEventListener("change", syncMotionState);
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#06111f] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(62,211,255,0.2),transparent_26%),radial-gradient(circle_at_82%_8%,rgba(245,194,92,0.18),transparent_22%),linear-gradient(180deg,#06111f_0%,#0a1728_48%,#06111f_100%)]" />

      <section className="relative px-5 pb-14 pt-4 sm:px-8 sm:pt-6 lg:pb-20">
        <nav className="sticky top-3 z-40 mx-auto max-w-7xl rounded-[1.55rem] border border-white/10 bg-[#071426]/82 px-4 py-3 shadow-[0_18px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="inline-flex min-w-0 items-center gap-3 font-semibold">
              <img src={logoImage} alt="坚果猫 JGMAO" className="h-10 w-10 rounded-2xl object-cover" />
              <span className="min-w-0">
                <span className="block truncate text-[1.02rem] font-semibold leading-none text-cyan-50/95">
                  {locale === "zh" ? "坚果猫" : "JGMAO"}
                </span>
                <span className="mt-1 block truncate text-[0.66rem] font-medium tracking-[0.2em] text-white/55">
                  {locale === "zh" ? "AI 增长引擎" : "AI GROWTH ENGINE"}
                </span>
              </span>
            </Link>

            <div className="hidden items-center gap-2 lg:flex">
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 transition ${
                      item.highlight
                        ? "bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/15"
                        : "text-slate-300 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {text(item.label, locale)}
                  </a>
                ))}
              </div>
              <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1">
                {(["zh", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLocale(lang)}
                    className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.18em] transition ${
                      locale === lang ? "bg-white/12 text-white" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1">
                {(["zh", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLocale(lang)}
                    className={`rounded-full px-2.5 py-1.5 text-[11px] uppercase tracking-[0.16em] transition ${
                      locale === lang ? "bg-white/12 text-white" : "text-slate-300"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                aria-label={locale === "zh" ? "切换导航" : "Toggle navigation"}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {menuOpen ? (
            <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-slate-950/72 p-3 lg:hidden">
              <div className="grid gap-2">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-sm transition ${
                      item.highlight
                        ? "border border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
                        : "text-slate-300 hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    {text(item.label, locale)}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </nav>

        <div className="mx-auto mt-10 grid max-w-7xl gap-10 sm:mt-14 lg:mt-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
              <Sparkles className="h-4 w-4" />
              {text(heroCopy.eyebrow, locale)}
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-7xl">
              {text(heroCopy.titleStart, locale)}
              <span className="block bg-gradient-to-r from-cyan-200 via-amber-100 to-emerald-200 bg-clip-text text-transparent">
                {text(heroCopy.titleHighlight, locale)}
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
              {text(heroCopy.intro, locale)}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/geo-score/" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-200 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(103,232,249,0.22)] sm:w-auto">
                {text(heroCopy.scoreCta, locale)}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/website-create/" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 py-3 text-sm font-semibold text-white sm:w-auto">
                {text(heroCopy.websiteCta, locale)}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-cyan-300/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-slate-950/60 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl">
              <img src={growthFlywheelImage} alt="AI 增长飞轮示意图" className="h-[320px] w-full rounded-[1.7rem] object-cover sm:h-[420px]" />
              <div className="absolute inset-x-4 bottom-4 rounded-[1.3rem] border border-white/10 bg-slate-950/72 p-4 backdrop-blur-xl sm:inset-x-8 sm:bottom-8 sm:rounded-[1.5rem] sm:p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">{text(heroCopy.flywheelLabel, locale)}</p>
                <p className="mt-2 text-xl font-semibold sm:text-2xl">{text(heroCopy.flywheelTitle, locale)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto -mt-8 max-w-7xl px-5 pb-10 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <Link
            href="/geo-score/"
            className="group overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[linear-gradient(145deg,rgba(103,232,249,0.18),rgba(15,23,42,0.7))] p-6 shadow-[0_20px_70px_rgba(34,211,238,0.14)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-200/40"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-200 px-3 py-1.5 text-xs font-semibold text-slate-950">
                  {text(sectionCopy.scoreCardTag, locale)}
                </span>
                <h2 className="mt-5 text-3xl font-semibold">{text(sectionCopy.scoreCardTitle, locale)}</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                  {text(sectionCopy.scoreCardBody, locale)}
                </p>
              </div>
              <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-cyan-200/15 text-cyan-100 transition group-hover:scale-105 sm:flex">
                <Radar className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
              {text(sectionCopy.scoreCardCta, locale)}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/website-create/"
            className="group overflow-hidden rounded-[2rem] border border-amber-200/20 bg-[linear-gradient(145deg,rgba(245,197,92,0.18),rgba(15,23,42,0.72))] p-6 shadow-[0_20px_70px_rgba(245,197,92,0.12)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-amber-100/40"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-slate-950">
                  {text(sectionCopy.websiteCardTag, locale)}
                </span>
                <h2 className="mt-5 text-3xl font-semibold">{text(sectionCopy.websiteCardTitle, locale)}</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                  {text(sectionCopy.websiteCardBody, locale)}
                </p>
              </div>
              <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-amber-100/15 text-amber-100 transition group-hover:scale-105 sm:flex">
                <Globe2 className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-100">
              {text(sectionCopy.websiteCardCta, locale)}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <article className="relative overflow-hidden rounded-[2.35rem] border border-white/10 bg-[linear-gradient(145deg,rgba(15,31,52,0.9),rgba(5,15,29,0.86))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl lg:p-8">
            <div className="pointer-events-none absolute -left-24 -top-24 h-60 w-60 rounded-full bg-cyan-300/12 blur-3xl" />
            <div className="relative">
              <span className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-cyan-100">
                {text(breakpointCopy.eyebrow, locale)}
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{text(breakpointCopy.title, locale)}</h2>
              <div className="mt-6 grid gap-3">
                {breakpointProblems.map((item, index) => (
                  <div key={item.title.zh} className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/15 bg-cyan-200/10 text-xs font-semibold text-cyan-100">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-white">{text(item.title, locale)}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{text(item.body, locale)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <div className="space-y-4">
            <article className="relative overflow-hidden rounded-[2rem] border border-amber-200/20 bg-[linear-gradient(145deg,rgba(245,197,92,0.18),rgba(15,23,42,0.76))] p-6 shadow-[0_24px_80px_rgba(245,197,92,0.12)] backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-amber-200/14 blur-3xl" />
              <div className="relative flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-100/20 bg-amber-100/15 text-amber-100">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-amber-100/80">{text(breakpointCopy.solutionLabel, locale)}</p>
                  <p className="mt-3 text-lg font-semibold leading-8 text-white">{text(breakpointCopy.solutionBody, locale)}</p>
                </div>
              </div>
            </article>

            <div className="grid gap-4 md:grid-cols-2">
              {breakpointSteps.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title.zh}
                    className={`rounded-[1.65rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-200/30 hover:bg-white/[0.08] ${
                      index === 0 ? "md:col-span-2" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/16 bg-cyan-200/10 text-cyan-100">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-cyan-100/70">{locale === "zh" ? `环节 ${String(index + 1).padStart(2, "0")}` : `Step ${index + 1}`}</p>
                        <h3 className="mt-1 text-lg font-semibold">{text(item.title, locale)}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{text(item.body, locale)}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        ref={trustedFlowSectionRef}
        data-trust-motion-active={trustedFlowMotionActive ? "true" : "false"}
        className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8"
      >
        <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(145deg,rgba(8,21,37,0.9),rgba(13,30,51,0.72))] p-6 shadow-[0_28px_100px_rgba(0,0,0,0.24)] backdrop-blur-xl lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">{text(trustedFlowCopy.eyebrow, locale)}</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight">{text(trustedFlowCopy.title, locale)}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{text(trustedFlowCopy.body, locale)}</p>
            </div>

            <div className="relative">
              <div className="trust-chain grid gap-4 lg:grid-cols-3">
                {trustedFlowItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title.zh} className={`trust-evidence-card relative rounded-[1.7rem] border p-5 backdrop-blur-xl ${item.tone}`}>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className="trust-node flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35"
                            style={{ "--trust-delay": `${index * 0.55}s` } as React.CSSProperties}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="rounded-full border border-white/10 bg-slate-950/35 px-2.5 py-1 text-xs text-white/70">
                            0{index + 1}
                          </span>
                        </div>
                        <h3 className="mt-5 text-xl font-semibold text-white">{text(item.title, locale)}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-200">{text(item.body, locale)}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-cyan-300/15 bg-cyan-300/[0.07] px-5 py-4 text-sm leading-7 text-cyan-50">
            {text(trustedFlowCopy.closing, locale)}
          </div>
        </div>
      </section>

      <section id="engine" className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_20%_10%,rgba(103,232,249,0.18),transparent_34%),linear-gradient(145deg,rgba(15,31,52,0.88),rgba(5,15,29,0.92))] p-6 shadow-[0_30px_110px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-300/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <span className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-cyan-100">
                {text(sectionCopy.engineEyebrow, locale)}
              </span>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight">{text(sectionCopy.engineTitle, locale)}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {text(sectionCopy.engineBody, locale)}
              </p>
              <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm leading-7 text-slate-200">
                {locale === "zh"
                  ? "可信增长路径回答“为什么值得被 AI 采信”，五大引擎回答“如何持续做到”。"
                  : "The trusted growth path explains why a brand deserves AI trust; the five engines explain how to make it repeatable."}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {engineModules.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title.zh}
                    className={`group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-200/30 hover:bg-white/[0.08] ${
                      index === 0 ? "md:col-span-2" : ""
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent opacity-60" />
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/16 bg-cyan-200/10 text-cyan-100">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-cyan-100/70">{String(index + 1).padStart(2, "0")}</p>
                        <h3 className="mt-1 text-xl font-semibold">{text(item.title, locale)}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-300">{text(item.body, locale)}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
              <article className="relative overflow-hidden rounded-[1.7rem] border border-amber-200/18 bg-amber-200/[0.075] p-5 backdrop-blur md:col-span-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-200/80 via-cyan-200/30 to-transparent" />
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-100/20 bg-amber-100/10 text-amber-100">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/70">
                      {locale === "zh" ? "辅助能力" : "Supporting capability"}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">
                      {locale === "zh" ? "AI 智能体辅助" : "AI Agent Assistance"}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-200">
                      {locale === "zh"
                        ? "辅助日常内容发布、知识库补齐、页面更新和持续复测，让增长系统可以持续运营，而不是上线后停住。"
                        : "Supports daily publishing, knowledge-base completion, page updates, and retesting so the growth system keeps operating after launch."}
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-100/80">{text(sectionCopy.plansEyebrow, locale)}</p>
            <h2 className="mt-3 text-4xl font-semibold">{text(sectionCopy.plansTitle, locale)}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {text(sectionCopy.plansBody, locale)}
            </p>
          </div>
          <div className="grid gap-5 xl:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.name.zh} className="rounded-[2rem] border border-white/10 bg-slate-950/62 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <span className="rounded-full bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">{text(plan.tag, locale)}</span>
                <h3 className="mt-5 text-2xl font-semibold">{text(plan.name, locale)}</h3>
                <p className="mt-2 text-3xl font-semibold text-amber-100">{text(plan.price, locale)}</p>
                <p className="mt-4 text-sm leading-7 text-slate-300">{text(plan.body, locale)}</p>
                <div className="mt-5 grid gap-3">
                  {plan.points.map((point) => (
                    <div key={point.zh} className="flex items-start gap-3 rounded-2xl bg-white/[0.05] px-4 py-3">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-100" />
                      <p className="text-sm leading-6 text-slate-200">{text(point, locale)}</p>
                    </div>
                  ))}
                </div>
                <Link href={plan.href} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">
                  {text(plan.cta, locale)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">{text(sectionCopy.processEyebrow, locale)}</p>
            <h2 className="mt-3 text-4xl font-semibold">{text(sectionCopy.processTitle, locale)}</h2>
            <div className="mt-7 grid gap-4">
              {processSteps.map((step, index) => (
                <div key={step.title.zh} className="flex items-start gap-4 rounded-[1.4rem] border border-white/10 bg-slate-950/42 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-sm font-semibold text-slate-950">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-white">{text(step.title, locale)}</h3>
                    <p className="mt-1 text-sm leading-7 text-slate-200">{text(step.body, locale)}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(20,32,52,0.9),rgba(11,21,36,0.88))] p-6 backdrop-blur-xl">
            <ShieldCheck className="h-7 w-7 text-amber-100" />
            <h2 className="mt-4 text-3xl font-semibold">{text(sectionCopy.fitTitle, locale)}</h2>
            <div className="mt-6 grid gap-3">
              {fitList.map((item, index) => (
                <div
                  key={item.title.zh}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 transition duration-300 hover:-translate-y-0.5 hover:border-amber-200/28 hover:bg-white/[0.085] hover:shadow-[0_18px_45px_rgba(0,0,0,0.24)]"
                >
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-200/70 via-cyan-200/35 to-transparent opacity-60 transition group-hover:opacity-100" />
                  <div className="relative flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-100/20 bg-amber-100/10 text-xs font-semibold text-amber-100">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{text(item.title, locale)}</h3>
                      <p className="mt-1 text-sm leading-7 text-slate-200">{text(item.body, locale)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="contact" className="relative mx-auto max-w-7xl px-5 pb-28 pt-10 sm:px-8">
        <div className="grid gap-6 rounded-[2.4rem] border border-cyan-300/20 bg-[linear-gradient(145deg,rgba(12,28,47,0.92),rgba(6,17,31,0.86))] p-6 shadow-[0_28px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:grid-cols-[1fr_280px] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
              <LayoutTemplate className="h-4 w-4" />
              {text(sectionCopy.contactEyebrow, locale)}
            </div>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight">{text(sectionCopy.contactTitle, locale)}</h2>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-300">{text(sectionCopy.contactBody, locale)}</p>
          </div>
          <div className="rounded-[1.8rem] border border-white/10 bg-white p-5 text-slate-950">
            <img src={wecomSupportQrImage} alt="坚果猫企微客服二维码" className="mx-auto h-52 w-52 rounded-2xl object-cover" />
            <p className="mt-4 text-center text-sm font-semibold">{text(sectionCopy.qrTitle, locale)}</p>
            <p className="mt-2 text-center text-xs leading-5 text-slate-500">{text(sectionCopy.qrDesc, locale)}</p>
          </div>
        </div>
      </section>

      <GrowthEntryFloating />
    </main>
  );
}
