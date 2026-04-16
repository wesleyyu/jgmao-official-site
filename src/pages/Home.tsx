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
  ShieldCheck,
  Sparkles,
  Waypoints,
  Workflow,
  X,
} from "lucide-react";
import { startTransition, useEffect, useState } from "react";

import logoImage from "@/assets/jgmao-logo-black-square.png";
import { cn } from "@/lib/utils";

type Locale = "zh" | "en";
type LocalizedText = Record<Locale, string>;

type FlywheelMetric = {
  label: LocalizedText;
  value: string;
};

type FlywheelModule = {
  id: string;
  letter: string;
  name: string;
  title: LocalizedText;
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

type OrbitPosition = {
  x: number;
  y: number;
};

type NavItem = {
  href: string;
  label: LocalizedText;
};

type StatItem = {
  label: LocalizedText;
  value: string;
  detail: LocalizedText;
};

type SnapshotRow = {
  label: LocalizedText;
  value: LocalizedText;
  icon: LucideIcon;
};

type SignalCard = {
  title: LocalizedText;
  icon: LucideIcon;
  bullets: LocalizedText[];
};

type CaseStudy = {
  company: string;
  sector: LocalizedText;
  outcome: LocalizedText;
  challenge: LocalizedText;
  solution: LocalizedText;
  metrics: Array<{ label: LocalizedText; value: string }>;
};

type FormState = {
  name: string;
  company: string;
  email: string;
  website: string;
  brief: string;
};

const defaultFormState: FormState = {
  name: "",
  company: "",
  email: "",
  website: "",
  brief: "",
};

const orbitPositions: OrbitPosition[] = [
  { x: 50, y: 12 },
  { x: 84, y: 34 },
  { x: 71, y: 76 },
  { x: 29, y: 76 },
  { x: 16, y: 34 },
];

const navItems: NavItem[] = [
  {
    href: "#flywheel",
    label: {
      zh: "增长飞轮",
      en: "Flywheel",
    },
  },
  {
    href: "#signals",
    label: {
      zh: "系统信号",
      en: "Signals",
    },
  },
  {
    href: "#proof",
    label: {
      zh: "增长证明",
      en: "Proof",
    },
  },
  {
    href: "#cases",
    label: {
      zh: "客户案例",
      en: "Cases",
    },
  },
  {
    href: "#cta",
    label: {
      zh: "联系咨询",
      en: "Contact",
    },
  },
];

const heroStats: StatItem[] = [
  {
    label: {
      zh: "AI 引用提升",
      en: "AI Citation Lift",
    },
    value: "+38%",
    detail: {
      zh: "来自 FAQ、专题页与证据块的综合改善",
      en: "Lift driven by FAQ, landing pages, and evidence blocks.",
    },
  },
  {
    label: {
      zh: "线索转化效率",
      en: "Lead Conversion",
    },
    value: "+27%",
    detail: {
      zh: "从高意图入口到表单提交的整体提效",
      en: "Improvement from high-intent entry points to form submit.",
    },
  },
  {
    label: {
      zh: "内容规模速度",
      en: "Content Velocity",
    },
    value: "3.4x",
    detail: {
      zh: "站点、内容、线索页协同生成后的速度收益",
      en: "Scale gain after pages, content, and lead assets run in sync.",
    },
  },
];

const snapshotRows: SnapshotRow[] = [
  {
    label: {
      zh: "采集层",
      en: "Signal Layer",
    },
    value: {
      zh: "Search + Site + CRM + AI 引用",
      en: "Search + Site + CRM + AI citations",
    },
    icon: Gauge,
  },
  {
    label: {
      zh: "策略层",
      en: "Strategy Layer",
    },
    value: {
      zh: "Journey → Generation → Monitoring → Authority",
      en: "Journey → Generation → Monitoring → Authority",
    },
    icon: Bot,
  },
  {
    label: {
      zh: "执行层",
      en: "Execution Layer",
    },
    value: {
      zh: "Orchestration 自动发布 / 回写 / 复盘",
      en: "Orchestration automates publishing, write-back, and review",
    },
    icon: Workflow,
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

const systemSignals: SignalCard[] = [
  {
    title: {
      zh: "站点层",
      en: "Site Layer",
    },
    icon: Globe2,
    bullets: [
      {
        zh: "专题页 / FAQ / 方案页结构化生成",
        en: "Structured generation for landing pages, FAQs, and solution pages",
      },
      {
        zh: "可被 AI 摘取的结论块与证据块",
        en: "Conclusion and evidence blocks designed for AI extraction",
      },
      {
        zh: "高意图 CTA 与下载转化设计",
        en: "High-intent CTAs and download-driven conversion design",
      },
    ],
  },
  {
    title: {
      zh: "内容层",
      en: "Content Layer",
    },
    icon: FileSearch,
    bullets: [
      {
        zh: "问答型内容矩阵",
        en: "Question-led content matrix",
      },
      {
        zh: "案例与行业观察",
        en: "Case studies and industry observations",
      },
      {
        zh: "品牌关键叙事的一致表达",
        en: "Consistent expression of your core brand narrative",
      },
    ],
  },
  {
    title: {
      zh: "执行层",
      en: "Execution Layer",
    },
    icon: Database,
    bullets: [
      {
        zh: "线索收集与 CRM 回写",
        en: "Lead capture and CRM write-back",
      },
      {
        zh: "实验结果回流到策略层",
        en: "Experiment learnings fed back into strategy",
      },
      {
        zh: "工作流编排与异常修正",
        en: "Workflow orchestration and anomaly correction",
      },
    ],
  },
];

const proofScenarios = [
  {
    title: {
      zh: "AI 搜索可见性",
      en: "AI Search Visibility",
    },
    detail: {
      zh: "让品牌在问答式搜索、生成式搜索与行业问题场景中更容易被看到和引用。",
      en: "Increase brand visibility and citation in answer-first and generative search scenarios.",
    },
  },
  {
    title: {
      zh: "官网增长系统",
      en: "Website Growth System",
    },
    detail: {
      zh: "把官网从静态展示页变成持续生成、持续验证、持续进化的增长机器。",
      en: "Turn a static website into a continuously generating, validating, and improving growth system.",
    },
  },
  {
    title: {
      zh: "B2B 线索转化",
      en: "B2B Lead Conversion",
    },
    detail: {
      zh: "围绕高价值路径设计内容、证据与转化承接，提升咨询与销售线索质量。",
      en: "Design content, proof, and conversion touchpoints around high-value paths to improve lead quality.",
    },
  },
];

const caseStudies: CaseStudy[] = [
  {
    company: "NovaStack",
    sector: {
      zh: "B2B SaaS",
      en: "B2B SaaS",
    },
    outcome: {
      zh: "把官网从“产品介绍页”升级成 AI 可引用的增长入口。",
      en: "Turned the website from a product brochure into an AI-citable growth engine.",
    },
    challenge: {
      zh: "原站点内容完整但路径混乱，AI 引用率和高意图线索都偏低。",
      en: "The old site had plenty of content but weak journey design, low AI citation, and weak lead capture.",
    },
    solution: {
      zh: "通过 JGMAO 重构专题页、FAQ、证据表达和自动监测回路。",
      en: "JGMAO rebuilt landing pages, FAQs, proof structures, and the monitoring loop.",
    },
    metrics: [
      { label: { zh: "AI 引用率", en: "AI Citations" }, value: "+41%" },
      { label: { zh: "表单转化", en: "Form Conversion" }, value: "+29%" },
      { label: { zh: "内容发布速度", en: "Publishing Velocity" }, value: "3x" },
    ],
  },
  {
    company: "Helio Industrial",
    sector: {
      zh: "工业制造",
      en: "Industrial Manufacturing",
    },
    outcome: {
      zh: "建立了可信表达与案例结构，让复杂方案更容易被客户和 AI 理解。",
      en: "Built authority and case-study structure so complex solutions were easier for both buyers and AI to trust.",
    },
    challenge: {
      zh: "技术能力强，但对外表达不够可信，客户很难快速判断价值。",
      en: "Strong capabilities but weak external trust signals made it hard for buyers to evaluate quickly.",
    },
    solution: {
      zh: "强化 Authority 与 Journey，增加行业案例、资质证据和清晰路径承接。",
      en: "Strengthened Authority and Journey with industry proof, credentials, and clearer user paths.",
    },
    metrics: [
      { label: { zh: "咨询质量", en: "Lead Quality" }, value: "+34%" },
      { label: { zh: "停留时长", en: "Dwell Time" }, value: "+22%" },
      { label: { zh: "高意图页面访问", en: "High-Intent Visits" }, value: "+38%" },
    ],
  },
];

const modules: FlywheelModule[] = [
  {
    id: "journey",
    letter: "J",
    name: "Journey",
    title: {
      zh: "用户旅程与增长路径",
      en: "User Journey and Growth Paths",
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
      zh: "Monitoring 会告诉 Authority 和 Orchestration 下一步该加强什么。",
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
      zh: "AI 自动执行与闭环编排",
      en: "AI Automation and Closed-Loop Orchestration",
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
      zh: "Orchestration 是飞轮真正转起来的关键。它让内容生成、页面更新、信号回收、异常提醒和优化建议不再依赖人工记忆，而是按节奏自动发生。",
      en: "Orchestration is what makes the flywheel actually move. It ensures content generation, page updates, signal collection, anomaly alerts, and optimization suggestions happen on rhythm instead of relying on human memory.",
    },
    accent: "#B592FF",
    glow: "rgba(181, 146, 255, 0.2)",
    icon: Workflow,
    outputLabel: {
      zh: "Orchestration 输出",
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
      zh: "Orchestration 连接点",
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
      zh: "Orchestration 会让飞轮持续转下去，而不是停在建议层。",
      en: "Orchestration keeps the flywheel moving instead of stopping at recommendations.",
    },
  },
];

const brandCopy = {
  heroTag: {
    zh: "AI Growth Flywheel",
    en: "AI Growth Flywheel",
  },
  heroTitle: {
    zh: "帮助企业在 AI 时代构建 AI 增长飞轮",
    en: "Helping enterprises build AI growth flywheels in the AI era",
  },
  heroBody: {
    zh: "以 Journey 梳理增长路径，用 Generation 扩大供给，以 Monitoring 校正判断，再通过 Authority 建立采信，最终由 Orchestration 让整个系统自动执行与闭环优化，帮助企业把官网、内容、线索与转化真正连成一个持续增长系统。",
    en: "Use Journey to structure growth paths, Generation to scale supply, Monitoring to validate performance, Authority to build trust, and Orchestration to automate the entire loop, so enterprise websites, content, leads, and conversion work as one continuous growth system.",
  },
  heroPrimary: {
    zh: "查看交互飞轮",
    en: "Explore the Flywheel",
  },
  heroSecondary: {
    zh: "获取增长方案",
    en: "Get a Growth Plan",
  },
  snapshotTag: {
    zh: "实时系统快照",
    en: "Live System Snapshot",
  },
  snapshotTitle: {
    zh: "增长不是一条链路，而是一个会自我强化的系统",
    en: "Growth is not a single funnel. It is a self-reinforcing system.",
  },
  snapshotBadge: {
    zh: "飞轮运行中",
    en: "Loop Active",
  },
  snapshotFooterTitle: {
    zh: "与普通官网改版的差异",
    en: "What Makes It Different",
  },
  snapshotFooterBody: {
    zh: "它不是“做几篇文章”或“重做一个首页”，而是把内容生成、可信表达、增长监测与 AI 自动编排连成一个官网增长引擎。",
    en: "This is not just a new homepage or a few blog posts. It connects content generation, trust design, growth monitoring, and AI orchestration into one website engine.",
  },
  flywheelTag: {
    zh: "Interactive Flywheel",
    en: "Interactive Flywheel",
  },
  flywheelTitle: {
    zh: "用一个可点击的增长飞轮，把 JGMAO 五个模块真正讲清楚",
    en: "Use one interactive growth flywheel to explain all five JGMAO modules clearly",
  },
  flywheelBody: {
    zh: "点击任意模块，或者停留观看自动轮播。每一环都不是孤立能力，而是在推动下一个环节，让官网持续变得更会获客、更可验证、更值得信任。",
    en: "Click any module or let the wheel autoplay. Each layer fuels the next so the website keeps becoming more discoverable, more measurable, and more trusted.",
  },
  detailButton: {
    zh: "查看独立详情",
    en: "Open Module Detail",
  },
  whyFlywheelTag: {
    zh: "为什么是飞轮",
    en: "Why a Flywheel",
  },
  whyFlywheelTitle: {
    zh: "每个模块都在为下一环提供燃料",
    en: "Every module supplies momentum to the next",
  },
  signalsTag: {
    zh: "System Signals",
    en: "System Signals",
  },
  signalsTitle: {
    zh: "增长飞轮不是抽象概念，它要接上真实的官网系统",
    en: "The growth flywheel is not abstract. It plugs into a real website system.",
  },
  signalsBody: {
    zh: "站点、内容、线索和执行工作流被统一到同一个增长界面里。用户看到的是一个漂亮的官网，团队拥有的是一个可运营、可验证、可复制的系统。",
    en: "Site, content, lead capture, and execution workflows are unified into one growth interface. Visitors see a polished website. Your team gets an operational, testable, repeatable system.",
  },
  proofTag: {
    zh: "Proof Of Growth",
    en: "Proof Of Growth",
  },
  proofTitle: {
    zh: "五个模块不是平铺的能力介绍，而是一套增长证明逻辑",
    en: "These five modules are not flat capabilities. They form a proof system for growth.",
  },
  proofBody: {
    zh: "先用 Journey 找对路径，再靠 Generation 把资产铺起来，用 Monitoring 看见真实反馈，靠 Authority 提升可信与采信，最后让 Orchestration 保证系统不会停在“提案阶段”。",
    en: "Journey maps the right path, Generation builds the assets, Monitoring validates reality, Authority raises trust, and Orchestration ensures the system does not stop at strategy.",
  },
  casesTag: {
    zh: "Case Studies",
    en: "Case Studies",
  },
  casesTitle: {
    zh: "把飞轮落到真实客户场景，官网才会有商业说服力",
    en: "The flywheel becomes persuasive when it shows up in real customer stories",
  },
  casesBody: {
    zh: "案例区不只是证明“我们做过”，而是证明 JGMAO 如何在不同业务场景里被执行、被验证、并带来可量化增长。",
    en: "The case section should prove more than experience. It should show how JGMAO is executed, validated, and translated into measurable growth across different business contexts.",
  },
  formTag: {
    zh: "Lead Conversion",
    en: "Lead Conversion",
  },
  formTitle: {
    zh: "把访客兴趣，转成明确的官网增长合作机会",
    en: "Turn visitor interest into a concrete website growth opportunity",
  },
  formBody: {
    zh: "这不是普通留言板。它应该让高意图客户快速提交现状、网址和目标，让后续方案更容易进入有效沟通。",
    en: "This should feel like a strategic intake, not a generic contact form. High-intent buyers should quickly share their current site, goals, and context so the next conversation starts deeper.",
  },
  ctaTag: {
    zh: "Ready To Launch",
    en: "Ready To Launch",
  },
  ctaTitle: {
    zh: "如果你的官网要承载 AI 增长，先把它设计成一台会不断学习的机器",
    en: "If your website needs to carry AI growth, design it as a machine that keeps learning",
  },
  ctaBody: {
    zh: "我们可以继续把这张概念页细化成完整官网，包括首页 Hero、飞轮交互、场景页、案例页、FAQ、线索表单和内容模板，让 JGMAO 从概念直接落到可上线版本。",
    en: "We can now turn this concept page into a production-ready website, including the homepage hero, flywheel interactions, scenario pages, case studies, FAQ, lead forms, and content templates.",
  },
  ctaList: [
    {
      zh: "官网首页全稿",
      en: "Full homepage copy",
    },
    {
      zh: "飞轮滚动动画",
      en: "Scroll-based flywheel motion",
    },
    {
      zh: "模块详情页",
      en: "Dedicated module pages",
    },
    {
      zh: "案例区块",
      en: "Case-study sections",
    },
    {
      zh: "表单转化流程",
      en: "Conversion form flows",
    },
    {
      zh: "英文版结构",
      en: "English website structure",
    },
  ],
  ctaPrimary: {
    zh: "重新查看飞轮",
    en: "Review the Flywheel",
  },
  ctaSecondary: {
    zh: "查看系统结构",
    en: "View the System",
  },
  formSuccess: {
    zh: "信息已记录。下一步可以把这份表单接到你的 CRM 或日历预约流程。",
    en: "Captured. Next step is to wire this form into your CRM or calendar workflow.",
  },
  formSubmit: {
    zh: "提交官网需求",
    en: "Submit Website Brief",
  },
  formDisclaimer: {
    zh: "示意表单：当前仅做前端展示，可继续接入真实提交逻辑。",
    en: "Demo form only: front-end capture is ready and can be connected to a real endpoint next.",
  },
  moduleModalLabel: {
    zh: "模块详情",
    en: "Module Detail",
  },
  activeModule: {
    zh: "当前模块",
    en: "Active Module",
  },
  signalLayer: {
    zh: "信号层",
    en: "Signal Layer",
  },
  executionRhythm: {
    zh: "执行节奏",
    en: "Execution Rhythm",
  },
  growthLoopLabel: {
    zh: "AI 增长飞轮",
    en: "AI Growth Loop",
  },
  menuLabel: {
    zh: "切换导航",
    en: "Toggle navigation",
  },
  modalClose: {
    zh: "关闭",
    en: "Close",
  },
};

const topQuickFacts = [
  {
    zh: "AI 时代企业增长系统",
    en: "Enterprise Growth System for the AI Era",
  },
  {
    zh: "Website + Content + Trust + Automation",
    en: "Website + Content + Trust + Automation",
  },
];

const t = (copy: LocalizedText, locale: Locale) => copy[locale];

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

function ModuleNode({
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
        "absolute z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[1.8rem] border text-center backdrop-blur transition-all duration-300 md:h-28 md:w-28",
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
      aria-label={`${module.name}`}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-2xl border"
        style={{
          backgroundColor: module.glow,
          borderColor: isActive ? module.accent : "rgba(255,255,255,0.12)",
          color: module.accent,
        }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="mt-2 text-lg font-semibold tracking-[0.18em]" style={{ color: isActive ? module.accent : "#F5F7FB" }}>
        {module.letter}
      </span>
      <span className="text-[11px] uppercase tracking-[0.2em] text-slate-300">{module.name}</span>
    </motion.button>
  );
}

function Home() {
  const [locale, setLocale] = useState<Locale>("zh");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSection, setActiveSection] = useState("flywheel");
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailModuleIndex, setDetailModuleIndex] = useState<number | null>(null);
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      startTransition(() => {
        setActiveIndex((current) => (current + 1) % modules.length);
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
        threshold: [0.2, 0.35, 0.5, 0.7],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  useEffect(() => {
    if (detailModuleIndex === null) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDetailModuleIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [detailModuleIndex]);

  const activeModule = modules[activeIndex];
  const detailModule = detailModuleIndex === null ? null : modules[detailModuleIndex];

  const handleModuleFocus = (index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
  };

  const openModuleDetail = (index: number) => {
    setActiveIndex(index);
    setDetailModuleIndex(index);
  };

  const handleInputChange = (field: keyof FormState, value: string) => {
    setSubmitted(false);
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setFormState(defaultFormState);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(82,230,255,0.14),transparent_24%),radial-gradient(circle_at_90%_18%,rgba(245,197,92,0.12),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(181,146,255,0.12),transparent_28%),linear-gradient(180deg,#050816_0%,#091222_38%,#050816_100%)]" />
      <div className="pointer-events-none absolute inset-0 ops-grid opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,8,22,0.18)_58%,rgba(5,8,22,0.94)_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 pb-16 pt-6 sm:px-6 lg:px-10">
        <header className="sticky top-4 z-40 mb-10 rounded-[1.6rem] border border-white/10 bg-slate-950/55 px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandMark />
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-100/70">JGMAO</p>
                <p className="text-sm text-white">
                  {locale === "zh" ? "AI增长引擎" : "AI Growth Engine"}
                </p>
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

        <section className="grid gap-8 pb-16 pt-4 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
          <div>
            <SectionTag>{t(brandCopy.heroTag, locale)}</SectionTag>

            <div className="mt-5 flex flex-wrap gap-2">
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
              className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[4.45rem] lg:leading-[1.03]"
            >
              {locale === "zh" ? (
                <>
                  帮助企业在 AI 时代
                  <br />
                  构建{" "}
                  <span className="bg-gradient-to-r from-cyan-200 via-amber-100 to-violet-200 bg-clip-text text-transparent">AI 增长飞轮</span>
                </>
              ) : (
                <>
                  Helping enterprises build{" "}
                  <span className="bg-gradient-to-r from-cyan-200 via-amber-100 to-violet-200 bg-clip-text text-transparent">AI growth flywheels</span>
                  <br />
                  for the AI era
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
            >
              {t(brandCopy.heroBody, locale)}
            </motion.p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#flywheel"
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/12 px-5 py-3 text-sm font-medium text-cyan-50 transition hover:border-cyan-200/40 hover:bg-cyan-300/18"
              >
                {t(brandCopy.heroPrimary, locale)}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#cta"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/8"
              >
                {t(brandCopy.heroSecondary, locale)}
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {heroStats.map((item) => (
                <article
                  key={item.label.en}
                  className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur"
                >
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
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,92,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(82,230,255,0.12),transparent_30%)]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{t(brandCopy.snapshotTag, locale)}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{t(brandCopy.snapshotTitle, locale)}</h2>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-emerald-100">
                  {t(brandCopy.snapshotBadge, locale)}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {snapshotRows.map((row) => {
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

              <div className="mt-6 rounded-[1.6rem] border border-amber-300/15 bg-amber-300/8 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-amber-100/80">{t(brandCopy.snapshotFooterTitle, locale)}</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{t(brandCopy.snapshotFooterBody, locale)}</p>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="flywheel" className="grid gap-8 py-14 lg:grid-cols-[1.12fr_0.88fr]">
          <div
            className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-slate-950/50 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.32)] backdrop-blur-xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(82,230,255,0.12),transparent_30%),radial-gradient(circle_at_bottom,rgba(245,197,92,0.10),transparent_28%)]" />
            <div className="relative">
              <SectionTag>{t(brandCopy.flywheelTag, locale)}</SectionTag>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.6rem]">{t(brandCopy.flywheelTitle, locale)}</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">{t(brandCopy.flywheelBody, locale)}</p>

              <div className="relative mt-8 mx-auto aspect-square w-full max-w-[640px]">
                <div className="flywheel-ring absolute inset-[10%] rounded-full border border-white/10 opacity-80" />
                <div className="flywheel-ring-reverse absolute inset-[18%] rounded-full border border-dashed border-white/10 opacity-80" />
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(82,230,255,0.08),transparent_38%),radial-gradient(circle_at_center,rgba(245,197,92,0.06),transparent_60%)]" />

                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                  <circle cx="50" cy="50" r="35" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" fill="none" />
                  <circle cx="50" cy="50" r="22" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" fill="none" />
                  {orbitPositions.map((position, index) => {
                    const module = modules[index];
                    const isActive = index === activeIndex;

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

                {modules.map((module, index) => (
                  <ModuleNode
                    key={module.id}
                    module={module}
                    index={index}
                    position={orbitPositions[index]}
                    isActive={index === activeIndex}
                    onActivate={handleModuleFocus}
                  />
                ))}

                <motion.div
                  className="absolute left-1/2 top-1/2 z-10 flex h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/12 bg-slate-950/80 text-center shadow-[0_0_80px_rgba(0,0,0,0.38)] backdrop-blur-xl"
                  animate={{ boxShadow: [`0 0 40px ${activeModule.glow}`, `0 0 72px ${activeModule.glow}`, `0 0 40px ${activeModule.glow}`] }}
                  transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl border text-xl font-semibold"
                    style={{ borderColor: activeModule.accent, color: activeModule.accent, backgroundColor: activeModule.glow }}
                  >
                    {activeModule.letter}
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.28em] text-slate-400">{t(brandCopy.growthLoopLabel, locale)}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{activeModule.name}</p>
                  <p className="mt-2 max-w-[16rem] text-sm leading-6 text-slate-300">{t(activeModule.title, locale)}</p>
                </motion.div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-5">
                {modules.map((module, index) => (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => handleModuleFocus(index)}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-left transition",
                      index === activeIndex ? "bg-white/10 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/8",
                    )}
                    style={{ borderColor: index === activeIndex ? module.accent : undefined }}
                  >
                    <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: index === activeIndex ? module.accent : undefined }}>
                      {module.letter}
                    </p>
                    <p className="mt-2 text-sm font-medium">{module.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <AnimatePresence mode="wait">
              <motion.article
                key={`${activeModule.id}-${locale}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-400">{t(activeModule.outputLabel, locale)}</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                      {activeModule.name}
                      <span className="ml-3 text-lg font-medium text-slate-400">{t(activeModule.title, locale)}</span>
                    </h3>
                  </div>
                  <div
                    className="rounded-[1.4rem] border px-4 py-3 text-right"
                    style={{ borderColor: activeModule.accent, backgroundColor: activeModule.glow }}
                  >
                    <p className="text-xs uppercase tracking-[0.18em]" style={{ color: activeModule.accent }}>
                      {t(brandCopy.activeModule, locale)}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-white">{activeModule.letter}</p>
                  </div>
                </div>

                <p className="mt-5 text-base leading-8 text-slate-300">{t(activeModule.description, locale)}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {activeModule.metrics.map((metric) => (
                    <div key={metric.label.en} className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(metric.label, locale)}</p>
                      <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(activeModule.outputLabel, locale)}</p>
                    <div className="mt-4 space-y-3">
                      {activeModule.outputs.map((item) => (
                        <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                          {t(item, locale)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(activeModule.integrationTitle, locale)}</p>
                    <div className="mt-4 space-y-3">
                      {activeModule.integrations.map((item) => (
                        <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                          {t(item, locale)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xl text-sm leading-7 text-slate-300">{t(activeModule.nextStep, locale)}</p>
                  <button
                    type="button"
                    onClick={() => openModuleDetail(activeIndex)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/8"
                  >
                    {t(brandCopy.detailButton, locale)}
                    <MoveUpRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.article>
            </AnimatePresence>

            <article className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t(brandCopy.whyFlywheelTag, locale)}</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{t(brandCopy.whyFlywheelTitle, locale)}</h3>
              <div className="mt-6 space-y-4">
                {orchestrationRail.map((item, index) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white">
                        {item.step}
                      </div>
                      {index < orchestrationRail.length - 1 ? <div className="mt-2 h-full w-px bg-white/10" /> : null}
                    </div>
                    <div className="pb-5">
                      <p className="text-lg font-medium text-white">{t(item.title, locale)}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{t(item.description, locale)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section id="signals" className="py-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionTag>{t(brandCopy.signalsTag, locale)}</SectionTag>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.5rem]">{t(brandCopy.signalsTitle, locale)}</h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-300">{t(brandCopy.signalsBody, locale)}</p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {systemSignals.map((column) => {
              const Icon = column.icon;

              return (
                <article
                  key={column.title.en}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)] backdrop-blur"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                  <div className="flex items-center gap-4">
                    <div className="rounded-[1.3rem] border border-white/10 bg-slate-950/70 p-3 text-cyan-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t(brandCopy.signalLayer, locale)}</p>
                      <h3 className="mt-1 text-2xl font-semibold text-white">{t(column.title, locale)}</h3>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {column.bullets.map((bullet) => (
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

        <section id="proof" className="py-14">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 backdrop-blur-xl">
              <SectionTag>{t(brandCopy.proofTag, locale)}</SectionTag>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.4rem]">{t(brandCopy.proofTitle, locale)}</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">{t(brandCopy.proofBody, locale)}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {proofScenarios.map((card) => (
                  <div key={card.title.en} className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 sm:last:col-span-2">
                    <p className="text-lg font-medium text-white">{t(card.title, locale)}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{t(card.detail, locale)}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t(brandCopy.executionRhythm, locale)}</p>
              <div className="mt-6 space-y-5">
                {modules.map((module, index) => {
                  const Icon = module.icon;

                  return (
                    <motion.div
                      key={module.id}
                      className="rounded-[1.6rem] border border-white/10 bg-slate-950/55 p-5"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: 0.42, delay: index * 0.05 }}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-4">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl border"
                            style={{ borderColor: `${module.accent}88`, color: module.accent, backgroundColor: module.glow }}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{module.letter}</p>
                            <p className="mt-1 text-xl font-semibold text-white">
                              {module.name}
                              <span className="ml-3 text-sm font-medium text-slate-400">{t(module.title, locale)}</span>
                            </p>
                            <p className="mt-3 text-sm leading-7 text-slate-300">{t(module.summary, locale)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openModuleDetail(index)}
                          className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/8"
                        >
                          {t(brandCopy.detailButton, locale)}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </article>
          </div>
        </section>

        <section id="cases" className="py-14">
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <article className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
              <SectionTag>{t(brandCopy.casesTag, locale)}</SectionTag>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.4rem]">{t(brandCopy.casesTitle, locale)}</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">{t(brandCopy.casesBody, locale)}</p>

              <div className="mt-8 space-y-5">
                {caseStudies.map((caseStudy) => (
                  <article key={caseStudy.company} className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(caseStudy.sector, locale)}</p>
                        <h3 className="mt-2 text-2xl font-semibold text-white">{caseStudy.company}</h3>
                      </div>
                      <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-emerald-100">
                        {locale === "zh" ? "案例运行中" : "Case Active"}
                      </div>
                    </div>

                    <p className="mt-4 text-base leading-8 text-white">{t(caseStudy.outcome, locale)}</p>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "原始挑战" : "Challenge"}</p>
                        <p className="mt-3 text-sm leading-7 text-slate-300">{t(caseStudy.challenge, locale)}</p>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "JGMAO 动作" : "JGMAO Execution"}</p>
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
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <SectionTag>{t(brandCopy.formTag, locale)}</SectionTag>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.4rem]">{t(brandCopy.formTitle, locale)}</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">{t(brandCopy.formBody, locale)}</p>

              <form className="mt-8 space-y-4" onSubmit={handleFormSubmit}>
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
                      placeholder={locale === "zh" ? "name@company.com" : "name@company.com"}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">{locale === "zh" ? "官网地址" : "Website URL"}</span>
                    <input
                      value={formState.website}
                      onChange={(event) => handleInputChange("website", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-white placeholder:text-slate-500 focus:border-cyan-300/35 focus:outline-none"
                      placeholder={locale === "zh" ? "https://your-site.com" : "https://your-site.com"}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">{locale === "zh" ? "增长目标 / 当前问题" : "Growth Goal / Current Challenge"}</span>
                  <textarea
                    value={formState.brief}
                    onChange={(event) => handleInputChange("brief", event.target.value)}
                    rows={6}
                    className="w-full rounded-[1.4rem] border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-300/35 focus:outline-none"
                    placeholder={
                      locale === "zh"
                        ? "例如：想提升 AI 搜索可见性、重构官网首页、提高咨询转化率"
                        : "e.g. improve AI visibility, rebuild the homepage, increase qualified lead conversion"
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

        <section id="cta" className="py-14">
          <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-slate-950/60 px-6 py-8 shadow-[0_28px_120px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:px-8 lg:px-10 lg:py-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(82,230,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,197,92,0.16),transparent_30%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <SectionTag>{t(brandCopy.ctaTag, locale)}</SectionTag>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.7rem]">{t(brandCopy.ctaTitle, locale)}</h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">{t(brandCopy.ctaBody, locale)}</p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "适合下一步继续做的内容" : "Strong next steps from here"}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {brandCopy.ctaList.map((item) => (
                      <span key={item.en} className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-slate-200">
                        {t(item, locale)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="#flywheel"
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/12 px-5 py-3 text-sm font-medium text-cyan-50 transition hover:border-cyan-200/40 hover:bg-cyan-300/18"
                  >
                    {t(brandCopy.ctaPrimary, locale)}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#signals"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/8"
                  >
                    {t(brandCopy.ctaSecondary, locale)}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {detailModule ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-md"
            onClick={() => setDetailModuleIndex(null)}
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
                      style={{ borderColor: detailModule.accent, color: detailModule.accent, backgroundColor: detailModule.glow }}
                    >
                      {detailModule.letter}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t(brandCopy.moduleModalLabel, locale)}</p>
                      <h3 className="mt-2 text-3xl font-semibold text-white">
                        {detailModule.name}
                        <span className="ml-3 text-lg font-medium text-slate-400">{t(detailModule.title, locale)}</span>
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailModuleIndex(null)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                    aria-label={t(brandCopy.modalClose, locale)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="mt-6 text-base leading-8 text-slate-300">{t(detailModule.modalBody, locale)}</p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {detailModule.metrics.map((metric) => (
                    <div key={metric.label.en} className="rounded-[1.4rem] border border-white/10 bg-white/6 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(metric.label, locale)}</p>
                      <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(detailModule.outputLabel, locale)}</p>
                    <div className="mt-4 space-y-3">
                      {detailModule.outputs.map((item) => (
                        <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                          {t(item, locale)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "关键输入信号" : "Key Signals"}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {detailModule.signals.map((signal) => (
                        <span
                          key={signal.en}
                          className="rounded-full border px-3 py-2 text-sm text-slate-200"
                          style={{ borderColor: `${detailModule.accent}66`, backgroundColor: detailModule.glow }}
                        >
                          {t(signal, locale)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t(detailModule.integrationTitle, locale)}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {detailModule.integrations.map((item) => (
                      <div key={item.en} className="rounded-[1.3rem] border border-white/10 bg-slate-950/55 px-4 py-4 text-sm leading-7 text-slate-200">
                        {t(item, locale)}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-[1.3rem] border border-white/10 bg-slate-950/55 p-4 text-sm leading-7 text-slate-300">
                    {t(detailModule.nextStep, locale)}
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
