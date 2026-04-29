import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";

import GrowthEntryFloating from "@/components/GrowthEntryFloating";
import JgmaoPageBrand from "@/components/JgmaoPageBrand";
import { geoPlanShareVersion, siteOrigin } from "@/lib/share";

declare global {
  interface Window {
    wx?: {
      config: (options: Record<string, unknown>) => void;
      ready: (handler: () => void) => void;
      error: (handler: (error: unknown) => void) => void;
      updateAppMessageShareData?: (payload: Record<string, unknown>) => void;
      updateTimelineShareData?: (payload: Record<string, unknown>) => void;
      onMenuShareAppMessage?: (payload: Record<string, unknown>) => void;
      onMenuShareTimeline?: (payload: Record<string, unknown>) => void;
    };
  }
}

type ReportItem = {
  key: string;
  label: string;
  ok: boolean;
  weight: number;
  positive: string;
  negative: string;
};

type ReportDimension = {
  key: string;
  title: string;
  score: number;
  rawScore: number;
  maxScore: number;
  items: ReportItem[];
};

type ReportAdvice = {
  priority: number;
  title: string;
  summary: string;
};

type GeoReport = {
  token: string;
  createdAt: string;
  updatedAt?: string;
  reportUrl: string;
  siteKey?: string;
  input: {
    name: string;
    company: string;
    contact: string;
    websiteUrl: string;
    source: string;
    page: string;
  };
  result: {
    score: number;
    level: string;
    strengths: string[];
    priorities: string[];
    checkedUrl: string;
    dimensions?: ReportDimension[];
    deepAdvice?: ReportAdvice[];
  };
};

type PlanFinding = {
  title: string;
  summary: string;
};

type PlanDimension = {
  key: string;
  title: string;
  score: number;
  summary: string;
  issues: string[];
  actions: string[];
  targets: string[];
};

type RoadmapStage = {
  stage: string;
  items: string[];
};

type PlanAction = {
  title: string;
  summary: string;
};

type BusinessImpact = {
  title: string;
  summary: string;
};

const fallbackDescription = "查看官网在首页主题、FAQ 体系、专题页、结构化数据与承接路径等方面的具体优化方案。";
const shareImage = `${siteOrigin}/geo-score-share-cover.png`;

const dimensionTitleMap: Record<string, string> = {
  crawl: "抓取与索引基础",
  theme: "首页主题与语义结构",
  ai: "结构化数据与 AI 可见性",
  content: "FAQ、案例与专题页体系",
  convert: "承接路径与行动入口",
  trust: "信任信号与商务可信度",
};

const dimensionActionTitleMap: Record<string, string> = {
  crawl: "先把抓取基础补稳",
  theme: "先统一首页主题表达",
  ai: "先补结构化数据与 AI 信号",
  content: "先补 FAQ 与专题页体系",
  convert: "先统一关键页面的行动入口",
  trust: "先补强信任信号与背书呈现",
};

const dimensionImpactMap: Record<string, BusinessImpact> = {
  crawl: {
    title: "更影响被发现",
    summary: "这一维偏弱时，会更直接影响官网被搜索系统与 AI 系统稳定发现、抓取和索引。",
  },
  theme: {
    title: "更影响被理解",
    summary: "这一维偏弱时，会更直接影响官网主题被快速理解，也会拖慢用户对主营业务的判断。",
  },
  ai: {
    title: "更影响被引用",
    summary: "这一维偏弱时，会更直接影响官网内容被 AI 理解、抽取、引用与推荐的稳定性。",
  },
  content: {
    title: "更影响覆盖增长",
    summary: "这一维偏弱时，会更直接影响 FAQ、案例与专题页形成长期覆盖和持续增长能力。",
  },
  convert: {
    title: "更影响咨询承接",
    summary: "这一维偏弱时，会更直接影响高意向用户进入咨询动作，拖慢官网承接与转化效率。",
  },
  trust: {
    title: "更影响商务信任",
    summary: "这一维偏弱时，会更直接影响商务可信度、合作判断和首次接触时的信心建立。",
  },
};

