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
  GraduationCap,
  Menu,
  MoveUpRight,
  Radar,
  ShieldCheck,
  Sparkles,
  Waypoints,
  Workflow,
  X,
} from "lucide-react";
import { startTransition, useEffect, useState, type CSSProperties, type ReactNode } from "react";

import logoImage from "@/assets/jgmao-logo-black-square.png";
import { getPublishedFaqs } from "@/content/faqs";
import { getPublishedInsights } from "@/content/insights";
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

type SnapshotLayer = {
  label: LocalizedText;
  value: LocalizedText;
  icon: LucideIcon;
  accent: string;
  glow: string;
};

type EngineMetric = {
  label: LocalizedText;
  value: string;
};

type FlywheelMetric = {
  label: LocalizedText;
  value: string;
};

type FlywheelModule = {
  id: string;
  letter: string;
  name: string;
  title: LocalizedText;
  compactTitle: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  modalBody: LocalizedText;
  accent: string;
  glow: string;
  icon: LucideIcon;
  outputLabel: LocalizedText;
  outputs: LocalizedText[];
  signals: LocalizedText[];
  metrics: FlywheelMetric[];
  integrationTitle: LocalizedText;
  integrations: LocalizedText[];
  nextStep: LocalizedText;
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

type ScenarioCard = {
  title: LocalizedText;
  description: LocalizedText;
  icon: LucideIcon;
  accent: string;
  glow: string;
};

type CaseStudy = {
  company: string;
  sector: LocalizedText;
  outcome: LocalizedText;
  challenge: LocalizedText;
  solution: LocalizedText;
  metrics: Array<{ label: LocalizedText; value: string }>;
};

const siteUrl = "http://49.232.252.118:8800/";
const navItems: NavItem[] = [
  { href: "#flywheel-demo", label: { zh: "增长飞轮", en: "Growth Flywheel" } },
  { href: "#architecture", label: { zh: "核心场景", en: "Architecture" } },
  { href: "#modules", label: { zh: "五大引擎", en: "Modules" } },
  { href: "#cases", label: { zh: "案例", en: "Cases" } },
  { href: "#insights", label: { zh: "新闻 / 洞察", en: "News / Insights" } },
  { href: "#faq", label: { zh: "FAQ", en: "FAQ" } },
  { href: "#contact", label: { zh: "关于我们", en: "About Us" } },
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

const snapshotLayers: SnapshotLayer[] = [
  {
    label: { zh: "采集层", en: "Signal Layer" },
    value: { zh: "搜索信号 + 站点行为 + 线索信号 + AI 引用", en: "Search + Site + Lead Signals + AI citations" },
    icon: Gauge,
    accent: "#52E6FF",
    glow: "rgba(82, 230, 255, 0.22)",
  },
  {
    label: { zh: "策略层", en: "Strategy Layer" },
    value: { zh: "增长路径 → 内容生成 → 监测优化 → 可信表达", en: "Journey → Generation → Monitoring → Authority" },
    icon: Bot,
    accent: "#F5C55C",
    glow: "rgba(245, 197, 92, 0.2)",
  },
  {
    label: { zh: "执行层", en: "Execution Layer" },
    value: { zh: "Orchestration 自动发布 / 回写 / 复盘", en: "Orchestration automates publishing, write-back, and review" },
    icon: Workflow,
    accent: "#B592FF",
    glow: "rgba(181, 146, 255, 0.22)",
  },
];

const orchestrationRail = [
  {
    step: "01",
    title: {
      zh: "发现与诊断",
      en: "Discover and Diagnose",
    },
    description: {
      zh: "识别高价值用户路径、搜索意图与信息缺口。",
      en: "Map high-value journeys, search intent, and information gaps.",
    },
  },
  {
    step: "02",
    title: {
      zh: "资产生成",
      en: "Generate Assets",
    },
    description: {
      zh: "生成页面、内容、信任模块与转化组件。",
      en: "Create pages, content, proof blocks, and conversion components.",
    },
  },
  {
    step: "03",
    title: {
      zh: "监测与学习",
      en: "Monitor and Learn",
    },
    description: {
      zh: "回收引用、点击、停留、转化与实验结果。",
      en: "Collect citations, clicks, dwell time, conversions, and experiments.",
    },
  },
  {
    step: "04",
    title: {
      zh: "自动编排",
      en: "Orchestrate",
    },
    description: {
      zh: "按规则触发迭代、发布、补强与再验证。",
      en: "Trigger iteration, publishing, reinforcement, and re-validation.",
    },
  },
];

const flywheelModules: FlywheelModule[] = [
  {
    id: "journey",
    letter: "J",
    name: "Journey",
    title: {
      zh: "用户旅程与增长路径",
      en: "User Journey and Growth Paths",
    },
    compactTitle: {
      zh: "增长路径",
      en: "Growth Paths",
    },
    summary: {
      zh: "先把用户如何发现、比较、咨询、转化与复访拆成可优化的路径图。",
      en: "Map how users discover, compare, ask, convert, and return before optimizing anything else.",
    },
    description: {
      zh: "我们先对官网流量、搜索意图、内容入口和转化节点做旅程拆解，找出哪里该承接、哪里该解释、哪里该推动行动。",
      en: "We break down traffic, search intent, content entry points, and conversion nodes to understand where the site should guide, explain, or push action.",
    },
    modalBody: {
      zh: "Journey 模块决定官网的信息架构、入口优先级和转化路径。它会告诉你哪些页面该承接高意图需求，哪些内容该放在比较阶段，哪些证据应该在用户准备咨询前出现。",
      en: "Journey defines the website’s information architecture, entry priorities, and conversion paths. It tells you which pages should capture high-intent demand, where comparison-stage content belongs, and when proof should show up before a buyer is ready to talk.",
    },
    accent: "#52E6FF",
    glow: "rgba(82, 230, 255, 0.28)",
    icon: Waypoints,
    outputLabel: {
      zh: "Journey 输出",
      en: "Journey Outputs",
    },
    outputs: [
      {
        zh: "旅程地图",
        en: "Journey maps",
      },
      {
        zh: "关键页面结构",
        en: "High-intent page architecture",
      },
      {
        zh: "高意图入口清单",
        en: "Priority entry-point list",
      },
    ],
    signals: [
      {
        zh: "搜索词群",
        en: "Search clusters",
      },
      {
        zh: "跳转路径",
        en: "Navigation flows",
      },
      {
        zh: "咨询节点",
        en: "Inquiry triggers",
      },
      {
        zh: "转化阻塞点",
        en: "Conversion blockers",
      },
    ],
    metrics: [
      { label: { zh: "旅程清晰度", en: "Journey Clarity" }, value: "91%" },
      { label: { zh: "关键路径覆盖", en: "Path Coverage" }, value: "23" },
      { label: { zh: "高意图入口", en: "Intent Entries" }, value: "48" },
    ],
    integrationTitle: {
      zh: "Journey 连接点",
      en: "Journey Integrations",
    },
    integrations: [
      {
        zh: "官网导航与页面层级设计",
        en: "Website navigation and page hierarchy",
      },
      {
        zh: "CTA 与下载入口的布局策略",
        en: "Layout strategy for CTAs and downloadable assets",
      },
      {
        zh: "内容矩阵中的意图映射",
        en: "Intent mapping across the content matrix",
      },
    ],
    nextStep: {
      zh: "Journey 的输出会直接成为 Generation 的输入。",
      en: "Journey outputs become direct inputs for Generation.",
    },
  },
  {
    id: "generation",
    letter: "G",
    name: "Generation",
    title: {
      zh: "内容 / 站点 / 线索 / 转化的生成能力",
      en: "Generation for Content, Pages, Leads, and Conversion",
    },
    compactTitle: {
      zh: "生成能力",
      en: "Generation System",
    },
    summary: {
      zh: "把战略拆成可规模化生成的页面、内容、CTA 与线索承接资产。",
      en: "Turn strategy into scalable pages, content, CTAs, and lead assets.",
    },
    description: {
      zh: "不是只做文案，而是把页面模块、证据结构、问答片段、下载页、表单与线索收集一起形成高频生成引擎。",
      en: "This is not just copywriting. It is a generation system for page modules, proof structures, answer blocks, download pages, forms, and lead capture assets.",
    },
    modalBody: {
      zh: "Generation 负责把正确的路径转成可快速生产的官网资产。它把首页 Hero、解决方案页、FAQ、案例页和转化组件统一成一个可复用的内容生产系统。",
      en: "Generation turns the right paths into rapidly produced website assets. It unifies homepage hero sections, solution pages, FAQs, case studies, and conversion components into one repeatable production system.",
    },
    accent: "#9CF46B",
    glow: "rgba(156, 244, 107, 0.22)",
    icon: Sparkles,
    outputLabel: {
      zh: "Generation 输出",
      en: "Generation Outputs",
    },
    outputs: [
      {
        zh: "专题页批量生成",
        en: "Landing page generation",
      },
      {
        zh: "问答型内容资产",
        en: "Answer-led content assets",
      },
      {
        zh: "线索承接组件",
        en: "Lead conversion components",
      },
    ],
    signals: [
      {
        zh: "内容缺口",
        en: "Content gaps",
      },
      {
        zh: "页面模板",
        en: "Page templates",
      },
      {
        zh: "下载转化点",
        en: "Download-based conversion points",
      },
      {
        zh: "行业证据素材",
        en: "Industry proof assets",
      },
    ],
    metrics: [
      { label: { zh: "内容产能", en: "Content Capacity" }, value: "8x" },
      { label: { zh: "专题页速度", en: "Launch Speed" }, value: "72h" },
      { label: { zh: "线索承接率", en: "Lead Capture" }, value: "+37%" },
    ],
    integrationTitle: {
      zh: "Generation 连接点",
      en: "Generation Integrations",
    },
    integrations: [
      {
        zh: "官网页面模板与模块库",
        en: "Website page templates and module library",
      },
      {
        zh: "内容生产节奏与发布工作流",
        en: "Content production rhythm and publishing workflow",
      },
      {
        zh: "线索页、CTA 与表单承接",
        en: "Lead pages, CTAs, and form capture",
      },
    ],
    nextStep: {
      zh: "Generation 的结果需要 Monitoring 来验证是否有效。",
      en: "Generation needs Monitoring to validate what actually works.",
    },
  },
  {
    id: "monitoring",
    letter: "M",
    name: "Monitoring",
    title: {
      zh: "监测、验证、反馈",
      en: "Monitoring, Validation, and Feedback",
    },
    compactTitle: {
      zh: "监测反馈",
      en: "Monitoring Loop",
    },
    summary: {
      zh: "每一个增长动作都被追踪、验证、归因，然后回流到下一轮优化。",
      en: "Every growth action is traced, validated, attributed, and fed back into the next cycle.",
    },
    description: {
      zh: "从 AI 引用、自然搜索、页面行为到表单转化，我们把信号统一到一个监测层，知道哪条路径有效、哪种表达在损耗。",
      en: "From AI citations and organic search to page behavior and form conversion, signals are unified into one monitoring layer to reveal which path works and which message leaks value.",
    },
    modalBody: {
      zh: "Monitoring 让官网从主观判断转成有反馈的数据系统。不是只看流量，而是看 AI 引用、页面表现、案例吸引力、CTA 点击和最终线索质量。",
      en: "Monitoring turns the website from a subjective design exercise into a feedback-driven system. It tracks not only traffic, but also AI citations, page performance, case engagement, CTA clicks, and lead quality.",
    },
    accent: "#FFC966",
    glow: "rgba(255, 201, 102, 0.2)",
    icon: Radar,
    outputLabel: {
      zh: "Monitoring 输出",
      en: "Monitoring Outputs",
    },
    outputs: [
      {
        zh: "归因看板",
        en: "Attribution dashboards",
      },
      {
        zh: "实验报告",
        en: "Experiment reports",
      },
      {
        zh: "异常预警与修正建议",
        en: "Anomaly alerts and fixes",
      },
    ],
    signals: [
      {
        zh: "引用率",
        en: "Citation rate",
      },
      {
        zh: "停留时长",
        en: "Dwell time",
      },
      {
        zh: "表单完成率",
        en: "Form completion",
      },
      {
        zh: "实验胜率",
        en: "Experiment win rate",
      },
    ],
    metrics: [
      { label: { zh: "信号刷新", en: "Signal Refresh" }, value: "15m" },
      { label: { zh: "实验闭环", en: "Experiment Loops" }, value: "126/mo" },
      { label: { zh: "异常发现", en: "Anomaly Detection" }, value: "<1h" },
    ],
    integrationTitle: {
      zh: "Monitoring 连接点",
      en: "Monitoring Integrations",
    },
    integrations: [
      {
        zh: "Search Console / Analytics / CRM 数据回收",
        en: "Search Console, Analytics, and CRM feedback",
      },
      {
        zh: "AI 引用与答案抓取监测",
        en: "AI citation and answer extraction tracking",
      },
      {
        zh: "内容与 CTA 的实验对照",
        en: "Controlled experiments for content and CTAs",
      },
    ],
    nextStep: {
      zh: "Monitoring 会告诉 Authority 和智能执行中枢下一步该加强什么。",
      en: "Monitoring tells Authority and Orchestration what to improve next.",
    },
  },
  {
    id: "authority",
    letter: "A",
    name: "Authority",
    title: {
      zh: "采信、可信度、权威表达",
      en: "Authority, Trust, and Credible Expression",
    },
    compactTitle: {
      zh: "可信表达",
      en: "Trust Layer",
    },
    summary: {
      zh: "让官网内容更容易被用户相信，也更容易被 AI 抽取与引用。",
      en: "Make website content easier for people to trust and easier for AI to cite.",
    },
    description: {
      zh: "通过证据结构、来源表达、专家视角、品牌信号与案例可信度设计，让你的页面不是‘会说’，而是‘值得被信’。",
      en: "By designing evidence structures, sourcing, expert voice, brand signals, and proof-heavy case studies, the site becomes not just persuasive, but trustworthy.",
    },
    modalBody: {
      zh: "Authority 模块决定官网是不是值得被采信。它把案例、资质、数据、专家观点和来源说明做成一个统一的信任层，让用户和 AI 都更愿意引用你的内容。",
      en: "Authority determines whether the website deserves trust. It turns cases, credentials, data, expert viewpoints, and source notes into a consistent trust layer that both buyers and AI models are more willing to reference.",
    },
    accent: "#FF7F7F",
    glow: "rgba(255, 127, 127, 0.22)",
    icon: ShieldCheck,
    outputLabel: {
      zh: "Authority 输出",
      en: "Authority Outputs",
    },
    outputs: [
      {
        zh: "可信表达规范",
        en: "Trust expression system",
      },
      {
        zh: "证据引用结构",
        en: "Evidence and citation structure",
      },
      {
        zh: "案例与资质信任层",
        en: "Case-study and credential layer",
      },
    ],
    signals: [
      {
        zh: "引用来源",
        en: "Source references",
      },
      {
        zh: "品牌露出",
        en: "Brand visibility",
      },
      {
        zh: "专家证据",
        en: "Expert proof",
      },
      {
        zh: "案例背书",
        en: "Case validation",
      },
    ],
    metrics: [
      { label: { zh: "引用可信度", en: "Trust Lift" }, value: "+42%" },
      { label: { zh: "AI 采信提升", en: "AI Acceptance" }, value: "+31%" },
      { label: { zh: "品牌信任层", en: "Trust Blocks" }, value: "12" },
    ],
    integrationTitle: {
      zh: "Authority 连接点",
      en: "Authority Integrations",
    },
    integrations: [
      {
        zh: "案例页、资质页、专家内容的统一规范",
        en: "Shared structure for cases, credentials, and expert content",
      },
      {
        zh: "引用格式与证据块标准化",
        en: "Standardized citation and proof blocks",
      },
      {
        zh: "品牌可信表达与设计语言",
        en: "Brand trust language and proof-led design",
      },
    ],
    nextStep: {
      zh: "Authority 会抬高整个飞轮的信任基线。",
      en: "Authority raises the trust baseline of the entire flywheel.",
    },
  },
  {
    id: "orchestration",
    letter: "O",
    name: "Orchestration",
    title: {
      zh: "智能执行中枢",
      en: "AI Automation and Closed-Loop Orchestration",
    },
    compactTitle: {
      zh: "智能执行",
      en: "Automation Hub",
    },
    summary: {
      zh: "把前面四个模块串成持续运转的自动化增长系统，而不是一次性交付。",
      en: "Connect the other four modules into a continuously running, automated growth system instead of a one-off delivery.",
    },
    description: {
      zh: "通过工作流、触发器、任务队列和回写机制，让生成、发布、监测、复盘和优化成为真正自动执行的循环。",
      en: "Through workflows, triggers, job queues, and write-back mechanisms, generation, publishing, monitoring, and iteration become a real operating loop.",
    },
    modalBody: {
      zh: "智能执行中枢是飞轮真正转起来的关键。它让内容生成、页面更新、信号回收、异常提醒和优化建议不再依赖人工记忆，而是按节奏自动发生。",
      en: "Orchestration is what makes the flywheel actually move. It ensures content generation, page updates, signal collection, anomaly alerts, and optimization suggestions happen on rhythm instead of relying on human memory.",
    },
    accent: "#B592FF",
    glow: "rgba(181, 146, 255, 0.2)",
    icon: Workflow,
    outputLabel: {
      zh: "智能执行中枢输出",
      en: "Orchestration Outputs",
    },
    outputs: [
      {
        zh: "自动化工作流",
        en: "Automation workflows",
      },
      {
        zh: "触发规则",
        en: "Trigger logic",
      },
      {
        zh: "多角色协作编排",
        en: "Multi-role coordination",
      },
    ],
    signals: [
      {
        zh: "发布节奏",
        en: "Publishing cadence",
      },
      {
        zh: "任务回写",
        en: "Task write-back",
      },
      {
        zh: "异常触发",
        en: "Exception triggers",
      },
      {
        zh: "优化优先级",
        en: "Optimization priority",
      },
    ],
    metrics: [
      { label: { zh: "自动执行率", en: "Automation Rate" }, value: "79%" },
      { label: { zh: "优化节拍", en: "Optimization Rhythm" }, value: "Weekly" },
      { label: { zh: "人效提升", en: "Team Leverage" }, value: "4.6x" },
    ],
    integrationTitle: {
      zh: "智能执行中枢连接点",
      en: "Orchestration Integrations",
    },
    integrations: [
      {
        zh: "内容发布与站点更新流程",
        en: "Content publishing and page update workflows",
      },
      {
        zh: "表单线索到 CRM 的自动回写",
        en: "Automatic form-to-CRM handoff",
      },
      {
        zh: "监测异常后的自动任务派发",
        en: "Automatic task creation after monitoring anomalies",
      },
    ],
    nextStep: {
      zh: "智能执行中枢会让飞轮持续转下去，而不是停在建议层。",
      en: "Orchestration keeps the flywheel moving instead of stopping at recommendations.",
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
    token: "ILS",
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

const scenarioCards: ScenarioCard[] = [
  {
    title: { zh: "AI 搜索与问答里品牌不够可见", en: "Brand visibility is weak in AI search and answer experiences" },
    description: {
      zh: "官网有内容，但结构和表达不适合被 AI 抽取、引用和采信，品牌在高意图问题里很难被看见。",
      en: "The site has content, but its structure and expression are weak for AI retrieval, citation, and trust in high-intent question scenarios.",
    },
    icon: Globe2,
    accent: "#5AE4FF",
    glow: "rgba(90, 228, 255, 0.24)",
  },
  {
    title: { zh: "内容产能不稳定，难以持续覆盖问题场景", en: "Content production is inconsistent and cannot keep up with demand" },
    description: {
      zh: "专题页、问答页、案例和行业内容依赖人工堆叠，更新慢，难以形成持续扩张的内容系统。",
      en: "Landing pages, Q&A content, case studies, and industry insight rely on manual effort and fail to scale into a durable publishing system.",
    },
    icon: FileSearch,
    accent: "#A1F56A",
    glow: "rgba(161, 245, 106, 0.22)",
  },
  {
    title: { zh: "官网承接弱，访客难以理解和转化", en: "The website cannot clearly capture intent or convert visitors" },
    description: {
      zh: "页面层级、信任表达和 CTA 路径不清晰，访客虽然来了，却不知道下一步，也难以快速建立信任。",
      en: "Page hierarchy, trust signals, and CTA paths are unclear, so visitors arrive but fail to understand the next step or trust the offer quickly.",
    },
    icon: Sparkles,
    accent: "#F3C56B",
    glow: "rgba(243, 197, 107, 0.22)",
  },
  {
    title: { zh: "线索承接分散，销售跟进缺少闭环", en: "Lead handling is fragmented and follow-up lacks a closed loop" },
    description: {
      zh: "咨询入口、表单、标签和分发逻辑没有连起来，导致高意图线索无法被快速识别、路由和跟进。",
      en: "Consultation entry points, forms, tags, and routing are disconnected, so high-intent leads are not captured, routed, or followed up quickly.",
    },
    icon: Database,
    accent: "#7CB6FF",
    glow: "rgba(124, 182, 255, 0.22)",
  },
  {
    title: { zh: "看不清 AI 推荐带来的结果与质量", en: "Recommendation impact and quality are hard to evaluate" },
    description: {
      zh: "企业知道流量在变，但不知道 AI 为什么推荐、哪些内容在推动商机，以及该如何持续优化。",
      en: "The company sees changing traffic but lacks visibility into why AI recommends it, which assets create opportunities, and how to improve systematically.",
    },
    icon: Radar,
    accent: "#FF8C8C",
    glow: "rgba(255, 140, 140, 0.22)",
  },
];

const capabilityLayers: LocalizedText[] = [
  { zh: "可见性层", en: "Visibility Layer" },
  { zh: "生产层", en: "Production Layer" },
  { zh: "承接层", en: "Conversion Layer" },
  { zh: "转化层", en: "Lead Layer" },
  { zh: "判断层", en: "Decision Layer" },
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

const brandCopy = {
  heroTag: { zh: "AI时代企业增长系统", en: "Enterprise growth system for the AI era" },
  heroTitle: { zh: "帮助企业构建 AI 时代的增长飞轮", en: "Helping enterprises build AI growth flywheels in the AI era" },
  heroBody: {
    zh: "帮助企业把AI可见性、内容、官网、获客与推荐判断连成一个真正可运转的增长系统。",
    en: "JGMAO AI Growth Engine combines five parts: GEO optimization, an AI content factory, an AI growth website, an intelligent lead system, and AI recommendation analytics to connect visibility, content, conversion, and feedback into one operating system.",
  },
  architectureTag: { zh: "Core Scenarios", en: "Core Scenarios" },
  architectureTitle: { zh: "核心场景：适用问题", en: "Core scenarios: where this system fits" },
  architectureBody: {
    zh: "如果企业正在面临 AI 可见性不足、内容生产不稳定、官网承接弱、线索闭环断裂，或者看不清推荐结果质量，这一套增长系统才真正有价值。",
    en: "This system is most useful when enterprises face weak AI visibility, inconsistent content production, poor website conversion, fragmented lead handling, or weak recommendation insight.",
  },
  flywheelDemoTag: { zh: "Interactive Flywheel", en: "Interactive Flywheel" },
  flywheelDemoTitle: { zh: "JGMAO增长飞轮", en: "Use one interactive growth flywheel to explain all five JGMAO modules clearly" },
  flywheelDemoBody: {
    zh: "每一环都不是单点能力，而是在驱动下一环节，持续提升业务的获客效率与转化能力。",
    en: "Click any module or let the wheel autoplay. Each layer fuels the next so the website keeps becoming more discoverable, more measurable, and more trusted.",
  },
  flywheelDemoDetailButton: { zh: "查看独立详情", en: "Open Module Detail" },
  flywheelDemoWhyTag: { zh: "为什么是增长飞轮", en: "Why a Flywheel" },
  flywheelDemoWhyTitle: { zh: "每一环都在放大下一环的结果", en: "Each layer amplifies the next" },
  flywheelDemoGrowthLoopLabel: { zh: "AI 增长飞轮", en: "AI Growth Loop" },
  flywheelDemoActiveModule: { zh: "当前模块", en: "Active Module" },
  flywheelDemoModalLabel: { zh: "模块详情", en: "Module Detail" },
  moduleTag: { zh: "Interactive Engine Map", en: "Interactive Engine Map" },
  moduleTitle: { zh: "五大引擎：核心能力", en: "The five engines are not isolated products. They form one coordinated growth system." },
  moduleBody: {
    zh: "每个引擎都能独立发挥作用，彼此协同后形成完整的 AI 增长飞轮。",
    en: "Click any engine to see how it contributes to site-wide GEO, content, conversion, and recommendation intelligence. Each part can work alone, but together they create a complete AI growth engine.",
  },
  detailButton: { zh: "查看引擎详情", en: "Open Engine Detail" },
  geoTag: { zh: "GEO Capability Card", en: "GEO Capability Card" },
  geoTitle: { zh: "整站 GEO 能力卡", en: "Site-wide GEO Capability Card" },
  geoBody: {
    zh: "把结构、内容与转化承接放在同一套设计里，让网站更容易被 AI 理解、引用，并持续带来可验证的增长结果。",
    en: "We treat GEO as a full-site structural layer. Heading hierarchy, FAQ design, answer blocks, proof-heavy case studies, CTA paths, and lead write-back are optimized together so AI systems can understand the site and buyers can convert more easily.",
  },
  casesTag: { zh: "Case Proof", en: "Case Proof" },
  casesTitle: { zh: "增长飞轮案例", en: "Growth Flywheel Cases" },
  casesBody: {
    zh: "让内容、流量、线索、AI 推荐与转化形成联动，驱动持续运转的增长飞轮。",
    en: "A website becomes a growth asset when all five engines work together.",
  },
  faqTag: { zh: "FAQ", en: "FAQ" },
  faqTitle: { zh: "FAQ", en: "FAQ" },
  faqBody: {
    zh: "这些常见问题帮助你更好了解坚果猫JGMAO。",
    en: "These answers are written for both buyers and AI systems. They make it easier to understand JGMAO’s structure, value, and use cases.",
  },
  insightsTag: { zh: "新闻 / 洞察", en: "News / Insights" },
  insightsTitle: { zh: "新闻 / 洞察", en: "News / Insights" },
  insightsBody: {
    zh: "这里会持续沉淀坚果猫的最新动态、AI 增长方法、GEO 观察和案例延展内容。",
    en: "This section collects the latest JianGuoMao updates, AI growth methods, GEO observations, and case extensions.",
  },
  contactTag: { zh: "关于我们", en: "About Us" },
  contactTitle: { zh: "关于我们", en: "About JianGuoMao" },
  contactBody: {
    zh: "欢迎交流 GEO、AI 增长网站、内容增长与企业增长飞轮相关合作。",
    en: "Talk with us about GEO, AI growth websites, content systems, and enterprise growth flywheels.",
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

const topQuickFacts: LocalizedText[] = [];

function t(copy: LocalizedText, locale: Locale) {
  return copy[locale];
}

function renderInlineFormattedText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/);
    if (match) {
      return (
        <strong key={`strong-${index}`} className="font-semibold text-white">
          {match[1]}
        </strong>
      );
    }

    return <span key={`span-${index}`}>{part}</span>;
  });
}

function renderChatMessageContent(text: string): ReactNode[] {
  const lines = text.split(/\r?\n/);
  const nodes: ReactNode[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line === "---") {
      nodes.push(<div key={`divider-${index}`} className="my-2 border-t border-white/10" />);
      continue;
    }

    if (line.startsWith("### ")) {
      nodes.push(
        <h4 key={`h3-${index}`} className="mt-2 text-sm font-semibold text-white">
          {renderInlineFormattedText(line.slice(4))}
        </h4>,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <h3 key={`h2-${index}`} className="mt-2 text-sm font-semibold text-white">
          {renderInlineFormattedText(line.slice(3))}
        </h3>,
      );
      continue;
    }

    if (line.startsWith("# ")) {
      nodes.push(
        <h2 key={`h1-${index}`} className="mt-2 text-base font-semibold text-white">
          {renderInlineFormattedText(line.slice(2))}
        </h2>,
      );
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [line.slice(2)];

      while (index + 1 < lines.length && lines[index + 1].trim().startsWith("- ")) {
        index += 1;
        items.push(lines[index].trim().slice(2));
      }

      nodes.push(
        <ul key={`ul-${index}`} className="space-y-1.5 pl-5 text-sm leading-7">
          {items.map((item, itemIndex) => (
            <li key={`li-${index}-${itemIndex}`} className="list-disc text-slate-100">
              {renderInlineFormattedText(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    nodes.push(
      <p key={`p-${index}`} className="text-sm leading-7 text-inherit">
        {renderInlineFormattedText(line)}
      </p>,
    );
  }

  return nodes;
}

function createChatMessageId(prefix: string) {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readStreamingChatResponse(
  response: Response,
  onEvent: (event: { type: string; delta?: string; reply?: string; error?: string; message?: string }) => void,
) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming response body was unavailable.");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }

      const parsed = JSON.parse(line) as { type: string; delta?: string; reply?: string; error?: string; message?: string };
      onEvent(parsed);
    }
  }

  const trailing = buffer.trim();
  if (trailing) {
    const parsed = JSON.parse(trailing) as { type: string; delta?: string; reply?: string; error?: string; message?: string };
    onEvent(parsed);
  }
}

function displayFlywheelName(module: FlywheelModule, locale: Locale) {
  return module.name;
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

function parseAnimatedStat(value: string) {
  const match = value.match(/^([^\d-]*)(\d+(?:\.\d+)?)(.*)$/);

  if (!match) {
    return { prefix: "", number: 0, suffix: value, decimals: 0 };
  }

  const [, prefix, rawNumber, suffix] = match;
  const decimals = rawNumber.includes(".") ? rawNumber.split(".")[1]?.length ?? 0 : 0;

  return {
    prefix,
    number: Number(rawNumber),
    suffix,
    decimals,
  };
}

function AnimatedStatValue({ value, delay = 0 }: { value: string; delay?: number }) {
  const parsed = parseAnimatedStat(value);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!parsed.number) {
      return undefined;
    }

    let frameId = 0;
    let timeoutId = 0;
    const duration = 950;

    const startAnimation = () => {
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - progress) * (1 - progress);
        setDisplayValue(parsed.number * eased);

        if (progress < 1) {
          frameId = window.requestAnimationFrame(tick);
        }
      };

      frameId = window.requestAnimationFrame(tick);
    };

    timeoutId = window.setTimeout(startAnimation, delay);

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(frameId);
    };
  }, [delay, parsed.number]);

  const formatted = parsed.decimals > 0 ? displayValue.toFixed(parsed.decimals) : Math.round(displayValue).toString();

  return (
    <span className="inline-block">
      {parsed.prefix}
      {formatted}
      {parsed.suffix}
    </span>
  );
}

function BrandMark() {
  return (
    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#1f1d1d] shadow-[0_0_30px_rgba(245,197,92,0.12)]">
      <img src={logoImage} alt="坚果猫 Logo" className="h-full w-full object-cover" />
    </div>
  );
}

function FlywheelDemoNode({
  module,
  index,
  position,
  isActive,
  onActivate,
}: {
  module: FlywheelModule;
  index: number;
  position: OrbitPosition;
  isActive: boolean;
  onActivate: (index: number) => void;
}) {
  const Icon = module.icon;

  return (
    <motion.button
      type="button"
      onMouseEnter={() => onActivate(index)}
      onFocus={() => onActivate(index)}
      onClick={() => onActivate(index)}
      className={cn(
        "absolute z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[1.35rem] border text-center backdrop-blur transition-all duration-300 sm:h-20 sm:w-20 md:h-28 md:w-28 md:rounded-[1.8rem]",
        isActive ? "scale-105 border-white/35 bg-slate-950/80" : "border-white/10 bg-slate-950/45 hover:border-white/20 hover:bg-slate-950/60",
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        boxShadow: isActive ? `0 0 0 1px ${module.accent} inset, 0 0 36px ${module.glow}` : undefined,
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      aria-pressed={isActive}
      aria-label={displayFlywheelName(module, "zh")}
    >
      <div
        className="flex h-7 w-7 items-center justify-center rounded-xl border sm:h-8 sm:w-8 md:h-10 md:w-10 md:rounded-2xl"
        style={{
          backgroundColor: module.glow,
          borderColor: isActive ? module.accent : "rgba(255,255,255,0.12)",
          color: module.accent,
        }}
      >
        <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
      </div>
      <span className="mt-1.5 text-sm font-semibold tracking-[0.16em] sm:text-base md:mt-2 md:text-lg md:tracking-[0.18em]" style={{ color: isActive ? module.accent : "#F5F7FB" }}>
        {module.letter}
      </span>
      <span className="hidden text-[11px] uppercase tracking-[0.2em] text-slate-300 md:block">{displayFlywheelName(module, "zh")}</span>
    </motion.button>
  );
}

function Home() {
  const [locale, setLocale] = useState<Locale>("zh");
  const [activeIndex, setActiveIndex] = useState(0);
  const [flywheelDemoActiveIndex, setFlywheelDemoActiveIndex] = useState(0);
  const [flywheelDemoPaused, setFlywheelDemoPaused] = useState(false);
  const [moduleTab, setModuleTab] = useState<"overview" | "outputs" | "integrations">("overview");
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCaseIndex, setActiveCaseIndex] = useState<number | null>(null);
  const [activeInsightIndex, setActiveInsightIndex] = useState<number | null>(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [showMobileModuleDetail, setShowMobileModuleDetail] = useState(false);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number | null>(null);
  const [floatingNavOpen, setFloatingNavOpen] = useState(false);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [flywheelDemoDetailIndex, setFlywheelDemoDetailIndex] = useState<number | null>(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState("");
  const [chatSessionId] = useState(() => {
    if (typeof window === "undefined") {
      return "jgmao-web-local";
    }

    return `jgmao-web-${window.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
  });
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; role: "user" | "assistant"; text: string }>>([]);

  const activeCapability = capabilities[activeIndex];
  const detailCapability = detailIndex === null ? null : capabilities[detailIndex];
  const activeFlywheelModule = flywheelModules[flywheelDemoActiveIndex];
  const detailFlywheelModule = flywheelDemoDetailIndex === null ? null : flywheelModules[flywheelDemoDetailIndex];
  const insightItems = getPublishedInsights().slice(0, 3);
  const faqItems = getPublishedFaqs();
  const isLocalPreview =
    typeof window !== "undefined" && ["127.0.0.1", "localhost"].includes(window.location.hostname);
  const mobileAccordionHint =
    locale === "zh" ? "点击卡片展开查看详情，再次点击即可收起。" : "Tap a card to expand details. Tap again to collapse.";
  const mobileFaqHint =
    locale === "zh" ? "点击问题展开查看回答，再次点击即可收起。" : "Tap a question to expand the answer. Tap again to collapse.";
  const configuredChatEndpoint =
    typeof import.meta !== "undefined" && typeof import.meta.env?.VITE_CHAT_ENDPOINT === "string"
      ? import.meta.env.VITE_CHAT_ENDPOINT.trim()
      : "";
  const chatEndpoint = configuredChatEndpoint || (isLocalPreview ? "/local-chat/message" : "/api/chat/send");

  function formatChatErrorMessage(messageText: string) {
    if (locale !== "zh") {
      return messageText;
    }

    const normalized = messageText.toLowerCase();

    if (normalized.includes("timed out")) {
      return "这次回复超时了。你可以直接重试，或者先换一个更短的问题。";
    }

    if (normalized.includes("502")) {
      return "模型服务暂时不可用。建议稍后重试一次。";
    }

    if (normalized.includes("session is busy") || normalized.includes("session file locked")) {
      return "智能体当前正在处理其他请求，请稍后再试。";
    }

    if (normalized.includes("failed to fetch") || normalized.includes("fetch failed")) {
      return "智能体连接失败，请检查本机 bridge、Tailscale 或网络状态。";
    }

    return messageText;
  }

  async function sendChatMessage(message: string, options?: { retry?: boolean }) {
    const trimmed = message.trim();
    if (!trimmed || chatLoading) {
      return;
    }

    const assistantMessageId = createChatMessageId("assistant");
    if (options?.retry) {
      setChatMessages((current) => [
        ...current,
        {
          id: assistantMessageId,
          role: "assistant",
          text: locale === "zh" ? "我再试一次，这次会尽量更快返回。" : "Retrying now. I’ll try to return faster this time.",
        },
      ]);
    } else {
      setChatMessages((current) => [
        ...current,
        { id: createChatMessageId("user"), role: "user", text: trimmed },
        {
          id: assistantMessageId,
          role: "assistant",
          text: locale === "zh" ? "正在整理回答..." : "Preparing the reply...",
        },
      ]);
    }

    if (!options?.retry) {
      setChatInput("");
    }
    setChatLoading(true);
    setChatError(null);
    setLastFailedMessage(trimmed);

    try {
      const response = await fetch(chatEndpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/x-ndjson, application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          sessionId: chatSessionId,
          stream: true,
        }),
      });
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/x-ndjson")) {
        let streamedReply = "";

        await readStreamingChatResponse(response, (event) => {
          if (event.type === "status" && typeof event.message === "string") {
            setChatMessages((current) =>
              current.map((item) => (item.id === assistantMessageId ? { ...item, text: event.message || item.text } : item)),
            );
            return;
          }

          if (event.type === "delta" && event.delta) {
            streamedReply += event.delta;
            setChatMessages((current) =>
              current.map((item) => (item.id === assistantMessageId ? { ...item, text: streamedReply } : item)),
            );
            return;
          }

          if (event.type === "done") {
            const finalReply = typeof event.reply === "string" && event.reply.trim()
              ? event.reply.trim()
              : streamedReply.trim();
            setChatMessages((current) =>
              current.map((item) =>
                item.id === assistantMessageId
                  ? {
                      ...item,
                      text: finalReply || (locale === "zh" ? "已收到，我继续帮你整理。" : "Got it. Let me help from here."),
                    }
                  : item,
              ),
            );
            return;
          }

          if (event.type === "error") {
            throw new Error(event.error || "Chat stream failed");
          }
        });
      } else {
        const payload = await response.json();
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || "Chat request failed");
        }

        setChatMessages((current) =>
          current.map((item) =>
            item.id === assistantMessageId
              ? {
                  ...item,
                  text:
                    typeof payload.reply === "string" && payload.reply.trim()
                      ? payload.reply.trim()
                      : locale === "zh"
                        ? "已收到，我继续帮你整理。"
                        : "Got it. Let me help from here.",
                }
              : item,
          ),
        );
      }
    } catch (error) {
      const messageText = error instanceof Error ? error.message : String(error);
      setChatError(formatChatErrorMessage(messageText));
      setChatMessages((current) =>
        current.map((item) =>
          item.id === assistantMessageId
            ? {
                ...item,
                text:
                  locale === "zh"
                    ? "我先记下你的问题了，但这次返回失败了。你可以点击重试，或者先换一个更短的问题继续问我。"
                    : "I captured your request, but this reply failed. You can retry it, or try a shorter question first.",
              }
            : item,
        ),
      );
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
    setModuleTab("overview");
  }, [activeIndex]);

  useEffect(() => {
    setChatMessages([
      {
        id: createChatMessageId("assistant"),
        role: "assistant",
        text:
          locale === "zh"
            ? "你好，我是坚果猫AI智能体。直接告诉我公司、官网地址，或者当前最想提升的增长问题就可以。"
            : "Hi, I’m the JianGuoMao AI agent. Share your company, website, or main growth issue to get started.",
      },
    ]);
    setChatInput("");
    setChatError(null);
    setChatLoading(false);
  }, [locale]);

  useEffect(() => {
    if (flywheelDemoPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      startTransition(() => {
        setFlywheelDemoActiveIndex((current) => (current + 1) % flywheelModules.length);
      });
    }, 3600);

    return () => window.clearInterval(timer);
  }, [flywheelDemoPaused]);

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
      ? "坚果猫 JGMAO AI 增长引擎 | GEO优化引擎 | AI内容工厂 | AI增长网站 | 智能获客系统 | AI推荐分析"
      : "JGMAO AI Growth Engine | GEO | AI Content Factory | AI Growth Website | Lead System | Recommendation Analytics";
    const description = locale === "zh"
      ? "坚果猫 JGMAO AI 增长引擎帮助企业在 AI 时代构建 AI 增长飞轮，包含 GEO 优化引擎、AI 内容工厂、AI 增长网站、智能获客系统和 AI推荐分析五大部分。"
      : "JGMAO AI Growth Engine helps enterprises build AI growth flywheels through GEO optimization, AI content production, AI growth websites, intelligent lead systems, and recommendation analytics.";
    const keywords = locale === "zh"
      ? "坚果猫, JGMAO, 坚果猫 JGMAO, AI增长引擎, GEO优化引擎, AI内容工厂, AI增长网站, 智能获客系统, AI推荐分析, GEO优化, AI搜索优化"
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

    const organizationName = locale === "zh" ? "坚果猫 JGMAO AI 增长引擎" : "JGMAO AI Growth Engine";
    const alternateBrandName = locale === "zh" ? "JGMAO" : "坚果猫";
    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: organizationName,
        alternateName: alternateBrandName,
        url: siteUrl,
        logo: new URL(logoImage, window.location.origin).href,
        description,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: organizationName,
        alternateName: alternateBrandName,
        url: siteUrl,
        description,
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: locale === "zh" ? "坚果猫 JGMAO 五大引擎" : "JGMAO Five Engines",
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
    if (detailIndex === null && flywheelDemoDetailIndex === null && !chatModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDetailIndex(null);
        setFlywheelDemoDetailIndex(null);
        setChatModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chatModalOpen, detailIndex, flywheelDemoDetailIndex]);

  return (
    <main id="top" className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(82,230,255,0.14),transparent_24%),radial-gradient(circle_at_90%_18%,rgba(245,197,92,0.12),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(181,146,255,0.12),transparent_28%),linear-gradient(180deg,#050816_0%,#091222_38%,#050816_100%)]" />
      <div className="pointer-events-none absolute inset-0 ops-grid opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,8,22,0.18)_58%,rgba(5,8,22,0.94)_100%)]" />

      <div className="fixed bottom-5 right-4 z-40 md:hidden">
        <AnimatePresence>
          {floatingNavOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="mb-3 w-[11.5rem] rounded-[1.4rem] border border-white/10 bg-slate-950/88 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl"
            >
              <a
                href="#top"
                onClick={() => {
                  setActiveSection("");
                  setFloatingNavOpen(false);
                }}
                className="flex items-center justify-between rounded-[1rem] px-3 py-3 text-sm text-white transition hover:bg-white/6"
              >
                <span>{locale === "zh" ? "首页" : "Home"}</span>
                <MoveUpRight className="h-4 w-4 -rotate-45 text-slate-300" />
              </a>
              <div className="mt-1 space-y-1">
                {navItems.map((item) => {
                  const sectionId = item.href.replace("#", "");
                  const isActive = activeSection === sectionId;

                  return (
                    <a
                      key={`floating-${item.href}`}
                      href={item.href}
                      onClick={() => setFloatingNavOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-[1rem] px-3 py-3 text-sm transition",
                        isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/6 hover:text-white",
                      )}
                    >
                      <span>{t(item.label, locale)}</span>
                      <ArrowRight className="h-4 w-4 opacity-60" />
                    </a>
                  );
                })}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setFloatingNavOpen((current) => !current)}
          className="group flex items-center justify-center rounded-full border border-white/10 bg-slate-950/72 p-1.5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:border-cyan-200/30 hover:bg-slate-900/80"
          aria-label={floatingNavOpen ? (locale === "zh" ? "关闭导航" : "Close navigation") : (locale === "zh" ? "打开导航" : "Open navigation")}
          aria-expanded={floatingNavOpen}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition group-hover:border-cyan-200/30 group-hover:bg-cyan-300/10">
            {floatingNavOpen
              ? <X className="h-4 w-4 transition group-hover:text-cyan-100" />
              : <MoveUpRight className="h-4 w-4 -rotate-45 transition group-hover:-translate-y-0.5 group-hover:text-cyan-100" />}
          </span>
        </button>
      </div>

      <a
        href="#top"
        onClick={() => setActiveSection("")}
        className="group fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-950/72 p-1.5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:border-cyan-200/30 hover:bg-slate-900/80 md:flex"
        aria-label={locale === "zh" ? "回到首页" : "Back to top"}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition group-hover:border-cyan-200/30 group-hover:bg-cyan-300/10">
          <MoveUpRight className="h-4 w-4 -rotate-45 transition group-hover:-translate-y-0.5 group-hover:text-cyan-100" />
        </span>
      </a>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 pb-0 pt-6 sm:px-6 lg:px-10">
        <header className="sticky top-4 z-40 mb-10 rounded-[1.6rem] border border-white/10 bg-slate-950/55 px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <a href="#top" onClick={() => setActiveSection("")} className="flex items-center gap-[14px]">
              <BrandMark />
              <div>
                <p
                  className="text-[1.16rem] font-semibold leading-none text-cyan-50/95 sm:text-[1.2rem]"
                  style={{ fontFamily: '"Sora", "IBM Plex Sans", sans-serif', letterSpacing: "0.03em" }}
                >
                  {locale === "zh" ? "坚果猫" : "JGMAO"}
                </p>
                <p
                  className="mt-[1px] text-[0.69rem] font-medium tracking-[0.24em] text-white/52 sm:text-[0.71rem]"
                  style={{ fontFamily: '"Sora", "IBM Plex Sans", sans-serif' }}
                >
                  {locale === "zh" ? "JGMAO AI增长引擎" : "AI GROWTH ENGINE"}
                </p>
              </div>
            </a>

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
              className="mt-5 max-w-4xl text-[2.85rem] font-semibold tracking-tight text-white sm:text-[3.55rem] lg:text-[4.45rem] lg:leading-[1.03]"
            >
              {locale === "zh" ? (
                <>
                  帮助企业构建
                  <br />
                  <span className="bg-gradient-to-r from-cyan-200 via-amber-100 to-violet-200 bg-clip-text text-transparent">AI 时代的增长飞轮</span>
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
              {heroStats.map((item, index) => (
                <article key={item.label.en} className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t(item.label, locale)}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                    <AnimatedStatValue value={item.value} delay={index * 120} />
                  </p>
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
                <motion.div
                  key={`loop-status-${flywheelDemoActiveIndex}`}
                  initial={{ scale: 0.985, opacity: 0.92, boxShadow: "0 0 0 rgba(16,185,129,0)" }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    boxShadow: [
                      "0 0 0 rgba(16,185,129,0)",
                      "0 0 24px rgba(52,211,153,0.22)",
                      "0 0 10px rgba(52,211,153,0.1)",
                    ],
                  }}
                  transition={{ duration: 0.72, times: [0, 0.4, 1], ease: "easeOut" }}
                  className="status-badge-live rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-emerald-100"
                >
                  <span className="status-badge-dot" aria-hidden="true" />
                  {locale === "zh" ? "飞轮运行中" : "Loop Active"}
                </motion.div>
              </div>

              <div className="snapshot-layer-group mt-5">
                <div className="snapshot-flow-line" aria-hidden="true">
                  <span className="snapshot-flow-dot" />
                </div>
                <div className="space-y-4">
                  {snapshotLayers.map((row, index) => {
                    const Icon = row.icon;

                    return (
                      <motion.div
                        key={row.label.en}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.45 }}
                        transition={{ duration: 0.42, delay: index * 0.1 }}
                        className="snapshot-layer-card relative rounded-[1.4rem] border border-white/10 bg-white/6 p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="snapshot-layer-icon rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-cyan-100"
                            style={
                              {
                                "--snapshot-accent": row.accent,
                                "--snapshot-glow": row.glow,
                              } as CSSProperties
                            }
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(row.label, locale)}</p>
                            <p className="mt-2 text-sm leading-7 text-white">{t(row.value, locale)}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
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

        <section id="flywheel-demo" className="grid gap-8 py-14 lg:grid-cols-[1.08fr_0.92fr]">
          <div
            className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-slate-950/50 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.32)] backdrop-blur-xl"
            onMouseEnter={() => setFlywheelDemoPaused(true)}
            onMouseLeave={() => setFlywheelDemoPaused(false)}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(82,230,255,0.12),transparent_30%),radial-gradient(circle_at_bottom,rgba(245,197,92,0.10),transparent_28%)]" />
            <div className="relative">
              <SectionTag>{t(brandCopy.flywheelDemoTag, locale)}</SectionTag>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.6rem]">{t(brandCopy.flywheelDemoTitle, locale)}</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">{t(brandCopy.flywheelDemoBody, locale)}</p>

              <div className="relative mx-auto mt-8 aspect-square w-full max-w-[352px] sm:max-w-[440px] md:max-w-[520px] lg:max-w-[640px]">
                <div className="flywheel-ring absolute inset-[10%] rounded-full border border-white/10 opacity-80" />
                <div className="flywheel-ring-reverse absolute inset-[18%] rounded-full border border-dashed border-white/10 opacity-80" />
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(82,230,255,0.08),transparent_38%),radial-gradient(circle_at_center,rgba(245,197,92,0.06),transparent_60%)]" />

                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                  <circle cx="50" cy="50" r="35" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" fill="none" />
                  <circle cx="50" cy="50" r="22" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" fill="none" />
                  {orbitPositions.map((position, index) => {
                    const module = flywheelModules[index];
                    const isActive = index === flywheelDemoActiveIndex;

                    return (
                      <g key={module.id}>
                        <line
                          x1="50"
                          y1="50"
                          x2={position.x}
                          y2={position.y}
                          stroke={isActive ? module.accent : "rgba(255,255,255,0.12)"}
                          strokeWidth={isActive ? 1.4 : 0.7}
                          strokeDasharray={isActive ? "0" : "3 3"}
                          opacity={isActive ? 0.9 : 0.55}
                        />
                        <circle cx={position.x} cy={position.y} r="1.8" fill={isActive ? module.accent : "rgba(255,255,255,0.35)"} />
                      </g>
                    );
                  })}
                </svg>

                {flywheelModules.map((module, index) => (
                  <FlywheelDemoNode
                    key={module.id}
                    module={module}
                    index={index}
                    position={orbitPositions[index]}
                    isActive={index === flywheelDemoActiveIndex}
                    onActivate={(nextIndex) => {
                      setFlywheelDemoActiveIndex(nextIndex);
                      setFlywheelDemoPaused(true);
                    }}
                  />
                ))}

                <motion.div
                  className="absolute left-1/2 top-1/2 z-10 flex h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/12 bg-slate-950/80 px-2 text-center shadow-[0_0_80px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:h-[36%] sm:w-[36%] md:h-[38%] md:w-[38%]"
                  animate={{ boxShadow: [`0 0 40px ${activeFlywheelModule.glow}`, `0 0 72px ${activeFlywheelModule.glow}`, `0 0 40px ${activeFlywheelModule.glow}`] }}
                  transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border text-base font-semibold sm:h-12 sm:w-12 sm:text-lg md:h-14 md:w-14 md:text-xl"
                    style={{ borderColor: activeFlywheelModule.accent, color: activeFlywheelModule.accent, backgroundColor: activeFlywheelModule.glow }}
                  >
                    {activeFlywheelModule.letter}
                  </div>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:mt-3 sm:text-xs sm:tracking-[0.24em] md:mt-4 md:tracking-[0.28em]">{t(brandCopy.flywheelDemoGrowthLoopLabel, locale)}</p>
                  <p className="mt-1 text-sm font-semibold text-white sm:mt-1.5 sm:text-lg md:mt-2 md:text-2xl">{displayFlywheelName(activeFlywheelModule, locale)}</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-300 sm:text-xs md:hidden">{t(activeFlywheelModule.compactTitle, locale)}</p>
                  <p className="mt-1 hidden max-w-[16rem] text-sm leading-6 text-slate-300 md:block">{t(activeFlywheelModule.title, locale)}</p>
                </motion.div>
              </div>

              <div className="mt-8 -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0 sm:pb-0">
                {flywheelModules.map((module, index) => (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => {
                      setFlywheelDemoActiveIndex(index);
                      setFlywheelDemoPaused(true);
                    }}
                    className={cn(
                      "min-w-[7.5rem] shrink-0 rounded-2xl border px-3 py-3 text-left transition sm:min-w-0",
                      index === flywheelDemoActiveIndex ? "bg-white/10 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/8",
                    )}
                    style={{ borderColor: index === flywheelDemoActiveIndex ? module.accent : undefined }}
                  >
                    <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: index === flywheelDemoActiveIndex ? module.accent : undefined }}>
                      {module.letter}
                    </p>
                    <p className="mt-2 text-sm font-medium">{displayFlywheelName(module, locale)}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <AnimatePresence mode="wait">
              <motion.article
                key={`${activeFlywheelModule.id}-${locale}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-400">{t(activeFlywheelModule.outputLabel, locale)}</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                      {displayFlywheelName(activeFlywheelModule, locale)}
                      <span className="ml-3 text-lg font-medium text-slate-400">{t(activeFlywheelModule.title, locale)}</span>
                    </h3>
                  </div>
                  <div
                    className="rounded-[1.4rem] border px-4 py-3 text-right"
                    style={{ borderColor: activeFlywheelModule.accent, backgroundColor: activeFlywheelModule.glow }}
                  >
                    <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.12em] sm:text-xs sm:tracking-[0.18em]" style={{ color: activeFlywheelModule.accent }}>
                      {t(brandCopy.flywheelDemoActiveModule, locale)}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-white">{activeFlywheelModule.letter}</p>
                  </div>
                </div>

                <p className="mt-5 text-base leading-8 text-slate-300">{t(activeFlywheelModule.description, locale)}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {activeFlywheelModule.metrics.map((metric) => (
                    <div key={metric.label.en} className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(metric.label, locale)}</p>
                      <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(activeFlywheelModule.outputLabel, locale)}</p>
                    <div className="mt-4 space-y-3">
                      {activeFlywheelModule.outputs.map((item) => (
                        <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                          {t(item, locale)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(activeFlywheelModule.integrationTitle, locale)}</p>
                    <div className="mt-4 space-y-3">
                      {activeFlywheelModule.integrations.map((item) => (
                        <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                          {t(item, locale)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xl text-sm leading-7 text-slate-300">{t(activeFlywheelModule.nextStep, locale)}</p>
                  <button
                    type="button"
                    onClick={() => setFlywheelDemoDetailIndex(flywheelDemoActiveIndex)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/8"
                  >
                    {t(brandCopy.flywheelDemoDetailButton, locale)}
                    <MoveUpRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.article>
            </AnimatePresence>

            <article className="rounded-[1.85rem] border border-white/8 bg-slate-950/40 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t(brandCopy.flywheelDemoWhyTag, locale)}</p>
              <p className="mt-2.5 text-lg font-semibold text-white">{t(brandCopy.flywheelDemoWhyTitle, locale)}</p>
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                {(locale === "zh"
                  ? ["可见性", "内容", "官网", "获客", "推荐决策"]
                  : ["Visibility", "Content", "Website", "Leads", "Recommendation"]
                ).map((item, index, items) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200">
                      {item}
                    </span>
                    {index < items.length - 1 ? (
                      <span
                        className="flywheel-why-connector"
                        style={{ "--flow-delay": `${index * 0.36}s` } as CSSProperties}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </article>

          </div>
        </section>

        <section id="architecture" className="grid gap-6 py-14 lg:grid-cols-[0.88fr_1.12fr]">
          <article className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
            <SectionTag>{t(brandCopy.architectureTag, locale)}</SectionTag>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.5rem]">{t(brandCopy.architectureTitle, locale)}</h2>
            <p className="mt-4 text-base leading-8 text-slate-300">{t(brandCopy.architectureBody, locale)}</p>

            <div className="mt-8 rounded-[1.8rem] border border-cyan-300/15 bg-cyan-300/8 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/80">{locale === "zh" ? "典型问题" : "Typical Challenges"}</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">{locale === "zh" ? "这类企业最常见的增长断点" : "The most common growth breakpoints"}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-200">
                {locale === "zh"
                  ? "品牌能做内容，但不一定能被 AI 看见；有流量，也不一定能形成线索；有推荐，也不一定知道结果为什么好或不好。"
                  : "Many teams can publish content, but not all of it becomes visible to AI, converts visitors, or turns recommendations into measurable pipeline."}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300 md:hidden">{mobileAccordionHint}</p>
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {scenarioCards.map((scenario, index) => {
              const Icon = scenario.icon;
              const isExpanded = activeScenarioIndex === index;

              return (
                <motion.article
                  key={scenario.title.en}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.2)] backdrop-blur"
                >
                  <button
                    type="button"
                    onClick={() => setActiveScenarioIndex((current) => (current === index ? null : index))}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border" style={{ borderColor: `${scenario.accent}88`, backgroundColor: scenario.glow, color: scenario.accent }}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? `场景 0${index + 1}` : `Scenario 0${index + 1}`}</p>
                        <h3 className="mt-1 text-xl font-semibold text-white">{t(scenario.title, locale)}</h3>
                      </div>
                      <ArrowRight className={cn("h-4 w-4 shrink-0 text-slate-400 transition md:hidden", isExpanded && "rotate-90 text-white")} />
                    </div>
                  </button>
                  <p className={cn("mt-4 text-sm leading-7 text-slate-300", !isExpanded && "hidden md:block")}>{t(scenario.description, locale)}</p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section id="modules" className="grid gap-8 py-14 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="rounded-[2.1rem] border border-white/10 bg-slate-950/48 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:flex lg:h-[820px] lg:flex-col lg:overflow-hidden">
            <div className="shrink-0">
              <SectionTag>{t(brandCopy.moduleTag, locale)}</SectionTag>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.45rem]">{t(brandCopy.moduleTitle, locale)}</h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">{t(brandCopy.moduleBody, locale)}</p>
            </div>

            <div className="mt-8 space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-3">
              {capabilities.map((capability, index) => {
                const Icon = capability.icon;
                const isActive = index === activeIndex;
                const layer = capabilityLayers[index];

                return (
                  <div
                    key={capability.id}
                    className={cn(
                      "rounded-[1.55rem] border transition",
                      isActive ? "border-white/16 bg-white/8 shadow-[0_18px_50px_rgba(0,0,0,0.18)]" : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]",
                    )}
                    style={isActive ? { boxShadow: `0 0 0 1px ${capability.accent} inset, 0 0 28px ${capability.glow}` } : undefined}
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => {
                        setActiveIndex(index);
                        setShowMobileModuleDetail((current) => (index === activeIndex ? !current : true));
                      }}
                      className="w-full px-4 py-4 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
                          style={{ borderColor: isActive ? capability.accent : "rgba(255,255,255,0.12)", backgroundColor: capability.glow, color: capability.accent }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: isActive ? capability.accent : "#94A3B8" }}>{capability.token}</p>
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                                  {t(layer, locale)}
                                </span>
                              </div>
                              <p className="mt-1 text-lg font-semibold text-white">{t(capability.name, locale)}</p>
                            </div>
                            <ArrowRight className={cn("h-4 w-4 shrink-0 transition", isActive && showMobileModuleDetail ? "rotate-90 text-white" : "text-slate-400 lg:rotate-0")} />
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{t(capability.summary, locale)}</p>
                        </div>
                      </div>
                    </button>

                    {isActive && showMobileModuleDetail ? (
                      <div className="border-t border-white/10 px-4 pb-4 pt-4 lg:hidden">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                            {t(capabilityLayers[index], locale)}
                          </span>
                          <span
                            className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
                            style={{ borderColor: `${capability.accent}66`, backgroundColor: capability.glow, color: capability.accent }}
                          >
                            {capability.token}
                          </span>
                        </div>
                        <p className="mt-4 text-base leading-8 text-slate-300">{t(capability.description, locale)}</p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {capability.signals.slice(0, 4).map((signal) => (
                            <span key={signal.en} className="rounded-full border px-3 py-2 text-sm text-slate-200" style={{ borderColor: `${capability.accent}66`, backgroundColor: capability.glow }}>
                              {t(signal, locale)}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          {capability.metrics.map((metric) => (
                            <div key={metric.label.en} className="rounded-[1.25rem] border border-white/10 bg-slate-950/55 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{t(metric.label, locale)}</p>
                              <p className="mt-3 text-xl font-semibold text-white">{metric.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              <div className="hidden lg:block lg:h-[26rem]" aria-hidden="true" />
            </div>

            {!showMobileModuleDetail ? (
              <div className="mt-6 rounded-[1.55rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-4 lg:hidden">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{locale === "zh" ? "移动端查看方式" : "Mobile View"}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{mobileAccordionHint}</p>
              </div>
            ) : null}
          </div>

          <div className="hidden flex-col gap-6 lg:sticky lg:top-28 lg:flex">
            <AnimatePresence mode="wait">
              <motion.article
                key={`${activeCapability.id}-${locale}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:h-[820px]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(82,230,255,0.12),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(245,197,92,0.10),transparent_28%)]" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs uppercase tracking-[0.26em] text-slate-400">{t(activeCapability.name, locale)}</p>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                          {t(capabilityLayers[activeIndex], locale)}
                        </span>
                      </div>
                      <h3 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-[2.8rem]">{t(activeCapability.title, locale)}</h3>
                      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">{t(activeCapability.summary, locale)}</p>
                    </div>
                    <div className="rounded-[1.6rem] border px-5 py-4 text-right" style={{ borderColor: activeCapability.accent, backgroundColor: activeCapability.glow }}>
                      <p className="whitespace-nowrap text-xs uppercase tracking-[0.18em]" style={{ color: activeCapability.accent }}>
                        {t(brandCopy.activeModule, locale)}
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-white">{activeCapability.token}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      { id: "overview", zh: "概览", en: "Overview" },
                      { id: "outputs", zh: "核心产物", en: "Outputs" },
                      { id: "integrations", zh: "关键连接点", en: "Integrations" },
                    ].map((tab) => {
                      const isActive = moduleTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setModuleTab(tab.id as "overview" | "outputs" | "integrations")}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm transition",
                            isActive ? "border-white/16 bg-white/10 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/8",
                          )}
                        >
                          {locale === "zh" ? tab.zh : tab.en}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex-1 overflow-auto pr-1">
                    {moduleTab === "overview" ? (
                      <div>
                        <p className="max-w-3xl text-base leading-8 text-slate-300">{t(activeCapability.description, locale)}</p>
                        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "能力海报" : "Capability Poster"}</p>
                            <p className="mt-3 text-sm leading-7 text-slate-200">{t(activeCapability.geoFocus, locale)}</p>
                          </div>
                          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "关键场景信号" : "Key Signals"}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {activeCapability.signals.map((signal) => (
                                <span key={signal.en} className="rounded-full border px-3 py-2 text-sm text-slate-200" style={{ borderColor: `${activeCapability.accent}66`, backgroundColor: activeCapability.glow }}>
                                  {t(signal, locale)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                          {activeCapability.metrics.map((metric) => (
                            <div key={metric.label.en} className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-4">
                              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(metric.label, locale)}</p>
                              <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {moduleTab === "outputs" ? (
                      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "核心产物" : "Key Outputs"}</p>
                        <div className="mt-4 space-y-3">
                          {activeCapability.outputs.map((item) => (
                            <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                              {t(item, locale)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {moduleTab === "integrations" ? (
                      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "关键连接点" : "Key Integrations"}</p>
                        <div className="mt-4 space-y-3">
                          {activeCapability.integrations.map((item) => (
                            <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                              {t(item, locale)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailIndex(activeIndex)}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/8"
                  >
                    {t(brandCopy.detailButton, locale)}
                    <MoveUpRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </section>

        <section id="cases" className="py-14">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
              <SectionTag>{t(brandCopy.casesTag, locale)}</SectionTag>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.45rem]">{t(brandCopy.casesTitle, locale)}</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">{t(brandCopy.casesBody, locale)}</p>
              <p className="mt-4 text-sm leading-7 text-slate-300 md:hidden">{mobileAccordionHint}</p>

              <div className="mt-8 rounded-[1.7rem] border border-white/10 bg-white/6 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "增长结果观察维度" : "Growth Result Dimensions"}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {locale === "zh"
                    ? "我们不只看流量，而是看 AI 可见性、内容表现与商机转化如何沿着同一条增长链路被持续放大。"
                    : "We do not just track traffic. We track how AI visibility, content performance, and pipeline conversion compound across one connected growth loop."}
                </p>

                <div className="mt-5 grid gap-3">
                  {[
                    {
                      title: { zh: "可见性", en: "Visibility" },
                      items: [
                        { zh: "AI 引用率", en: "AI citation rate" },
                        { zh: "推荐场景覆盖", en: "Recommendation scenario coverage" },
                      ],
                    },
                    {
                      title: { zh: "内容表现", en: "Content Performance" },
                      items: [
                        { zh: "FAQ 抽取表现", en: "FAQ extraction performance" },
                        { zh: "高意图 CTA 点击", en: "High-intent CTA clicks" },
                      ],
                    },
                    {
                      title: { zh: "转化结果", en: "Conversion Outcomes" },
                      items: [
                        { zh: "推荐到商机转化", en: "Recommendation to pipeline" },
                      ],
                    },
                  ].map((group) => (
                    <div key={group.title.en} className="rounded-[1.25rem] border border-white/10 bg-slate-950/55 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t(group.title, locale)}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span key={item.en} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                            {t(item, locale)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <div className="space-y-5">
              {caseStudies.map((caseStudy, index) => {
                const isExpanded = activeCaseIndex === index;

                return (
                <article
                  key={caseStudy.company}
                  className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-white/6 shadow-[0_20px_90px_rgba(0,0,0,0.24)] backdrop-blur"
                >
                  <div className="relative border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(82,230,255,0.12),transparent_34%),linear-gradient(145deg,rgba(8,15,30,0.94),rgba(14,24,40,0.72))] px-6 py-5">
                    <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(82,230,255,0.9),rgba(245,197,92,0.35),transparent_88%)]" />
                    <button
                      type="button"
                      onClick={() => setActiveCaseIndex((current) => (current === index ? null : index))}
                      className="w-full text-left"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                              {locale === "zh" ? `案例 0${index + 1}` : `Case 0${index + 1}`}
                            </span>
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(caseStudy.sector, locale)}</p>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-4">
                            <h3 className="text-2xl font-semibold text-white">{caseStudy.company}</h3>
                            <ArrowRight className={cn("h-4 w-4 shrink-0 text-slate-400 transition md:hidden", isExpanded && "rotate-90 text-white")} />
                          </div>
                        </div>
                        <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-emerald-100 md:block">
                          {locale === "zh" ? "协同增长中" : "Compounding"}
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className={cn("p-6", !isExpanded && "hidden md:block")}>
                    <p className="text-base leading-8 text-white">{t(caseStudy.outcome, locale)}</p>

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
                  </div>
                </article>
              )})}
            </div>
          </div>
        </section>

        <section id="insights" className="py-14">
          <div className="grid gap-6 lg:grid-cols-[0.74fr_1.26fr]">
            <article className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.45rem]">{t(brandCopy.insightsTitle, locale)}</h2>
              <p className="mt-4 hidden text-base leading-8 text-slate-300 md:block">{t(brandCopy.insightsBody, locale)}</p>
              <p className="mt-4 text-sm leading-7 text-slate-300 md:hidden">
                {mobileAccordionHint}
              </p>
              <a
                href="/insights"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/8"
              >
                {locale === "zh" ? "查看全部洞察" : "View all insights"}
                <MoveUpRight className="h-4 w-4" />
              </a>
            </article>

            <div className="space-y-4">
              {insightItems.map((item, index) => {
                const isExpanded = activeInsightIndex === index;
                const InsightIcon =
                  item.iconKey === "radar" ? Radar : item.iconKey === "workflow" ? Workflow : FileSearch;

                return (
                  <motion.article
                    key={item.slug}
                    initial={{ opacity: 0, x: 18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/6 shadow-[0_18px_80px_rgba(0,0,0,0.22)] backdrop-blur"
                  >
                    <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${item.accent}, transparent 88%)` }} />

                    <button
                      type="button"
                      onClick={() => setActiveInsightIndex((current) => (current === index ? null : index))}
                      className="w-full p-5 text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-slate-300">
                          {t(item.category, locale)}
                        </span>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
                            style={{ borderColor: `${item.accent}55`, backgroundColor: item.glow, color: item.accent }}
                          >
                            <InsightIcon className="h-4 w-4" />
                          </div>
                          <ArrowRight className={cn("h-4 w-4 shrink-0 text-slate-400 transition md:hidden", isExpanded && "rotate-90 text-white")} />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-white">{t(item.title, locale)}</h3>
                    </button>
                    <div className={cn("px-5 pb-5", !isExpanded && "hidden md:block")}>
                      <p className="text-sm leading-7 text-slate-300">{t(item.description, locale)}</p>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                          {item.metric}
                          <span className="text-slate-500">/</span>
                          {t(item.metricLabel, locale)}
                        </span>
                        <a
                          href={`/insights/${item.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-100 transition hover:text-cyan-50"
                        >
                          {locale === "zh" ? "查看文章" : "Read article"}
                          <MoveUpRight className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="faq" className="py-14">
          <div className="grid gap-6 lg:grid-cols-[0.74fr_1.26fr]">
            <article className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.45rem]">{t(brandCopy.faqTitle, locale)}</h2>
              <p className="mt-4 hidden text-base leading-8 text-slate-300 md:block">{t(brandCopy.faqBody, locale)}</p>
              <p className="mt-4 text-sm leading-7 text-slate-300 md:hidden">
                {mobileFaqHint}
              </p>
            </article>

            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                {faqItems.slice(0, 2).map((item, index) => (
                  <motion.article
                    key={item.question.en}
                    initial={{ opacity: 0, x: 18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5 shadow-[0_18px_80px_rgba(0,0,0,0.22)] backdrop-blur"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaqIndex((current) => (current === index ? null : index))}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                            {locale === "zh" ? `重点问题 0${index + 1}` : `Featured Q0${index + 1}`}
                          </p>
                          <h3 className="mt-3 text-xl font-semibold text-white">{t(item.question, locale)}</h3>
                        </div>
                        <ArrowRight className={cn("mt-1 h-4 w-4 shrink-0 text-slate-400 transition md:hidden", activeFaqIndex === index && "rotate-90 text-white")} />
                      </div>
                      <p className={cn("mt-4 text-sm leading-7 text-slate-300", activeFaqIndex !== index && "hidden md:block")}>{t(item.answer, locale)}</p>
                    </button>
                  </motion.article>
                ))}
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/45 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{locale === "zh" ? "更多问题" : "More Questions"}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      {locale === "zh"
                        ? "下面这些问题更适合用来快速了解坚果猫的能力边界、合作方式和系统作用。"
                        : "The remaining questions help visitors quickly understand JGMAO's boundaries, collaboration model, and system value."}
                    </p>
                  </div>
                  <a
                    href="/faq"
                    className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/8 md:inline-flex"
                  >
                    {locale === "zh" ? "查看全部 FAQ" : "View all FAQ"}
                    <MoveUpRight className="h-4 w-4" />
                  </a>
                </div>

                <div className="mt-5 space-y-3">
                  {faqItems.slice(2).map((item, index) => (
                    <motion.article
                      key={item.question.en}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 0.32, delay: index * 0.03 }}
                      className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaqIndex((current) => (current === index + 2 ? null : index + 2))}
                        className="w-full text-left"
                      >
                        <div className="flex items-start gap-4">
                          <span className="mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 px-2 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                            {String(index + 3).padStart(2, "0")}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-base font-semibold text-white">{t(item.question, locale)}</h3>
                              <ArrowRight className={cn("mt-1 h-4 w-4 shrink-0 text-slate-400 transition md:hidden", activeFaqIndex === index + 2 && "rotate-90 text-white")} />
                            </div>
                            <p className={cn("mt-2 text-sm leading-7 text-slate-300", activeFaqIndex !== index + 2 && "hidden md:block")}>{t(item.answer, locale)}</p>
                          </div>
                        </div>
                      </button>
                    </motion.article>
                  ))}
                </div>

                <a
                  href="/faq"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/8 md:hidden"
                >
                  {locale === "zh" ? "查看全部 FAQ" : "View all FAQ"}
                  <MoveUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="pb-4 pt-14">
          <div className="grid gap-6">
            <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 backdrop-blur-xl">
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.45rem]">{t(brandCopy.contactTitle, locale)}</h2>

              <div className="mt-8 grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
                <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(82,230,255,0.14),transparent_52%),linear-gradient(180deg,rgba(8,15,30,0.88),rgba(8,15,30,0.74))] p-5">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,92,0.10),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(82,230,255,0.08),transparent_22%)]" />
                  <div className="relative">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">{locale === "zh" ? "公司介绍" : "Company Overview"}</p>
                    <p className="mt-4 text-sm leading-7 text-slate-300">
                      {locale === "zh"
                        ? "北京连接时代科技有限公司是国家高新技术企业，获得清华系基金合伙人战略投资。我们致力于将人工智能与可信技术能力深度融合，构建面向企业增长的可信基础设施，帮助品牌建立可持续的 AI 增长系统。"
                        : "Beijing Connection Era Technology Co., Ltd. is a national high-tech enterprise backed by strategic investment from Tsinghua-affiliated fund partners. We integrate AI with trusted technology capabilities to build growth infrastructure that helps brands create sustainable AI-driven growth systems."}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-300">
                      {locale === "zh"
                        ? "团队汇聚来自中科院、清华、复旦等院校的研究人员，以及来自 IBM、阿里、百度等公司的资深行业专家，在人工智能算法、增长技术与产业落地方面有着长期积累，核心技术曾获北京市科委专项基金支持，并获新华社视频专题报道。"
                        : "Our team brings together researchers from leading institutions including CAS, Tsinghua, and Fudan, alongside senior experts from IBM, Alibaba, and Baidu, with deep experience in AI algorithms, growth technology, and real-world implementation."}
                    </p>

                    <div className="mt-6 rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.18)]">
                      <p className="text-sm font-medium text-white">
                        {locale === "zh"
                          ? "跨越行业，赢得领先品牌的长期信任"
                          : "Across industries, we earn the long-term trust of leading brands"}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        {(
                          locale === "zh"
                            ? ["奥迪", "沃尔沃", "壳牌", "美孚", "佳通轮胎", "腾讯", "中国平安", "中国人民保险", "中信保诚", "中国航天科工集团", "中国质量认证中心", "人民日报", "万物向上", "西林设计", "紫光股份", "易购机"]
                            : ["AUDI", "VOLVO", "SHELL", "Mobil", "GITI Tire", "Tencent", "Ping An", "PICC", "CITIC Prudential", "CASIC", "CQC", "People's Daily", "Wanwu Xiangshang", "Xilin Design", "UNIS", "YiGouJi"]
                        ).map((brand) => (
                          <span
                            key={brand}
                            className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-1.5 text-xs font-medium tracking-[0.14em] text-slate-200"
                          >
                            {brand}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,17,34,0.92),rgba(8,14,28,0.86))] p-5 shadow-[0_20px_90px_rgba(0,0,0,0.24)] backdrop-blur">
                  <div className="grid gap-3">
                    {[
                      {
                        title: { zh: "国家高新技术企业", en: "National High-Tech Enterprise" },
                        icon: ShieldCheck,
                      },
                      {
                        title: { zh: "清华系基金战略投资", en: "Tsinghua-Affiliated Strategic Investment" },
                        icon: Sparkles,
                      },
                      {
                        title: { zh: "顶尖科研与产业团队", en: "Research + Industry Team" },
                        icon: Radar,
                      },
                      {
                        title: { zh: "北京工业大学研究生实习基地", en: "BJUT Graduate Internship Base" },
                        icon: GraduationCap,
                      },
                    ].map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <article key={item.title.en} className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                          <div className="flex items-start gap-3">
                            <div className="rounded-[0.95rem] border border-white/10 bg-cyan-300/10 p-2 text-cyan-100">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{String(index + 1).padStart(2, "0")}</p>
                              <h3 className="mt-1 text-base font-semibold text-white">{t(item.title, locale)}</h3>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="mt-5 border-t border-white/10 pt-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        {
                          label: { zh: "官网", en: "Website" },
                          value: { zh: "www.jgmao.com", en: "www.jgmao.com" },
                          href: "https://www.jgmao.com",
                        },
                        {
                          label: { zh: "商务邮箱", en: "Business Email" },
                          value: { zh: "service@jgmao.com", en: "service@jgmao.com" },
                          href: "mailto:service@jgmao.com",
                        },
                        {
                          label: { zh: "电话", en: "Phone" },
                          value: { zh: "400-9158-315", en: "400-9158-315" },
                          href: "tel:4009158315",
                        },
                        {
                          label: { zh: "地址", en: "Address" },
                          value: { zh: "北京市阜外大街乙22号6层", en: "6F, No. 22B Fuwai Street, Beijing" },
                        },
                      ].map((item) => (
                        <div key={item.label.en} className="rounded-[1.1rem] border border-white/10 bg-slate-950/45 px-4 py-3">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{t(item.label, locale)}</p>
                          {item.href ? (
                            <a
                              href={item.href}
                              target={item.href.startsWith("https") ? "_blank" : undefined}
                              rel={item.href.startsWith("https") ? "noreferrer" : undefined}
                              className="mt-2 inline-flex items-center gap-2 text-sm text-cyan-100 transition hover:text-cyan-50"
                            >
                              {t(item.value, locale)}
                              <MoveUpRight className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <p className="mt-2 text-sm leading-7 text-slate-200">{t(item.value, locale)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div className="fixed bottom-5 right-4 z-[70] hidden md:block">
        <motion.button
          type="button"
          onClick={() => setChatModalOpen((current) => !current)}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="group inline-flex items-center gap-2.5 rounded-full border border-cyan-300/18 bg-slate-950/82 px-3.5 py-2.5 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl transition hover:border-cyan-200/35 hover:bg-slate-950/90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/12 text-cyan-100">
            {chatModalOpen ? <X className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
          </div>
          <div className="text-left">
            <p className="text-[13px] font-medium text-white">{locale === "zh" ? "坚果猫AI智能体" : "JianGuoMao AI Agent"}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{chatModalOpen ? (locale === "zh" ? "点击收回" : "Click to close") : (locale === "zh" ? "点击开启" : "Click to open")}</p>
          </div>
        </motion.button>
      </div>

      <AnimatePresence>
        {chatModalOpen ? (
          <motion.div
            initial={typeof window !== "undefined" && window.innerWidth >= 768 ? { opacity: 1, x: 36 } : { opacity: 0, y: 24 }}
            animate={typeof window !== "undefined" && window.innerWidth >= 768 ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
            exit={typeof window !== "undefined" && window.innerWidth >= 768 ? { opacity: 1, x: 36 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-4 bottom-20 top-auto z-50 md:right-6 md:bottom-24 md:left-auto md:w-[min(31rem,38vw)]"
          >
            <motion.div
              className="relative flex h-[min(92vh,62rem)] w-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#09101f] shadow-[0_30px_120px_rgba(0,0,0,0.48)] md:max-h-[calc(100vh-7.5rem)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(82,230,255,0.14),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(245,197,92,0.12),transparent_26%)]" />
              <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-[1rem] border border-cyan-300/20 bg-cyan-300/12 p-2.5 text-cyan-100">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{locale === "zh" ? "坚果猫AI智能体" : "JianGuoMao AI Agent"}</p>
                    <p className="mt-1 text-xs text-slate-400">{locale === "zh" ? "在线，可即时咨询与留资" : "Online for consultation and lead capture"}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setChatModalOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                  aria-label={t(brandCopy.modalClose, locale)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative flex-1 overflow-auto px-5 py-5">
                <div className="rounded-[1.3rem] border border-cyan-300/12 bg-cyan-300/8 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">{locale === "zh" ? "快速开始" : "Quick Start"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { zh: "整站 GEO 诊断", en: "Site-wide GEO audit" },
                      { zh: "AI 增长网站升级", en: "AI growth website upgrade" },
                      { zh: "线索承接与留资", en: "Lead capture and intake" },
                    ].map((item) => (
                      <button
                        key={item.en}
                        type="button"
                        onClick={() => {
                          void sendChatMessage(t(item, locale));
                        }}
                          className="rounded-full border border-cyan-300/20 bg-slate-950/60 px-3 py-1.5 text-sm text-cyan-50 transition hover:border-cyan-200/35 hover:bg-cyan-300/10"
                        >
                          {t(item, locale)}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {chatMessages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}-${message.text.slice(0, 20)}`}
                      className={cn(
                        "max-w-[88%] rounded-[1.2rem] px-4 py-3 text-sm leading-7",
                        message.role === "user"
                          ? "rounded-tl-md border border-white/10 bg-white/6 text-slate-200"
                          : "ml-auto rounded-tr-md border border-cyan-300/18 bg-cyan-300/10 text-cyan-50",
                      )}
                    >
                      <div className="space-y-2">{renderChatMessageContent(message.text)}</div>
                    </div>
                  ))}

                </div>
              </div>

              <div className="relative border-t border-white/10 px-5 py-4">
                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-slate-950/65 px-4 py-3">
                    <input
                      value={chatInput}
                      onChange={(event) => setChatInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void sendChatMessage(chatInput);
                        }
                      }}
                      placeholder={locale === "zh" ? "输入你的问题，开始和坚果猫AI智能体对话..." : "Type your message to start chatting with JianGuoMao AI Agent..."}
                      className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      disabled={chatLoading || !chatInput.trim()}
                      onClick={() => {
                        void sendChatMessage(chatInput);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/12 px-4 py-2 text-sm font-medium text-cyan-50 transition hover:border-cyan-200/40 hover:bg-cyan-300/18 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {chatLoading ? (locale === "zh" ? "发送中" : "Sending") : (locale === "zh" ? "开始咨询" : "Start Chat")}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  {chatError ? (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <p className="text-xs leading-6 text-rose-200">
                        {locale === "zh" ? `智能体返回异常：${chatError}` : `Agent response issue: ${chatError}`}
                      </p>
                      {lastFailedMessage ? (
                        <button
                          type="button"
                          disabled={chatLoading}
                          onClick={() => {
                            void sendChatMessage(lastFailedMessage, { retry: true });
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1 text-[11px] font-medium text-rose-100 transition hover:border-rose-200/35 hover:bg-rose-300/14 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {locale === "zh" ? "重试上一次问题" : "Retry last message"}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs leading-6 text-slate-400">
                      {locale === "zh"
                        ? "可直接在对话中留下公司、官网、行业与当前问题，便于顾问后续快速跟进。"
                        : "Share your company, website, industry, and growth issue directly in chat for fast follow-up."}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {detailFlywheelModule ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-md"
            onClick={() => setFlywheelDemoDetailIndex(null)}
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
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border text-xl font-semibold"
                      style={{ borderColor: detailFlywheelModule.accent, color: detailFlywheelModule.accent, backgroundColor: detailFlywheelModule.glow }}
                    >
                      {detailFlywheelModule.letter}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t(brandCopy.flywheelDemoModalLabel, locale)}</p>
                      <h3 className="mt-2 text-3xl font-semibold text-white">
                        {displayFlywheelName(detailFlywheelModule, locale)}
                        <span className="ml-3 text-lg font-medium text-slate-400">{t(detailFlywheelModule.title, locale)}</span>
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFlywheelDemoDetailIndex(null)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                    aria-label={t(brandCopy.modalClose, locale)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="mt-6 text-base leading-8 text-slate-300">{t(detailFlywheelModule.modalBody, locale)}</p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {detailFlywheelModule.metrics.map((metric) => (
                    <div key={metric.label.en} className="rounded-[1.4rem] border border-white/10 bg-white/6 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(metric.label, locale)}</p>
                      <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(detailFlywheelModule.outputLabel, locale)}</p>
                    <div className="mt-4 space-y-3">
                      {detailFlywheelModule.outputs.map((item) => (
                        <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                          {t(item, locale)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(detailFlywheelModule.integrationTitle, locale)}</p>
                    <div className="mt-4 space-y-3">
                      {detailFlywheelModule.integrations.map((item) => (
                        <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                          {t(item, locale)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "关键输入信号" : "Key Signals"}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {detailFlywheelModule.signals.map((signal) => (
                      <span key={signal.en} className="rounded-full border px-3 py-2 text-sm text-slate-200" style={{ borderColor: `${detailFlywheelModule.accent}66`, backgroundColor: detailFlywheelModule.glow }}>
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

      <footer className="relative mt-5 border-t border-white/10 bg-slate-950/55">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-center px-5 py-4 text-center text-xs text-slate-500 sm:px-6 lg:px-10">
          {locale === "zh" ? (
            <div className="space-y-1.5">
              <p>{`© ${new Date().getFullYear()} 北京连接时代科技有限公司 版权所有`}</p>
              <p className="leading-6 text-slate-600">
                <a
                  href="https://dxzhgl.miit.gov.cn/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-white/10 underline-offset-4 transition hover:text-slate-400"
                >
                  经营许可证编号：京B2-20222927
                </a>
                <span className="mx-2 text-slate-700">·</span>
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-white/10 underline-offset-4 transition hover:text-slate-400"
                >
                  京ICP备19049430号-1
                </a>
                <span className="mx-2 text-slate-700">·</span>
                <a
                  href="https://beian.mps.gov.cn/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-white/10 underline-offset-4 transition hover:text-slate-400"
                >
                  京公网安备11010702002574号
                </a>
              </p>
            </div>
          ) : (
            <p>{`© ${new Date().getFullYear()} Beijing Connection Era Technology Co., Ltd. All rights reserved.`}</p>
          )}
        </div>
      </footer>
    </main>
  );
}

export default Home;
