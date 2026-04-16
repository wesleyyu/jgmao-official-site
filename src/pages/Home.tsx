import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  Bot,
  Check,
  Database,
  FileSearch,
  Gauge,
  Globe2,
  Menu,
  MoveUpRight,
  Radar,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import { startTransition, useEffect, useState, type FormEvent } from "react";

import logoImage from "@/assets/jgmao-logo-black-square.png";
import { cn } from "@/lib/utils";

type Locale = "zh" | "en";
type LocalizedText = Record<Locale, string>;

type NavItem = {
  href: string;
  label: LocalizedText;
};

type HeroStat = {
  label: LocalizedText;
  value: string;
  detail: LocalizedText;
};

type EngineMetric = {
  label: LocalizedText;
  value: string;
};

type Capability = {
  id: string;
  token: string;
  name: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  modalBody: LocalizedText;
  geoFocus: LocalizedText;
  accent: string;
  glow: string;
  icon: LucideIcon;
  outputs: LocalizedText[];
  integrations: LocalizedText[];
  signals: LocalizedText[];
  metrics: EngineMetric[];
};

type OrbitPosition = {
  x: number;
  y: number;
};

type GeoBlueprint = {
  title: LocalizedText;
  description: LocalizedText;
  bullets: LocalizedText[];
  icon: LucideIcon;
};

type CaseStudy = {
  company: string;
  sector: LocalizedText;
  outcome: LocalizedText;
  challenge: LocalizedText;
  solution: LocalizedText;
  metrics: Array<{ label: LocalizedText; value: string }>;
};

type FaqItem = {
  question: LocalizedText;
  answer: LocalizedText;
};

type FormState = {
  name: string;
  company: string;
  email: string;
  website: string;
  brief: string;
};

const siteUrl = "http://49.232.252.118:8800/";
const defaultFormState: FormState = { name: "", company: "", email: "", website: "", brief: "" };

const navItems: NavItem[] = [
  { href: "#architecture", label: { zh: "五大引擎", en: "Architecture" } },
  { href: "#modules", label: { zh: "能力模块", en: "Modules" } },
  { href: "#geo", label: { zh: "GEO优化", en: "GEO" } },
  { href: "#cases", label: { zh: "案例证明", en: "Cases" } },
  { href: "#faq", label: { zh: "FAQ", en: "FAQ" } },
  { href: "#contact", label: { zh: "联系咨询", en: "Contact" } },
];

const orbitPositions: OrbitPosition[] = [
  { x: 50, y: 12 },
  { x: 84, y: 34 },
  { x: 71, y: 76 },
  { x: 29, y: 76 },
  { x: 16, y: 34 },
];

const heroStats: HeroStat[] = [
  {
    label: { zh: "AI 可见性提升", en: "AI Visibility Lift" },
    value: "+38%",
    detail: {
      zh: "通过 GEO 页面、FAQ 与证据块优化，提高 AI 问答场景中的被看见概率。",
      en: "Improves visibility in AI answer experiences through GEO pages, FAQ design, and proof blocks.",
    },
  },
  {
    label: { zh: "内容产能", en: "Content Throughput" },
    value: "3.6x",
    detail: {
      zh: "AI 内容工厂把专题页、案例、行业问答和线索页放进同一套生产系统。",
      en: "The AI content factory puts landing pages, case studies, answer-led articles, and lead pages into one system.",
    },
  },
  {
    label: { zh: "高质量线索效率", en: "Qualified Lead Efficiency" },
    value: "+29%",
    detail: {
      zh: "从内容入口到表单转化，再到 CRM 路由与推荐分析，线索承接更完整。",
      en: "From content entry to forms, CRM routing, and recommendation analytics, lead capture becomes more complete.",
    },
  },
];