const dimensionPlanBuilders: Record<string, (siteName: string) => Omit<PlanDimension, "key" | "score">> = {
  crawl: (siteName) => ({
    title: "抓取与索引基础",
    summary: `先把 ${siteName} 的规范地址、抓取规则和站点地图补稳，确保官网基础抓取与索引不会成为后续扩展的隐性短板。`,
    issues: [
      "规范地址、抓取规则文件和站点地图等基础项如果不够稳定，会拖慢官网被持续发现和规范索引。",
      "即使首页可访问，地址规范与抓取边界不清，也会影响后续 FAQ、专题页和案例页的整体覆盖效率。",
    ],
    actions: [
      "优先检查并统一规范地址（canonical）、抓取规则文件（robots.txt）与站点地图（sitemap.xml）。",
      "把首页、FAQ 页、案例页与专题页的地址规范一起收紧，避免重复地址和抓取边界混乱。",
    ],
    targets: [
      "优先页面：首页、FAQ 页、案例页、专题页",
      "优先补齐：规范地址（canonical）、抓取规则文件（robots.txt）、站点地图（sitemap.xml）",
    ],
  }),
  theme: (siteName) => ({
    title: "首页主题与语义结构",
    summary: `先把 ${siteName} 的首页主题表达收紧，让 AI 与访客都能更快理解这家网站最擅长解决什么问题。`,
    issues: [
      "首页标题、H1 与首屏说明如果不够集中，会让主营业务判断变慢，影响首页主题表达的清晰度。",
      "服务方向即使已经能感知，如果第一屏仍偏展示而非问题解决导向，主题聚焦度就还可以继续收束。",
    ],
    actions: [
      "统一首页标题、H1 与首屏副文案，收紧成一条更清晰的业务主线。",
      "把首页首屏从“展示能力”进一步改成“解决什么问题、适合谁、为什么值得继续看”。",
    ],
    targets: [
      "优先页面：首页首屏、服务介绍区、首页底部信任区",
      "优先动作：统一标题、H1、首屏一句话与服务入口",
    ],
  }),
  ai: () => ({
    title: "结构化数据与 AI 可见性",
    summary: "结构化数据不是技术装饰，而是帮助 AI 与搜索系统更稳定理解官网语义、FAQ 与文章内容的基础层。",
    issues: [
      "页面语义即使已经具备一定基础，如果结构化数据和 AI 可引用表达不完整，整体可见性仍会偏弱。",
      "FAQ、案例与文章类页面如果缺少明确的数据类型标记，会降低被 AI 稳定抽取和引用的概率。",
    ],
    actions: [
      "优先补企业信息结构化数据（Organization）、网站结构化数据（WebSite）、常见问题结构化数据（FAQPage）与文章结构化数据（Article / BlogPosting）。",
      "把关键服务说明、FAQ 答案与案例摘要进一步改写成更适合 AI 理解和引用的表达方式。",
    ],
    targets: [
      "优先页面：首页、FAQ 页、案例详情页、洞察文章页",
      "优先补齐：企业信息结构化数据（Organization）、网站结构化数据（WebSite）、常见问题结构化数据（FAQPage）、文章结构化数据（Article / BlogPosting）",
    ],
  }),
  content: () => ({
    title: "FAQ、案例与专题页体系",
    summary: "FAQ、案例与专题页决定官网是否只是展示页，还是能持续承接搜索、AI 可见性和商务判断的内容资产。",
    issues: [
      "FAQ 体系不够完整时，高频问题难以被持续回答，内容资产也难形成可复用的问答层。",
      "案例和专题页如果不够系统，会削弱网站在主题覆盖和商务解释上的延展能力。",
    ],
    actions: [
      "优先补设计流程、交付周期、报价逻辑、服务边界、适合客户等高频 FAQ，并按服务理解与合作判断重新分组。",
      "按行业、服务类型或项目成果补 2 到 3 类案例页和专题页，形成更清晰的主题承接结构。",
    ],
    targets: [
      "优先补的 FAQ：设计流程、交付周期、报价方式、修改次数、合作边界、适合哪些企业",
      "优先补的专题页：品牌升级、官网设计、包装设计、整合传播等高价值主题页",
    ],
  }),
  convert: () => ({
    title: "承接路径与行动入口",
    summary: "当前网站即使已经具备联系方式，也还需要把高意向用户从浏览推进到咨询动作的路径收得更顺。",
    issues: [
      "电话、邮箱或联系信息分散时，会削弱高意向用户继续咨询的顺手度。",
      "不同页面的行动入口如果不统一，承接路径就容易被打断，咨询转化也会受到影响。",
    ],
    actions: [
      "统一首页、案例页、联系页和关键专题页的行动入口逻辑，让电话咨询、添加企微和提交需求形成清晰主路径。",
      "把高意向动作控制成少数几个主入口，减少页面之间的引导割裂。",
    ],
    targets: [
      "优先页面：首页、案例详情页、联系页、专题页底部",
      "优先统一：电话咨询、添加企微、提交需求三类行动入口（CTA）",
    ],
  }),
  trust: () => ({
    title: "信任信号与商务可信度",
    summary: "基础公司信息具备之后，更重要的是把备案、案例、客户背书和媒体信号收成更容易建立信任的组合方式。",
    issues: [
      "公司信息、备案和案例基础即使存在，如果呈现不够集中，也会降低商务可信度的第一眼判断效率。",
      "客户背书、资质或媒体提及如果没有形成组合展示，品牌可信度还可以进一步补强。",
    ],
    actions: [
      "把公司信息、ICP备案、公网安备、版权与代表案例重新组合到首页、关于页和联系页的关键位置。",
      "补充可公开的客户背书、合作客户、媒体提及或奖项信息，增强首次接触时的商务信任基础。",
    ],
    targets: [
      "优先页面：首页底部、关于页、联系页、案例页中的客户背书区",
      "优先补齐：公司信息、ICP备案、公网安备、代表案例、合作客户与媒体提及",
    ],
  }),
};

const demoReport: GeoReport = {
  token: "demo-sealingad",
  createdAt: "2026-04-25T10:00:00+08:00",
  updatedAt: "2026-04-25T10:00:00+08:00",
  reportUrl: `${siteOrigin}/geo-report/e9ad28a85c1305c67b6c414d/`,
  input: {
    name: "",
    company: "西林设计",
    contact: "",
    websiteUrl: "https://www.sealingad.com/",
    source: "geo-plan-demo",
    page: "/geo-plan/",
  },
  result: {
    score: 94,
    level: "基础不错，适合进一步做深 GEO 与内容增长。",
    strengths: [],
    priorities: [],
    checkedUrl: "https://www.sealingad.com/",
    dimensions: [
      { key: "theme", title: "主题结构与页面语义", score: 82, rawScore: 0, maxScore: 0, items: [] },
      { key: "content", title: "内容资产与 FAQ 体系", score: 84, rawScore: 0, maxScore: 0, items: [] },
      { key: "convert", title: "承接路径与转化能力", score: 85, rawScore: 0, maxScore: 0, items: [] },
      { key: "ai", title: "AI 可见性信号", score: 88, rawScore: 0, maxScore: 0, items: [] },
      { key: "crawl", title: "抓取与索引基础", score: 100, rawScore: 0, maxScore: 0, items: [] },
      { key: "trust", title: "品牌可信度与信任信号", score: 100, rawScore: 0, maxScore: 0, items: [] },
    ],
    deepAdvice: [],
  },
};

function setPageMeta(title: string, description: string) {
  document.title = title;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) metaDescription.setAttribute("content", description);
}

function setNamedMeta(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function setPropertyMeta(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function setCanonical(url: string) {
  let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

async function loadWechatSdk() {
  if (window.wx) return window.wx;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-wechat-sdk="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("微信 JS-SDK 加载失败。")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://res.wx.qq.com/open/js/jweixin-1.6.0.js";
    script.async = true;
    script.dataset.wechatSdk = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("微信 JS-SDK 加载失败。")), { once: true });
    document.head.appendChild(script);
  });

  return window.wx;
}

function formatBeijingDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\//g, "-");
}

function domainFromUrl(value?: string) {
  if (!value) return "";
  try {
    return new URL(value).hostname;
  } catch {
    return value || "";
  }
}