const capabilities: Capability[] = [
  {
    id: "geo-engine",
    token: "GEO",
    name: { zh: "GEO 优化引擎", en: "GEO Optimization Engine" },
    title: { zh: "让品牌在 AI 问答时代更容易被看见、被引用、被采信", en: "Improve visibility, citation, and trust in the AI answer era" },
    summary: {
      zh: "围绕 AI 搜索、问答式检索和生成式推荐场景，对官网结构、FAQ、答案块和证据表达做系统优化。",
      en: "Systematically optimize website structure, FAQ patterns, answer blocks, and evidence design for AI search and recommendation scenarios.",
    },
    description: {
      zh: "GEO 优化引擎负责识别哪些页面、段落和表达更适合被 AI 抽取，再通过结构化标题、结论先行、证据块和可信来源设计，让网站从“可访问”变成“可引用”。",
      en: "The GEO engine identifies which pages, paragraphs, and answer structures are most extractable by AI, then upgrades them with structured headings, answer-first composition, proof blocks, and trust signals.",
    },
    modalBody: {
      zh: "这个模块是整站 GEO 的基础层。它会告诉企业哪些内容应该写成问题驱动型页面，哪些表达应该缩短，哪些段落需要加入来源、案例和可验证证据，目的是让网站更适合被 AI 抓取、概括和推荐。",
      en: "This module is the base layer for site-wide GEO. It defines which pages should become question-led assets, which paragraphs should be tightened, and where sources, cases, and evidence need to be added so the site is easier for AI systems to retrieve, summarize, and recommend.",
    },
    geoFocus: {
      zh: "核心 GEO 动作：结构化标题、FAQ 集群、答案块、引用来源、案例证据。",
      en: "Core GEO moves: structured headings, FAQ clusters, answer blocks, source references, and proof-heavy cases.",
    },
    accent: "#5AE4FF",
    glow: "rgba(90, 228, 255, 0.24)",
    icon: Globe2,
    outputs: [
      { zh: "AI 搜索可见性诊断", en: "AI visibility diagnostics" },
      { zh: "FAQ / 问答页优化", en: "FAQ and answer-page optimization" },
      { zh: "引用友好的答案结构", en: "Citation-friendly answer structures" },
    ],
    integrations: [
      { zh: "首页、专题页、方案页和案例页标题体系", en: "Homepage, landing-page, solution-page, and case-page heading systems" },
      { zh: "证据块、来源说明、可信表达组件", en: "Proof blocks, source notes, and trust-expression components" },
      { zh: "针对 AI 推荐的 FAQ 与摘要层", en: "FAQ and summary layers designed for AI recommendation" },
    ],
    signals: [
      { zh: "AI 引用率", en: "AI citation rate" },
      { zh: "问答可见性", en: "Answer visibility" },
      { zh: "摘要抽取质量", en: "Summary extraction quality" },
      { zh: "品牌采信度", en: "Brand trust acceptance" },
    ],
    metrics: [
      { label: { zh: "GEO 页面覆盖", en: "GEO Page Coverage" }, value: "42" },
      { label: { zh: "引用提升", en: "Citation Lift" }, value: "+38%" },
      { label: { zh: "答案抽取完整度", en: "Answer Extraction" }, value: "92%" },
    ],
  },
  {
    id: "content-factory",
    token: "AIC",
    name: { zh: "AI 内容工厂", en: "AI Content Factory" },
    title: { zh: "把专题页、问答内容、案例和行业观察放进持续生产系统", en: "Turn pages, Q&A content, cases, and industry insight into a production system" },
    summary: {
      zh: "不仅是写文章，而是形成可复用的内容模板、发布节奏和多页面协同机制。",
      en: "This is not just writing content. It builds reusable templates, publishing rhythms, and multi-page coordination.",
    },
    description: {
      zh: "AI 内容工厂会把企业的产品价值、行业问题、客户案例和转换场景拆成可规模化生成的内容资产，让官网与内容体系长期稳定地产出。",
      en: "The content factory transforms product value, industry questions, customer cases, and conversion scenarios into scalable content assets that continuously feed the website.",
    },
    modalBody: {
      zh: "这个模块决定网站能不能持续生产“被看见的内容”。它会搭建专题页模板、案例模板、行业问答模板和下载页模板，让网站不是一次性搭完，而是持续扩张内容覆盖。",
      en: "This module determines whether the website can keep producing content that gets discovered. It builds reusable templates for landing pages, case studies, industry Q&A, and downloadable assets so the site expands over time instead of stopping at launch.",
    },
    geoFocus: {
      zh: "核心 GEO 动作：问题驱动内容矩阵、案例模板、行业术语覆盖、可摘取摘要。",
      en: "Core GEO moves: question-led content matrices, case templates, industry vocabulary coverage, and extractable summaries.",
    },
    accent: "#A1F56A",
    glow: "rgba(161, 245, 106, 0.22)",
    icon: FileSearch,
    outputs: [
      { zh: "专题页与方案页模板", en: "Landing and solution page templates" },
      { zh: "行业问答内容矩阵", en: "Industry Q&A content matrix" },
      { zh: "案例 / 洞察 / 下载资产", en: "Case-study, insight, and downloadable assets" },
    ],
    integrations: [
      { zh: "首页 Hero 到案例页的内容协同", en: "Content coordination from hero sections to case pages" },
      { zh: "围绕高意图问题的内容批量生产", en: "Batch production around high-intent questions" },
      { zh: "与智能获客系统对接的线索页内容", en: "Lead-page content integrated with the lead system" },
    ],
    signals: [
      { zh: "内容产出速度", en: "Content velocity" },
      { zh: "页面覆盖密度", en: "Coverage density" },
      { zh: "长尾问题触达", en: "Long-tail reach" },
      { zh: "内容转化承接", en: "Content-assisted conversion" },
    ],
    metrics: [
      { label: { zh: "内容模板库", en: "Template Library" }, value: "18" },
      { label: { zh: "发布速度", en: "Publishing Speed" }, value: "72h" },
      { label: { zh: "内容产能", en: "Content Throughput" }, value: "3.6x" },
    ],
  },
  {
    id: "growth-website",
    token: "WEB",
    name: { zh: "AI 增长网站", en: "AI Growth Website" },
    title: { zh: "让官网从静态展示页升级成增长、采信与转化的运营界面", en: "Turn the website from a brochure into an operating interface for growth and trust" },
    summary: {
      zh: "官网不再只是展示品牌，而是承接 GEO、内容工厂、线索系统和推荐分析的增长中枢。",
      en: "The website becomes the central layer that connects GEO, content, lead capture, and recommendation analysis.",
    },
    description: {
      zh: "AI 增长网站模块负责首页、产品页、解决方案页、案例页、FAQ 和表单的整体协同，让品牌故事、信任层与转化路径都在一个体验里成立。",
      en: "The AI growth website module orchestrates the homepage, product pages, solution pages, case studies, FAQ, and forms so brand narrative, trust signals, and conversion paths work together.",
    },
    modalBody: {
      zh: "这个模块是五大引擎的展示入口和承接层。它决定品牌信息是不是清楚、用户是不是知道下一步、AI 是不是容易理解页面层级，也是整站 GEO 的载体。",
      en: "This module is both the display layer and the conversion layer for all five engines. It determines whether the brand story is clear, whether buyers know the next step, and whether AI systems can understand the site hierarchy.",
    },
    geoFocus: {
      zh: "核心 GEO 动作：页面层级、结论先行、语义标题、FAQ 区和案例内链。",
      en: "Core GEO moves: page hierarchy, answer-first composition, semantic headings, FAQ blocks, and internal links to cases.",
    },
    accent: "#F3C56B",
    glow: "rgba(243, 197, 107, 0.22)",
    icon: Sparkles,
    outputs: [
      { zh: "首页 / 产品页 / 场景页结构", en: "Homepage, product-page, and scenario-page structure" },
      { zh: "案例页与 FAQ 体验设计", en: "Case-study and FAQ experience design" },
      { zh: "转化导向型页面组件", en: "Conversion-oriented page components" },
    ],
    integrations: [
      { zh: "品牌主张、信任层与行动入口的统一呈现", en: "Unified presentation of brand narrative, proof, and action entry points" },
      { zh: "AI 可理解的页面语义和摘要层", en: "AI-readable page semantics and summary layers" },
      { zh: "与获客系统和推荐分析的闭环承接", en: "Closed-loop integration with lead systems and recommendation analytics" },
    ],
    signals: [
      { zh: "停留时长", en: "Dwell time" },
      { zh: "页面滚动深度", en: "Scroll depth" },
      { zh: "CTA 点击率", en: "CTA click rate" },
      { zh: "核心页面转化率", en: "Core page conversion" },
    ],
    metrics: [
      { label: { zh: "高意图页面", en: "High-Intent Pages" }, value: "16" },
      { label: { zh: "CTA 点击提升", en: "CTA Lift" }, value: "+24%" },
      { label: { zh: "表单转化", en: "Form Conversion" }, value: "+29%" },
    ],
  },
  {
    id: "lead-system",
    token: "CRM",
    name: { zh: "智能获客系统", en: "Intelligent Lead System" },
    title: { zh: "把内容流量与咨询意向转成可跟进、可分发、可验证的高质量线索", en: "Convert traffic and intent into qualified, routable, measurable leads" },
    summary: {
      zh: "从 CTA、表单、下载页到 CRM 回写和顾问跟进，形成完整线索承接路径。",
      en: "From CTA and forms to CRM routing and consultant follow-up, build a full lead-capture path.",
    },
    description: {
      zh: "智能获客系统负责线索表单设计、分发逻辑、标签管理、CRM 回写和后续跟进规则，让网站增长结果真正进入销售和客户成功流程。",
      en: "The lead system handles forms, routing, tagging, CRM write-back, and follow-up rules so website growth translates into real pipeline.",
    },
    modalBody: {
      zh: "如果没有智能获客系统，内容与 GEO 只能停留在曝光层。这个模块负责把高意图访客快速识别出来，按来源、场景、需求强弱进入不同的承接路径。",
      en: "Without an intelligent lead system, content and GEO stop at awareness. This module identifies high-intent visitors quickly and routes them into the right follow-up path based on source, scenario, and urgency.",
    },
    geoFocus: {
      zh: "核心 GEO 动作：在 FAQ、案例、方案页中埋入高意图 CTA 与分层表单。",
      en: "Core GEO moves: embed high-intent CTAs and tiered forms inside FAQ, case-study, and solution pages.",
    },
    accent: "#7CB6FF",
    glow: "rgba(124, 182, 255, 0.22)",
    icon: Database,
    outputs: [
      { zh: "线索表单与咨询入口", en: "Lead forms and consultation entry points" },
      { zh: "CRM 回写与标签路由", en: "CRM write-back and tag routing" },
      { zh: "线索分层与跟进节奏", en: "Lead scoring and follow-up rhythm" },
    ],
    integrations: [
      { zh: "与内容页、案例页和 FAQ 的 CTA 协同", en: "CTA coordination across content, cases, and FAQ" },
      { zh: "基于场景与行业的线索分层规则", en: "Lead-routing rules based on scenario and industry" },
      { zh: "与推荐分析联动的线索质量回看", en: "Lead-quality feedback linked to recommendation analytics" },
    ],
    signals: [
      { zh: "表单完成率", en: "Form completion" },
      { zh: "线索质量", en: "Lead quality" },
      { zh: "销售接受率", en: "Sales acceptance" },
      { zh: "转化到商机速度", en: "Lead-to-opportunity speed" },
    ],
    metrics: [
      { label: { zh: "线索路由规则", en: "Routing Rules" }, value: "12" },
      { label: { zh: "高质量线索", en: "Qualified Leads" }, value: "+29%" },
      { label: { zh: "线索响应时效", en: "Response Time" }, value: "<30m" },
    ],
  },
  {
    id: "recommendation-analytics",
    token: "ANA",
    name: { zh: "AI推荐分析", en: "AI Recommendation Analytics" },
    title: { zh: "看清品牌是如何被 AI 推荐、被用户点击、被线索验证的", en: "Understand how AI recommends your brand and how those recommendations convert" },
    summary: {
      zh: "把 AI 引用、推荐路径、内容表现和线索质量放进统一的决策分析层。",
      en: "Unify AI citations, recommendation paths, content performance, and lead quality in one decision layer.",
    },
    description: {
      zh: "AI推荐分析模块负责监测品牌在哪些问题场景中被推荐、哪些表达更容易被采纳、哪些内容能带来更高质量的商机，让优化有真正的闭环。",
      en: "The recommendation analytics module tracks where the brand is recommended, which messages are adopted more often, and which assets produce higher-quality pipeline.",
    },
    modalBody: {
      zh: "这个模块是网站 GEO 的判断层。它不只告诉你页面有没有流量，而是告诉你 AI 为什么推荐你、哪些内容在推动获客、哪些页面虽然有访问却没有商机质量。",
      en: "This module is the judgment layer for website GEO. It tells you not just whether pages have traffic, but why AI recommends you, which assets move pipeline, and which pages attract visits without real opportunity quality.",
    },
    geoFocus: {
      zh: "核心 GEO 动作：监测 AI 推荐路径、内容胜率、推荐到商机的归因关系。",
      en: "Core GEO moves: track AI recommendation paths, content win rates, and attribution from recommendation to opportunity.",
    },
    accent: "#FF8C8C",
    glow: "rgba(255, 140, 140, 0.22)",
    icon: Radar,
    outputs: [
      { zh: "AI 推荐路径分析", en: "AI recommendation-path analysis" },
      { zh: "内容与页面表现归因", en: "Content and page attribution" },
      { zh: "推荐到商机的质量回看", en: "Recommendation-to-opportunity quality review" },
    ],
    integrations: [
      { zh: "AI 搜索引用与推荐监测", en: "AI search citation and recommendation tracking" },
      { zh: "内容胜率与页面实验反馈", en: "Content win-rate and page experiment feedback" },
      { zh: "与智能获客系统联动的商机质量分析", en: "Opportunity-quality analysis linked to the lead system" },
    ],
    signals: [
      { zh: "推荐场景", en: "Recommendation scenarios" },
      { zh: "内容胜率", en: "Content win rate" },
      { zh: "来源到商机归因", en: "Source-to-opportunity attribution" },
      { zh: "推荐后线索质量", en: "Post-recommendation lead quality" },
    ],
    metrics: [
      { label: { zh: "推荐场景覆盖", en: "Scenario Coverage" }, value: "57" },
      { label: { zh: "内容胜率", en: "Content Win Rate" }, value: "73%" },
      { label: { zh: "推荐转商机", en: "Recommendation to SQL" }, value: "+21%" },
    ],
  },
];