function reportDisplayName(report?: GeoReport | null) {
  if (!report) return "企业官网";
  const company = report.input.company?.trim();
  if (company) return company;
  return domainFromUrl(report.result.checkedUrl || report.input.websiteUrl) || "企业官网";
}

function reportDomain(report?: GeoReport | null) {
  if (!report) return "";
  return domainFromUrl(report.result.checkedUrl || report.input.websiteUrl);
}

function planTitleText(report?: GeoReport | null) {
  if (!report) return "企业官网 GEO 优化方案";
  const company = report.input.company?.trim();
  if (company) return `${company}官网 GEO 优化方案`;
  const domain = reportDomain(report);
  if (domain) return `${domain} GEO 优化方案`;
  return "企业官网 GEO 优化方案";
}

function planPageTitle(report?: GeoReport | null) {
  return `${planTitleText(report)}交付版 | 坚果猫 JGMAO`;
}

function buildDeliveryCode(report: GeoReport) {
  const date = formatBeijingDate(report.updatedAt || report.createdAt).replace(/-/g, "");
  const suffix = (report.token || "PLAN").slice(0, 6).toUpperCase();
  return `JG-GEOPLAN-${date}-${suffix}`;
}

function buildDeliverySummary(report: GeoReport) {
  const dimensions = report.result.dimensions || [];
  const weakest = [...dimensions].sort((a, b) => a.score - b.score).slice(0, 3);
  if (!weakest.length) {
    return "当前网站已经具备一定基础，建议继续围绕页面级问题、FAQ 补齐与承接路径优化推进官网 GEO 升级。";
  }

  const weakestTitles = weakest.map((item) => dimensionTitleMap[item.key] || item.title);
  const headline = weakestTitles.length === 1
    ? weakestTitles[0]
    : `${weakestTitles.slice(0, -1).join("、")}与${weakestTitles.slice(-1)}`;

  return `当前网站已经具备一定基础，但 ${headline} 仍有明显优化空间，建议优先围绕这几项推进页面级改造、内容补齐与承接优化。`;
}

function buildFindings(report: GeoReport): PlanFinding[] {
  const dimensions = (report.result.dimensions || []).slice().sort((a, b) => a.score - b.score).slice(0, 3);
  if (!dimensions.length) {
    return [
      {
        title: "当前网站仍有进一步优化空间",
        summary: "建议继续围绕首页表达、FAQ 体系、结构化数据与承接路径推进官网 GEO 升级。",
      },
    ];
  }

  return dimensions.map((dimension) => ({
    title: `${dimensionTitleMap[dimension.key] || dimension.title}仍是当前优先优化项`,
    summary: `${dimensionImpactMap[dimension.key]?.summary || "这一维会直接影响官网整体表现。"} 建议优先从这一维的关键基础项补齐开始推进。`,
  }));
}

function buildTopActions(report: GeoReport): PlanAction[] {
  const dimensions = (report.result.dimensions || []).slice().sort((a, b) => a.score - b.score).slice(0, 3);
  if (!dimensions.length) {
    return [
      {
        title: "优先围绕关键短板推进优化",
        summary: "先从当前最弱维度入手，把首页表达、FAQ、结构化数据与承接路径里的基础项补齐。",
      },
    ];
  }

  return dimensions.map((dimension) => ({
    title: dimensionActionTitleMap[dimension.key] || `先补 ${dimension.title}`,
    summary: dimensionPlanBuilders[dimension.key]
      ? dimensionPlanBuilders[dimension.key](reportDisplayName(report)).summary
      : "建议先从当前最弱维度的关键问题入手，完成这一维的核心补齐。",
  }));
}