const geoBlueprints: GeoBlueprint[] = [
  {
    title: { zh: "语义结构优化", en: "Semantic Structure" },
    description: {
      zh: "把首页、产品页、FAQ 和案例页改造成更适合 AI 抽取的语义结构。",
      en: "Rebuild the homepage, product pages, FAQ, and case studies into AI-readable semantic structures.",
    },
    bullets: [
      { zh: "H1 / H2 / H3 层级更清晰", en: "Clearer heading hierarchy" },
      { zh: "答案先行的段落结构", en: "Answer-first paragraph design" },
      { zh: "每个区块都有明确主题句", en: "Every section starts with a clear topical sentence" },
    ],
    icon: Activity,
  },
  {
    title: { zh: "可引用内容层", en: "Citable Content Layer" },
    description: {
      zh: "让页面中的关键结论、案例和 FAQ 更容易被模型摘取和复述。",
      en: "Make key conclusions, cases, and FAQ answers easier for models to retrieve and restate.",
    },
    bullets: [
      { zh: "FAQ 问答块与简明摘要", en: "FAQ blocks and concise summaries" },
      { zh: "来源、案例、证据和数据块", en: "Source notes, proof blocks, and data-backed cases" },
      { zh: "产品能力与场景问题的一一对应", en: "One-to-one mapping between problems and capabilities" },
    ],
    icon: FileSearch,
  },
  {
    title: { zh: "转化承接闭环", en: "Conversion Loop" },
    description: {
      zh: "把 GEO 流量、内容阅读、咨询表单和 CRM 路由连接起来，形成真正可追踪的增长回路。",
      en: "Connect GEO traffic, content consumption, forms, and CRM routing into a trackable growth loop.",
    },
    bullets: [
      { zh: "高意图 CTA 与场景化表单", en: "High-intent CTAs and scenario-based forms" },
      { zh: "来源标记与线索分层", en: "Source tagging and lead segmentation" },
      { zh: "推荐分析回流到内容优化", en: "Recommendation analytics fed back into content optimization" },
    ],
    icon: Workflow,
  },
];

const caseStudies: CaseStudy[] = [
  {
    company: "NovaStack",
    sector: { zh: "B2B SaaS", en: "B2B SaaS" },
    outcome: {
      zh: "通过 GEO 优化引擎与 AI 内容工厂，把官网升级成 AI 搜索的稳定获客入口。",
      en: "Used the GEO engine and content factory to turn the website into a stable acquisition channel in AI search.",
    },
    challenge: {
      zh: "原官网内容不少，但结构混乱，FAQ 和方案页都不适合 AI 抽取，高意图访客也没有清晰表单承接。",
      en: "The old site had content, but weak structure, weak FAQ patterns, and no clear handoff for high-intent visitors.",
    },
    solution: {
      zh: "重做 FAQ、专题页、案例页、表单入口和 AI 推荐分析层，把内容、转化和推荐归因串到一起。",
      en: "Rebuilt FAQ, landing pages, case studies, form paths, and the recommendation analytics layer so content, conversion, and attribution worked together.",
    },
    metrics: [
      { label: { zh: "AI 引用率", en: "AI Citations" }, value: "+41%" },
      { label: { zh: "表单转化", en: "Form Conversion" }, value: "+29%" },
      { label: { zh: "高质量线索", en: "Qualified Leads" }, value: "+24%" },
    ],
  },
  {
    company: "Helio Industrial",
    sector: { zh: "工业制造", en: "Industrial Manufacturing" },
    outcome: {
      zh: "用 AI 增长网站 + 智能获客系统，把复杂产品介绍页变成可解释、可信、可转化的官网体系。",
      en: "Used the AI growth website and lead system to turn complex product pages into a trustworthy and conversion-ready site.",
    },
    challenge: {
      zh: "品牌可信度不足，客户很难快速理解产品逻辑，销售只能靠人工解释补位。",
      en: "Trust signals were weak, buyers struggled to understand the product, and sales relied on manual explanation.",
    },
    solution: {
      zh: "建立案例、资质、FAQ、方案页和线索分发流程，让 AI 推荐分析反向校准内容与入口设计。",
      en: "Built case studies, credentials, FAQ, solution pages, and lead routing while using recommendation analytics to refine content and entry design.",
    },
    metrics: [
      { label: { zh: "咨询质量", en: "Lead Quality" }, value: "+34%" },
      { label: { zh: "停留时长", en: "Dwell Time" }, value: "+22%" },
      { label: { zh: "推荐转商机", en: "Recommendation to SQL" }, value: "+18%" },
    ],
  },
];

const faqItems: FaqItem[] = [
  {
    question: { zh: "什么是 JGMAO AI 增长引擎？", en: "What is the JGMAO AI Growth Engine?" },
    answer: {
      zh: "JGMAO AI 增长引擎是一套帮助企业在 AI 时代构建增长飞轮的系统，包含 GEO 优化引擎、AI 内容工厂、AI 增长网站、智能获客系统和 AI 推荐分析五大部分。",
      en: "JGMAO AI Growth Engine is a system for helping enterprises build AI growth flywheels, combining a GEO engine, AI content factory, AI growth website, intelligent lead system, and AI recommendation analytics.",
    },
  },
  {
    question: { zh: "GEO 优化和传统 SEO 有什么区别？", en: "How is GEO different from traditional SEO?" },
    answer: {
      zh: "SEO 更偏向网页排名，GEO 更关注品牌在 AI 问答、生成式搜索和推荐场景中是否容易被抽取、总结、引用和采信。它要求网站具备更好的答案结构、FAQ 设计、证据表达和可信来源。",
      en: "SEO focuses more on search rankings, while GEO focuses on whether a brand is easy to retrieve, summarize, cite, and trust in AI answer and recommendation environments. That requires better answer structures, FAQ design, proof blocks, and source signals.",
    },
  },
  {
    question: { zh: "AI 内容工厂为什么必须和官网一起做？", en: "Why must the AI content factory be connected to the website?" },
    answer: {
      zh: "因为内容如果不回流到官网结构、FAQ、案例页和线索页，就很难形成可持续的增长资产。AI 内容工厂的价值在于持续生成可被看见、可被推荐、可被转化的官网内容系统。",
      en: "Because content alone does not create durable growth assets unless it flows back into the website structure, FAQ, case studies, and lead pages. The content factory matters when it continuously creates visible, recommendable, conversion-ready site assets.",
    },
  },
  {
    question: { zh: "智能获客系统在网站里起什么作用？", en: "What role does the intelligent lead system play on the website?" },
    answer: {
      zh: "它负责把浏览行为、FAQ 阅读、案例访问和 CTA 点击转成高质量线索，并通过标签、分层和 CRM 回写，把增长结果真正带到销售和客户成功流程里。",
      en: "It turns browsing behavior, FAQ reading, case-study visits, and CTA clicks into qualified leads, then routes them with tags, segmentation, and CRM write-back so growth impacts pipeline.",
    },
  },
  {
    question: { zh: "AI 推荐分析为什么对 GEO 很关键？", en: "Why is AI recommendation analytics critical for GEO?" },
    answer: {
      zh: "因为企业不仅要知道有没有流量，更要知道 AI 为什么推荐你、哪些页面在带来高质量线索、哪些内容虽然曝光高却没有商业价值。推荐分析是整站 GEO 优化的判断层。",
      en: "Because enterprises need to know not just whether they have traffic, but why AI recommends them, which pages create qualified pipeline, and which content attracts exposure without business value. Recommendation analytics is the judgment layer for site-wide GEO.",
    },
  },
];