function buildPlanDimensions(report: GeoReport): PlanDimension[] {
  const dimensions = report.result.dimensions || [];
  const dimensionScoreMap = new Map(dimensions.map((item) => [item.key, item.score]));
  const planKeys = ["theme", "content", "ai", "convert", "trust", "crawl"];

  return planKeys.map((key) => {
    const builder = dimensionPlanBuilders[key];
    const built = builder ? builder(reportDisplayName(report)) : {
      title: dimensionTitleMap[key] || key,
      summary: "建议继续围绕这一维度补齐关键基础项。",
      issues: ["当前这一维度仍有明显优化空间。"],
      actions: ["建议先补齐当前维度的关键项。"],
      targets: ["建议优先围绕当前维度最弱的页面和模块推进。"],
    };

    return {
      key,
      score: dimensionScoreMap.get(key) ?? 0,
      ...built,
    };
  });
}

function buildPriorityRoadmap(report: GeoReport): RoadmapStage[] {
  const dimensions = (report.result.dimensions || []).slice().sort((a, b) => a.score - b.score);
  const titles = dimensions.map((item) => dimensionActionTitleMap[item.key] || item.title);

  return [
    {
      stage: "立即处理",
      items: titles.slice(0, 2).length ? titles.slice(0, 2) : ["先统一首页主题表达", "先补核心 FAQ 与结构化数据"],
    },
    {
      stage: "近期优化",
      items: titles.slice(2, 4).length ? titles.slice(2, 4) : ["继续补专题页与案例体系", "继续优化承接路径与信任信号"],
    },
    {
      stage: "后续扩展",
      items: titles.slice(4).length ? titles.slice(4) : ["把官网内容体系做成长期增长资产"],
    },
  ];
}

function buildBusinessImpacts(report: GeoReport): BusinessImpact[] {
  const dimensions = (report.result.dimensions || []).slice().sort((a, b) => a.score - b.score).slice(0, 3);
  if (!dimensions.length) {
    return Object.values(dimensionImpactMap).slice(0, 3);
  }
  return dimensions.map((dimension) => dimensionImpactMap[dimension.key] || {
    title: "更影响整体结果",
    summary: "这一维会直接影响官网的整体表现与升级判断。",
  });
}