const brandCopy = {
  heroTag: { zh: "JGMAO AI Growth Engine", en: "JGMAO AI Growth Engine" },
  heroTitle: { zh: "帮助企业在 AI 时代构建 AI 增长飞轮", en: "Helping enterprises build AI growth flywheels in the AI era" },
  heroBody: {
    zh: "帮助企业把AI可见性、内容、官网、获客与推荐判断连成一个真正可运转的增长系统。",
    en: "JGMAO AI Growth Engine combines five parts: GEO optimization, an AI content factory, an AI growth website, an intelligent lead system, and AI recommendation analytics to connect visibility, content, conversion, and feedback into one operating system.",
  },
  architectureTag: { zh: "Brand Architecture", en: "Brand Architecture" },
  architectureTitle: { zh: "JGMAO AI 增长引擎包含五大部分", en: "JGMAO AI Growth Engine includes five core parts" },
  architectureBody: {
    zh: "主品牌负责定义企业在 AI 时代的增长方法论，五大引擎分别覆盖可见性、内容生产、官网承接、智能获客与推荐判断，最终形成一个完整的 AI 增长飞轮。",
    en: "The core brand defines the operating model for enterprise growth in the AI era, while the five engines cover visibility, content production, website conversion, intelligent lead capture, and recommendation intelligence.",
  },
  moduleTag: { zh: "Interactive Engine Map", en: "Interactive Engine Map" },
  moduleTitle: { zh: "五大引擎不是孤立产品，而是一套协同增长系统", en: "The five engines are not isolated products. They form one coordinated growth system." },
  moduleBody: {
    zh: "点击任意引擎查看它在整站 GEO、内容、转化和推荐分析中的位置。每一部分都能单独发挥作用，但组合起来才是完整的 AI 增长引擎。",
    en: "Click any engine to see how it contributes to site-wide GEO, content, conversion, and recommendation intelligence. Each part can work alone, but together they create a complete AI growth engine.",
  },
  detailButton: { zh: "查看引擎详情", en: "Open Engine Detail" },
  geoTag: { zh: "GEO Optimization Blueprint", en: "GEO Optimization Blueprint" },
  geoTitle: { zh: "整站 GEO 优化不只是写内容，而是重构网站的可见性与可引用性", en: "Site-wide GEO is not just content production. It rebuilds visibility and citability." },
  geoBody: {
    zh: "我们把 GEO 放在网站整体结构层来做：标题层级、FAQ 设计、答案块、案例证据、CTA 和线索回写都被一起优化，这样 AI 才更容易理解网站，用户也更容易转化。",
    en: "We treat GEO as a full-site structural layer. Heading hierarchy, FAQ design, answer blocks, proof-heavy case studies, CTA paths, and lead write-back are optimized together so AI systems can understand the site and buyers can convert more easily.",
  },
  casesTag: { zh: "Case Proof", en: "Case Proof" },
  casesTitle: { zh: "当五大引擎协同工作，官网才会真正变成增长资产", en: "A website becomes a growth asset when all five engines work together" },
  casesBody: {
    zh: "案例区的价值不只是证明我们做过项目，而是展示五大引擎如何共同提升 AI 可见性、内容规模、线索质量与推荐分析能力。",
    en: "Case studies do more than prove experience. They show how the five engines raise AI visibility, content scale, lead quality, and recommendation intelligence together.",
  },
  faqTag: { zh: "FAQ For GEO", en: "FAQ For GEO" },
  faqTitle: { zh: "FAQ 是网站 GEO 的关键内容层", en: "FAQ is a critical content layer for website GEO" },
  faqBody: {
    zh: "下面这些问答不仅服务访客，也服务 AI。它们会让模型更容易理解 JGMAO 的结构、价值和适用场景。",
    en: "These answers are written for both buyers and AI systems. They make it easier to understand JGMAO’s structure, value, and use cases.",
  },
  contactTag: { zh: "Lead Conversion", en: "Lead Conversion" },
  contactTitle: { zh: "让网站访问、AI 推荐与销售线索真正连起来", en: "Connect website visits, AI recommendations, and real pipeline" },
  contactBody: {
    zh: "如果你想围绕 GEO、内容工厂、官网转化和推荐分析重构现有网站，可以直接提交当前情况，我们会基于五大引擎给出站点升级路径。",
    en: "If you want to rebuild an existing website around GEO, content production, conversion, and recommendation analytics, submit your current situation and we can propose an upgrade path based on the five engines.",
  },
  formSuccess: {
    zh: "信息已记录。下一步可以把这份表单接到 CRM、日历预约或顾问分发流程。",
    en: "Captured. Next step is connecting this intake form to CRM, calendar scheduling, or advisor routing.",
  },
  formSubmit: { zh: "获取站点升级方案", en: "Request a Site Upgrade Plan" },
  formDisclaimer: {
    zh: "示意表单：当前为前端展示，可继续接入真实提交、CRM 和自动分发。",
    en: "Demo form only: ready to connect to real submission, CRM, and automated routing next.",
  },
  activeModule: { zh: "当前引擎", en: "Active Engine" },
  menuLabel: { zh: "切换导航", en: "Toggle navigation" },
  modalClose: { zh: "关闭", en: "Close" },
};

const topQuickFacts = [
  { zh: "GEO + Content + Website + Leads + Analytics", en: "GEO + Content + Website + Leads + Analytics" },
  { zh: "AI时代企业增长系统", en: "Enterprise growth system for the AI era" },
];

function t(copy: LocalizedText, locale: Locale) {
  return copy[locale];
}

function setMetaTag(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
}

function SectionTag({ children }: { children: string }) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-cyan-100/80">
      {children}
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#1f1d1d] shadow-[0_0_30px_rgba(245,197,92,0.12)]">
      <img src={logoImage} alt="坚果猫 Logo" className="h-full w-full object-cover" />
    </div>
  );
}

function EngineNode({
  capability,
  position,
  isActive,
  onActivate,
}: {
  capability: Capability;
  position: OrbitPosition;
  isActive: boolean;
  onActivate: () => void;
}) {
  const Icon = capability.icon;

  return (
    <motion.button
      type="button"
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      aria-label={t(capability.name, "zh")}
      className={cn(
        "absolute z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[1.8rem] border text-center backdrop-blur transition-all duration-300 md:h-28 md:w-28",
        isActive ? "scale-105 border-white/35 bg-slate-950/85" : "border-white/10 bg-slate-950/50 hover:border-white/20 hover:bg-slate-950/60",
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        boxShadow: isActive ? `0 0 0 1px ${capability.accent} inset, 0 0 32px ${capability.glow}` : undefined,
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-2xl border"
        style={{
          backgroundColor: capability.glow,
          borderColor: isActive ? capability.accent : "rgba(255,255,255,0.12)",
          color: capability.accent,
        }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className={cn("mt-2 font-semibold tracking-[0.16em]", capability.token.length > 3 ? "text-xs" : "text-sm")} style={{ color: isActive ? capability.accent : "#F5F7FB" }}>
        {capability.token}
      </span>
      <span className="text-[10px] uppercase tracking-[0.18em] text-slate-300">{capability.id.replaceAll("-", " ")}</span>
    </motion.button>
  );
}

function Home() {
  const [locale, setLocale] = useState<Locale>("zh");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSection, setActiveSection] = useState("architecture");
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formState, setFormState] = useState<FormState>(defaultFormState);

  const activeCapability = capabilities[activeIndex];
  const detailCapability = detailIndex === null ? null : capabilities[detailIndex];

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      startTransition(() => {
        setActiveIndex((current) => (current + 1) % capabilities.length);
      });
    }, 3600);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.href.replace("#", ""));
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.18, 0.3, 0.5, 0.7],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";

    const title = locale === "zh"
      ? "JGMAO AI 增长引擎 | GEO优化引擎 | AI内容工厂 | AI增长网站 | 智能获客系统 | AI推荐分析"
      : "JGMAO AI Growth Engine | GEO | AI Content Factory | AI Growth Website | Lead System | Recommendation Analytics";
    const description = locale === "zh"
      ? "JGMAO AI 增长引擎帮助企业在 AI 时代构建 AI 增长飞轮，包含 GEO 优化引擎、AI 内容工厂、AI 增长网站、智能获客系统和 AI推荐分析五大部分。"
      : "JGMAO AI Growth Engine helps enterprises build AI growth flywheels through GEO optimization, AI content production, AI growth websites, intelligent lead systems, and recommendation analytics.";
    const keywords = locale === "zh"
      ? "JGMAO, AI增长引擎, GEO优化引擎, AI内容工厂, AI增长网站, 智能获客系统, AI推荐分析, GEO优化, AI搜索优化"
      : "JGMAO, AI growth engine, GEO optimization, AI content factory, AI growth website, intelligent lead system, recommendation analytics";

    document.title = title;
    setMetaTag("name", "description", description);
    setMetaTag("name", "keywords", keywords);
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", "website");
    setMetaTag("property", "og:url", siteUrl);
    setMetaTag("property", "og:image", new URL(logoImage, window.location.origin).href);
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", description);

    const scriptId = "jgmao-structured-data";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const organizationName = locale === "zh" ? "JGMAO AI 增长引擎" : "JGMAO AI Growth Engine";
    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: organizationName,
        url: siteUrl,
        logo: new URL(logoImage, window.location.origin).href,
        description,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: organizationName,
        url: siteUrl,
        description,
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: locale === "zh" ? "JGMAO 五大引擎" : "JGMAO Five Engines",
        itemListElement: capabilities.map((capability, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: t(capability.name, locale),
          description: t(capability.summary, locale),
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: t(item.question, locale),
          acceptedAnswer: {
            "@type": "Answer",
            text: t(item.answer, locale),
          },
        })),
      },
    ];

    script.textContent = JSON.stringify(structuredData);
  }, [locale]);

  useEffect(() => {
    if (detailIndex === null) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDetailIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [detailIndex]);

  const handleInputChange = (field: keyof FormState, value: string) => {
    setSubmitted(false);
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setFormState(defaultFormState);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(82,230,255,0.14),transparent_24%),radial-gradient(circle_at_90%_18%,rgba(245,197,92,0.12),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(181,146,255,0.12),transparent_28%),linear-gradient(180deg,#050816_0%,#091222_38%,#050816_100%)]" />
      <div className="pointer-events-none absolute inset-0 ops-grid opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,8,22,0.18)_58%,rgba(5,8,22,0.94)_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 pb-20 pt-6 sm:px-6 lg:px-10">
        <header className="sticky top-4 z-40 mb-10 rounded-[1.6rem] border border-white/10 bg-slate-950/55 px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandMark />
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-100/70">JGMAO</p>
                <p className="text-sm text-white">{locale === "zh" ? "AI增长引擎" : "AI Growth Engine"}</p>
              </div>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
                {navItems.map((item) => {
                  const sectionId = item.href.replace("#", "");
                  const isActive = activeSection === sectionId;

                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-full px-4 py-2 transition",
                        isActive ? "bg-white/12 text-white" : "text-slate-300 hover:bg-white/8 hover:text-white",
                      )}
                    >
                      {t(item.label, locale)}
                    </a>
                  );
                })}
              </nav>

              <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1">
                {(["zh", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLocale(lang)}
                    className={cn(
                      "rounded-full px-3 py-2 text-xs uppercase tracking-[0.18em] transition",
                      locale === lang ? "bg-white/12 text-white" : "text-slate-300 hover:text-white",
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white lg:hidden"
              aria-label={t(brandCopy.menuLabel, locale)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <AnimatePresence>
            {menuOpen ? (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="mt-4 rounded-[1.4rem] border border-white/10 bg-slate-950/80 p-4 lg:hidden"
              >
                <div className="grid gap-2">
                  {navItems.map((item) => {
                    const sectionId = item.href.replace("#", "");
                    const isActive = activeSection === sectionId;

                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "rounded-2xl px-4 py-3 text-sm transition",
                          isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/6 hover:text-white",
                        )}
                      >
                        {t(item.label, locale)}
                      </a>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center rounded-full border border-white/10 bg-white/5 p-1">
                  {(["zh", "en"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLocale(lang)}
                      className={cn(
                        "flex-1 rounded-full px-3 py-2 text-xs uppercase tracking-[0.18em] transition",
                        locale === lang ? "bg-white/12 text-white" : "text-slate-300 hover:text-white",
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </header>

        <section className="grid gap-7 pb-12 pt-2 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
          <div>
            <SectionTag>{t(brandCopy.heroTag, locale)}</SectionTag>

            <div className="mt-4 flex flex-wrap gap-2">
              {topQuickFacts.map((fact) => (
                <div key={fact.en} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                  {t(fact, locale)}
                </div>
              ))}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[4.35rem] lg:leading-[1.03]"
            >
              {locale === "zh" ? (
                <>
                  帮助企业在 AI 时代
                  <br />
                  构建 <span className="bg-gradient-to-r from-cyan-200 via-amber-100 to-violet-200 bg-clip-text text-transparent">AI 增长飞轮</span>
                </>
              ) : (
                <>
                  Helping enterprises build
                  <br />
                  <span className="bg-gradient-to-r from-cyan-200 via-amber-100 to-violet-200 bg-clip-text text-transparent">AI growth flywheels</span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg"
            >
              {t(brandCopy.heroBody, locale)}
            </motion.p>

            <div className="mt-6 flex flex-wrap gap-3">
              {capabilities.map((capability) => (
                <div key={capability.id} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  {t(capability.name, locale)}
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {heroStats.map((item) => (
                <article key={item.label.en} className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t(item.label, locale)}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{item.value}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{t(item.detail, locale)}</p>
                </article>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/55 px-6 py-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,92,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(82,230,255,0.12),transparent_30%)]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{locale === "zh" ? "实时系统快照" : "Live System Snapshot"}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {locale === "zh" ? "增长不是一条链路，而是一个会自我强化的系统" : "Growth is not a single funnel. It is a self-reinforcing system."}
                  </h2>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-emerald-100">
                  {locale === "zh" ? "飞轮运行中" : "Loop Active"}
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {[
                  {
                    label: { zh: "采集层", en: "Signal Layer" },
                    value: { zh: "Search + Site + CRM + AI 引用", en: "Search + Site + CRM + AI citations" },
                    icon: Gauge,
                  },
                  {
                    label: { zh: "策略层", en: "Strategy Layer" },
                    value: { zh: "Journey → Generation → Monitoring → Authority", en: "Journey → Generation → Monitoring → Authority" },
                    icon: Bot,
                  },
                  {
                    label: { zh: "执行层", en: "Execution Layer" },
                    value: { zh: "Orchestration 自动发布 / 回写 / 复盘", en: "Orchestration automates publishing, write-back, and review" },
                    icon: Workflow,
                  },
                ].map((row) => {
                  const Icon = row.icon;

                  return (
                    <div key={row.label.en} className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-cyan-100">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(row.label, locale)}</p>
                          <p className="mt-2 text-sm leading-7 text-white">{t(row.value, locale)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-amber-300/15 bg-amber-300/8 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-amber-100/80">{locale === "zh" ? "核心目标" : "Core Outcome"}</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {locale === "zh"
                    ? "帮助企业把 AI 可见性、内容产能、官网承接、线索转化和推荐判断连成一个真正可持续优化的增长闭环。"
                    : "Help enterprises connect AI visibility, content production, website conversion, lead capture, and recommendation intelligence into one sustainable growth loop."}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="architecture" className="grid gap-6 py-14 lg:grid-cols-[0.88fr_1.12fr]">
          <article className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
            <SectionTag>{t(brandCopy.architectureTag, locale)}</SectionTag>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.5rem]">{t(brandCopy.architectureTitle, locale)}</h2>
            <p className="mt-4 text-base leading-8 text-slate-300">{t(brandCopy.architectureBody, locale)}</p>

            <div className="mt-8 rounded-[1.8rem] border border-cyan-300/15 bg-cyan-300/8 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/80">{locale === "zh" ? "主品牌" : "Core Brand"}</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">{locale === "zh" ? "JGMAO AI 增长引擎" : "JGMAO AI Growth Engine"}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-200">
                {locale === "zh"
                  ? "这是企业 AI 增长方法论与产品架构的总入口。它不只是一个网站名字，而是一整套增长系统的组织方式。"
                  : "This is the master entry point for the product architecture and operating model. It is not just a website name, but the organizing system behind the full growth stack."}
              </p>
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;

              return (
                <motion.article
                  key={capability.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.2)] backdrop-blur"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border" style={{ borderColor: `${capability.accent}88`, backgroundColor: capability.glow, color: capability.accent }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{capability.token}</p>
                      <h3 className="mt-1 text-xl font-semibold text-white">{t(capability.name, locale)}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{t(capability.summary, locale)}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIndex(index);
                      setDetailIndex(index);
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/8"
                  >
                    {t(brandCopy.detailButton, locale)}
                    <MoveUpRight className="h-4 w-4" />
                  </button>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section id="modules" className="grid gap-8 py-14 lg:grid-cols-[1.08fr_0.92fr]">
          <div
            className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-slate-950/50 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.32)] backdrop-blur-xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(82,230,255,0.12),transparent_30%),radial-gradient(circle_at_bottom,rgba(245,197,92,0.10),transparent_28%)]" />
            <div className="relative">
              <SectionTag>{t(brandCopy.moduleTag, locale)}</SectionTag>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.55rem]">{t(brandCopy.moduleTitle, locale)}</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">{t(brandCopy.moduleBody, locale)}</p>

              <div className="relative mx-auto mt-8 aspect-square w-full max-w-[640px]">
                <div className="flywheel-ring absolute inset-[10%] rounded-full border border-white/10 opacity-80" />
                <div className="flywheel-ring-reverse absolute inset-[18%] rounded-full border border-dashed border-white/10 opacity-80" />
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(82,230,255,0.08),transparent_38%),radial-gradient(circle_at_center,rgba(245,197,92,0.06),transparent_60%)]" />

                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                  <circle cx="50" cy="50" r="35" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" fill="none" />
                  <circle cx="50" cy="50" r="22" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" fill="none" />
                  {orbitPositions.map((position, index) => {
                    const capability = capabilities[index];
                    const isActive = index === activeIndex;

                    return (
                      <g key={capability.id}>
                        <line
                          x1="50"
                          y1="50"
                          x2={position.x}
                          y2={position.y}
                          stroke={isActive ? capability.accent : "rgba(255,255,255,0.12)"}
                          strokeWidth={isActive ? 1.4 : 0.7}
                          strokeDasharray={isActive ? "0" : "3 3"}
                          opacity={isActive ? 0.9 : 0.55}
                        />
                        <circle cx={position.x} cy={position.y} r="1.8" fill={isActive ? capability.accent : "rgba(255,255,255,0.35)"} />
                      </g>
                    );
                  })}
                </svg>

                {capabilities.map((capability, index) => (
                  <EngineNode
                    key={capability.id}
                    capability={capability}
                    position={orbitPositions[index]}
                    isActive={index === activeIndex}
                    onActivate={() => {
                      setActiveIndex(index);
                      setIsPaused(true);
                    }}
                  />
                ))}

                <motion.div
                  className="absolute left-1/2 top-1/2 z-10 flex h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/12 bg-slate-950/80 text-center shadow-[0_0_80px_rgba(0,0,0,0.38)] backdrop-blur-xl"
                  animate={{ boxShadow: [`0 0 40px ${activeCapability.glow}`, `0 0 72px ${activeCapability.glow}`, `0 0 40px ${activeCapability.glow}`] }}
                  transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <div className="rounded-2xl border px-4 py-2 text-sm font-semibold tracking-[0.18em]" style={{ borderColor: activeCapability.accent, color: activeCapability.accent, backgroundColor: activeCapability.glow }}>
                    {activeCapability.token}
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.28em] text-slate-400">{locale === "zh" ? "Five Engine System" : "Five Engine System"}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{t(activeCapability.name, locale)}</p>
                  <p className="mt-2 max-w-[17rem] text-sm leading-6 text-slate-300">{t(activeCapability.title, locale)}</p>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <AnimatePresence mode="wait">
              <motion.article
                key={`${activeCapability.id}-${locale}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-400">{t(activeCapability.name, locale)}</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">{t(activeCapability.title, locale)}</h3>
                  </div>
                  <div className="rounded-[1.4rem] border px-4 py-3 text-right" style={{ borderColor: activeCapability.accent, backgroundColor: activeCapability.glow }}>
                    <p className="text-xs uppercase tracking-[0.18em]" style={{ color: activeCapability.accent }}>
                      {t(brandCopy.activeModule, locale)}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">{activeCapability.token}</p>
                  </div>
                </div>

                <p className="mt-5 text-base leading-8 text-slate-300">{t(activeCapability.description, locale)}</p>
                <p className="mt-5 rounded-[1.3rem] border border-white/10 bg-slate-950/55 px-4 py-4 text-sm leading-7 text-slate-200">{t(activeCapability.geoFocus, locale)}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {activeCapability.metrics.map((metric) => (
                    <div key={metric.label.en} className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(metric.label, locale)}</p>
                      <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "核心产物" : "Key Outputs"}</p>
                    <div className="mt-4 space-y-3">
                      {activeCapability.outputs.map((item) => (
                        <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                          {t(item, locale)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "关键连接点" : "Key Integrations"}</p>
                    <div className="mt-4 space-y-3">
                      {activeCapability.integrations.map((item) => (
                        <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                          {t(item, locale)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {activeCapability.signals.map((signal) => (
                    <span key={signal.en} className="rounded-full border px-3 py-2 text-sm text-slate-200" style={{ borderColor: `${activeCapability.accent}66`, backgroundColor: activeCapability.glow }}>
                      {t(signal, locale)}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setDetailIndex(activeIndex)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/8"
                >
                  {t(brandCopy.detailButton, locale)}
                  <MoveUpRight className="h-4 w-4" />
                </button>
              </motion.article>
            </AnimatePresence>
          </div>
        </section>

        <section id="geo" className="py-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionTag>{t(brandCopy.geoTag, locale)}</SectionTag>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.55rem]">{t(brandCopy.geoTitle, locale)}</h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-300">{t(brandCopy.geoBody, locale)}</p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {geoBlueprints.map((blueprint) => {
              const Icon = blueprint.icon;

              return (
                <article key={blueprint.title.en} className="rounded-[1.9rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)] backdrop-blur">
                  <div className="flex items-center gap-4">
                    <div className="rounded-[1.3rem] border border-white/10 bg-slate-950/70 p-3 text-cyan-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">GEO Layer</p>
                      <h3 className="mt-1 text-2xl font-semibold text-white">{t(blueprint.title, locale)}</h3>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-300">{t(blueprint.description, locale)}</p>
                  <div className="mt-5 space-y-3">
                    {blueprint.bullets.map((bullet) => (
                      <div key={bullet.en} className="rounded-[1.3rem] border border-white/10 bg-slate-950/55 px-4 py-4 text-sm leading-7 text-slate-200">
                        {t(bullet, locale)}
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="cases" className="py-14">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
              <SectionTag>{t(brandCopy.casesTag, locale)}</SectionTag>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.45rem]">{t(brandCopy.casesTitle, locale)}</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">{t(brandCopy.casesBody, locale)}</p>

              <div className="mt-8 rounded-[1.7rem] border border-white/10 bg-white/6 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "整站 GEO 结果关注点" : "What We Measure Site-Wide"}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { zh: "AI 引用率", en: "AI citation rate" },
                    { zh: "推荐场景覆盖", en: "Recommendation scenario coverage" },
                    { zh: "FAQ 抽取表现", en: "FAQ extraction performance" },
                    { zh: "高意图 CTA 点击", en: "High-intent CTA clicks" },
                    { zh: "推荐到商机转化", en: "Recommendation to pipeline" },
                  ].map((item) => (
                    <span key={item.en} className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-slate-200">
                      {t(item, locale)}
                    </span>
                  ))}
                </div>
              </div>
            </article>

            <div className="space-y-5">
              {caseStudies.map((caseStudy) => (
                <article key={caseStudy.company} className="rounded-[1.9rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.24)] backdrop-blur">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(caseStudy.sector, locale)}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{caseStudy.company}</h3>
                    </div>
                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-emerald-100">
                      {locale === "zh" ? "协同增长中" : "Compounding"}
                    </div>
                  </div>

                  <p className="mt-4 text-base leading-8 text-white">{t(caseStudy.outcome, locale)}</p>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "挑战" : "Challenge"}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{t(caseStudy.challenge, locale)}</p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "五大引擎动作" : "Five-Engine Execution"}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{t(caseStudy.solution, locale)}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {caseStudy.metrics.map((metric) => (
                      <div key={metric.label.en} className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{t(metric.label, locale)}</p>
                        <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-14">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
              <SectionTag>{t(brandCopy.faqTag, locale)}</SectionTag>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.45rem]">{t(brandCopy.faqTitle, locale)}</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">{t(brandCopy.faqBody, locale)}</p>
            </article>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <motion.article
                  key={item.question.en}
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5 shadow-[0_18px_80px_rgba(0,0,0,0.22)] backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Q0{index + 1}</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">{t(item.question, locale)}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{t(item.answer, locale)}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="py-14">
          <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
            <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl">
              <SectionTag>{t(brandCopy.contactTag, locale)}</SectionTag>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.45rem]">{t(brandCopy.contactTitle, locale)}</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">{t(brandCopy.contactBody, locale)}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {capabilities.map((capability) => (
                  <div key={capability.id} className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{capability.token}</p>
                    <p className="mt-3 text-base font-medium text-white">{t(capability.name, locale)}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">{locale === "zh" ? "姓名" : "Name"}</span>
                    <input
                      value={formState.name}
                      onChange={(event) => handleInputChange("name", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-white placeholder:text-slate-500 focus:border-cyan-300/35 focus:outline-none"
                      placeholder={locale === "zh" ? "例如：Wesley" : "e.g. Wesley"}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">{locale === "zh" ? "公司名称" : "Company"}</span>
                    <input
                      value={formState.company}
                      onChange={(event) => handleInputChange("company", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-white placeholder:text-slate-500 focus:border-cyan-300/35 focus:outline-none"
                      placeholder={locale === "zh" ? "你的公司 / 品牌" : "Your company or brand"}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">{locale === "zh" ? "邮箱" : "Email"}</span>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(event) => handleInputChange("email", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-white placeholder:text-slate-500 focus:border-cyan-300/35 focus:outline-none"
                      placeholder="name@company.com"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">{locale === "zh" ? "官网地址" : "Website URL"}</span>
                    <input
                      value={formState.website}
                      onChange={(event) => handleInputChange("website", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-white placeholder:text-slate-500 focus:border-cyan-300/35 focus:outline-none"
                      placeholder="https://your-site.com"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">{locale === "zh" ? "你当前最想提升的部分" : "What do you want to improve first?"}</span>
                  <textarea
                    value={formState.brief}
                    onChange={(event) => handleInputChange("brief", event.target.value)}
                    rows={6}
                    className="w-full rounded-[1.4rem] border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-300/35 focus:outline-none"
                    placeholder={
                      locale === "zh"
                        ? "例如：想做整站 GEO 优化、重构 AI 增长网站、建立内容工厂和智能获客系统"
                        : "e.g. rebuild site GEO, launch an AI growth website, add an AI content factory, or improve lead capture"
                    }
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/12 px-5 py-3 text-sm font-medium text-cyan-50 transition hover:border-cyan-200/40 hover:bg-cyan-300/18"
                  >
                    {t(brandCopy.formSubmit, locale)}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="text-sm text-slate-400">{t(brandCopy.formDisclaimer, locale)}</p>
                </div>
              </form>

              <AnimatePresence>
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    className="mt-5 flex items-start gap-3 rounded-[1.4rem] border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-100"
                  >
                    <Check className="mt-0.5 h-5 w-5" />
                    <p className="text-sm leading-7">{t(brandCopy.formSuccess, locale)}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </article>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {detailCapability ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-md"
            onClick={() => setDetailIndex(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[2rem] border border-white/10 bg-[#09101f] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.5)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,92,0.14),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(82,230,255,0.12),transparent_28%)]" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-[1.4rem] border px-4 py-3 text-lg font-semibold" style={{ borderColor: detailCapability.accent, color: detailCapability.accent, backgroundColor: detailCapability.glow }}>
                      {detailCapability.token}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t(detailCapability.name, locale)}</p>
                      <h3 className="mt-2 text-3xl font-semibold text-white">{t(detailCapability.title, locale)}</h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailIndex(null)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                    aria-label={t(brandCopy.modalClose, locale)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="mt-6 text-base leading-8 text-slate-300">{t(detailCapability.modalBody, locale)}</p>
                <p className="mt-5 rounded-[1.3rem] border border-white/10 bg-slate-950/55 px-4 py-4 text-sm leading-7 text-slate-200">{t(detailCapability.geoFocus, locale)}</p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {detailCapability.metrics.map((metric) => (
                    <div key={metric.label.en} className="rounded-[1.4rem] border border-white/10 bg-white/6 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(metric.label, locale)}</p>
                      <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "核心产物" : "Key Outputs"}</p>
                    <div className="mt-4 space-y-3">
                      {detailCapability.outputs.map((item) => (
                        <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                          {t(item, locale)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "关键连接点" : "Key Integrations"}</p>
                    <div className="mt-4 space-y-3">
                      {detailCapability.integrations.map((item) => (
                        <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                          {t(item, locale)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "关键判断信号" : "Key Signals"}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {detailCapability.signals.map((signal) => (
                      <span key={signal.en} className="rounded-full border px-3 py-2 text-sm text-slate-200" style={{ borderColor: `${detailCapability.accent}66`, backgroundColor: detailCapability.glow }}>
                        {t(signal, locale)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

export default Home;