export default function GeoPlanPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token || "";
  const [report, setReport] = useState<GeoReport | null>(token ? null : demoReport);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchReport() {
      if (!token) {
        setReport(demoReport);
        setError("");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/lead/submit", {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({ type: "geo-report-fetch", token }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false || !payload?.report) {
          throw new Error(payload?.error || "方案读取失败。");
        }
        if (!cancelled) {
          setReport(payload.report as GeoReport);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "方案读取失败。");
          setReport(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchReport();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const activeReport = report;
  const shareUrl = useMemo(
    () =>
      token
        ? `${siteOrigin}/api/lead/submit?share=geo-plan&token=${encodeURIComponent(token)}&v=${encodeURIComponent(geoPlanShareVersion)}`
        : `${siteOrigin}/geo-plan/`,
    [token],
  );
  const canonicalUrl = useMemo(
    () => (token ? `${siteOrigin}/geo-plan/${token}/` : `${siteOrigin}/geo-plan/`),
    [token],
  );
  const pageTitle = useMemo(() => planPageTitle(activeReport), [activeReport]);
  const pageDescription = useMemo(() => fallbackDescription, []);
  const displayName = useMemo(() => reportDisplayName(activeReport), [activeReport]);
  const domain = useMemo(() => reportDomain(activeReport), [activeReport]);
  const deliveryCode = useMemo(() => (activeReport ? buildDeliveryCode(activeReport) : "JG-GEOPLAN-20260425-DEMO"), [activeReport]);
  const deliveryDate = useMemo(() => formatBeijingDate(activeReport?.updatedAt || activeReport?.createdAt || demoReport.createdAt), [activeReport]);
  const deliverySummary = useMemo(() => buildDeliverySummary(activeReport || demoReport), [activeReport]);
  const sampleFindings = useMemo(() => buildFindings(activeReport || demoReport), [activeReport]);
  const topActions = useMemo(() => buildTopActions(activeReport || demoReport), [activeReport]);
  const planDimensions = useMemo(() => buildPlanDimensions(activeReport || demoReport), [activeReport]);
  const priorityRoadmap = useMemo(() => buildPriorityRoadmap(activeReport || demoReport), [activeReport]);
  const businessImpactSummary = useMemo(() => buildBusinessImpacts(activeReport || demoReport), [activeReport]);

  useEffect(() => {
    setCanonical(canonicalUrl);
    setPageMeta(pageTitle, pageDescription);
    setPropertyMeta("og:title", planTitleText(activeReport));
    setPropertyMeta("og:description", pageDescription);
    setPropertyMeta("og:type", "website");
    setPropertyMeta("og:image", shareImage);
    setPropertyMeta("og:url", shareUrl);
    setNamedMeta("twitter:card", "summary_large_image");
    setNamedMeta("twitter:title", planTitleText(activeReport));
    setNamedMeta("twitter:description", pageDescription);
    setNamedMeta("twitter:image", shareImage);
  }, [activeReport, canonicalUrl, pageDescription, pageTitle, shareUrl]);

  useEffect(() => {
    if (typeof window === "undefined" || !activeReport || !token) return;
    const ua = window.navigator.userAgent || "";
    if (!/MicroMessenger/i.test(ua)) return;

    let cancelled = false;

    async function setupWechatShare() {
      try {
        const wx = await loadWechatSdk();
        if (!wx || cancelled) return;

        const pageUrl = window.location.href.split("#")[0];
        const response = await fetch("/api/wechat/share-config", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: pageUrl }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false || !payload?.config) return;

        const title = planTitleText(activeReport);
        const sharePayload = {
          title,
          desc: fallbackDescription,
          link: shareUrl,
          imgUrl: shareImage,
        };

        wx.config({
          debug: false,
          appId: payload.config.appId,
          timestamp: payload.config.timestamp,
          nonceStr: payload.config.nonceStr,
          signature: payload.config.signature,
          jsApiList: [
            "updateAppMessageShareData",
            "updateTimelineShareData",
            "onMenuShareAppMessage",
            "onMenuShareTimeline",
          ],
        });

        wx.ready(() => {
          if (cancelled) return;
          wx.updateAppMessageShareData?.(sharePayload);
          wx.updateTimelineShareData?.({
            title,
            link: shareUrl,
            imgUrl: shareImage,
          });
          wx.onMenuShareAppMessage?.(sharePayload);
          wx.onMenuShareTimeline?.({
            title,
            link: shareUrl,
            imgUrl: shareImage,
          });
        });
      } catch {
        // noop
      }
    }

    void setupWechatShare();
    return () => {
      cancelled = true;
    };
  }, [activeReport, shareUrl, token]);

  if (token && isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-white">
        <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/60 px-6 py-5 text-center backdrop-blur-xl">
          <p className="text-base font-medium text-white">正在生成当前官网的 GEO 优化方案…</p>
          <p className="mt-2 text-sm text-slate-400">请稍候，这会基于当前详细诊断结果自动生成。</p>
        </div>
      </main>
    );
  }

  if (token && error && !activeReport) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-white">
        <div className="max-w-xl rounded-[1.8rem] border border-rose-300/20 bg-rose-300/10 px-6 py-6 text-center backdrop-blur-xl">
          <p className="text-base font-semibold text-white">方案读取失败</p>
          <p className="mt-3 text-sm leading-7 text-slate-200">{error}</p>
          <Link
            href="/geo-upgrade/"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            返回升级方案页
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(82,230,255,0.14),transparent_24%),radial-gradient(circle_at_86%_10%,rgba(245,197,92,0.14),transparent_22%),radial-gradient(circle_at_52%_84%,rgba(181,146,255,0.12),transparent_28%),linear-gradient(180deg,#050816_0%,#091222_44%,#050816_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-5 pb-24 pt-8 sm:px-6 lg:px-10">
        <div className="flex justify-start">
          <JgmaoPageBrand />
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">本次官网 GEO 优化方案交付版</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-[2.5rem]">
              {planTitleText(activeReport)}
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-300">
              这是一份基于 <span className="font-medium text-white">{domain || "当前官网"}</span> 当前诊断结果生成的具体优化方案交付页，用来帮助判断这次官网升级应先从哪里开始推进。
            </p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">交付信息</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1rem] border border-white/10 bg-slate-950/35 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">交付编号</p>
                    <p className="mt-2 text-sm font-medium text-white">{deliveryCode}</p>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-slate-950/35 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">检测时间</p>
                    <p className="mt-2 text-sm font-medium text-white">{deliveryDate}</p>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-slate-950/35 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">交付状态</p>
                    <p className="mt-2 text-sm font-medium text-cyan-100">已生成</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.35rem] border border-cyan-300/20 bg-cyan-300/10 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">本次交付对象</p>
                <p className="mt-2 text-sm leading-7 text-slate-100">
                  网站名称：{displayName}
                  <br />
                  官网地址：{domain || "当前官网"}
                  <br />
                  当前重点：把详细诊断进一步收成可执行的页面级优化方案。
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">本次交付范围</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">
                  把这份网站的详细诊断，进一步转成更具体的改造方向、补齐建议与推进顺序，帮助团队从“看清问题”进入“如何开始改”。
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-amber-300/20 bg-amber-300/10 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-100/75">交付结论</p>
                <p className="mt-2 text-sm leading-7 text-slate-100">{deliverySummary}</p>
              </div>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.04 }}
            className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
              <ClipboardList className="h-4 w-4" />
              本次交付重点先回答
            </div>
            <div className="mt-5 grid gap-4">
              {sampleFindings.map((finding) => (
                <div key={finding.title} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-base font-semibold text-white">{finding.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{finding.summary}</p>
                </div>
              ))}
            </div>
          </motion.article>
        </section>

        <section className="mt-6 grid gap-6">
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 }}
            className="rounded-[1.9rem] border border-cyan-300/15 bg-cyan-300/[0.07] p-5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-100/70">
              <CheckCircle2 className="h-4 w-4" />
              本次最该先做的 3 件事
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {topActions.map((item) => (
                <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-200">{item.summary}</p>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="rounded-[1.9rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
              <CheckCircle2 className="h-4 w-4" />
              本次交付会从这些维度给出具体建议
            </div>
            <div className="mt-5 grid gap-4">
              {planDimensions.map((dimension) => (
                <div key={dimension.key} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-base font-semibold text-white">{dimension.title}</p>
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                      当前维度分数 {dimension.score}/100
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{dimension.summary}</p>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">当前主要问题</p>
                      <div className="mt-3 grid gap-2">
                        {dimension.issues.map((item) => (
                          <div key={item} className="flex items-start gap-2">
                            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                            <p className="text-sm leading-6 text-slate-200">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.2rem] border border-cyan-300/15 bg-cyan-300/[0.07] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">具体建议方向</p>
                      <div className="mt-3 grid gap-2">
                        {dimension.actions.map((item) => (
                          <div key={item} className="flex items-start gap-2">
                            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                            <p className="text-sm leading-6 text-slate-100">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-[1.2rem] border border-amber-300/15 bg-amber-300/[0.07] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-amber-100/75">优先落点与补齐对象</p>
                    <div className="mt-3 grid gap-2">
                      {dimension.targets.map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                          <p className="text-sm leading-6 text-slate-100">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="rounded-[1.9rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
              <ClipboardList className="h-4 w-4" />
              业务影响汇总
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {businessImpactSummary.map((item) => (
                <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{item.summary}</p>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.16 }}
            className="rounded-[1.9rem] border border-cyan-300/15 bg-cyan-300/[0.07] p-5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-100/70">
              <ClipboardList className="h-4 w-4" />
              本次建议优先处理顺序
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {priorityRoadmap.map((stage) => (
                <div key={stage.stage} className="rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-sm font-semibold text-white">{stage.stage}</p>
                  <div className="mt-3 grid gap-2">
                    {stage.items.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                        <p className="text-sm leading-6 text-slate-200">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.article>
        </section>

        {!token ? (
          <section className="mt-6">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 px-5 py-4 text-sm leading-7 text-slate-300">
              当前页面展示的是一个示例交付版结构。后续当某个官网生成专属优化方案时，会使用
              <span className="mx-2 rounded bg-white/10 px-2 py-1 text-white">/geo-plan/:token/</span>
              的形式按具体网站动态生成。
            </div>
          </section>
        ) : null}
      </div>

      <GrowthEntryFloating />
    </main>
  );
}
