import { motion } from "framer-motion";
import { BadgeCheck, ChevronDown, ChevronUp, CircleAlert, Globe2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";

import JgmaoPageBrand from "@/components/JgmaoPageBrand";
import { siteOrigin } from "@/lib/share";
import wecomSupportQrImage from "@/assets/wecom-support-qr.png";

const defaultReportTitle = "企业官网 GEO 详细诊断报告";
const defaultReportDescription = "查看官网在抓取、主题结构、AI 可见性、内容资产与承接转化等维度的详细诊断结果。";
const reportShareImage = `${siteOrigin}/geo-score-share-cover.png`;

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
  firstCreatedAt?: string;
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
  history?: Array<{
    createdAt: string;
    score: number;
    level?: string;
    checkedUrl?: string;
    dimensions?: Array<{
      key: string;
      title: string;
      score: number;
    }>;
  }>;
  wecomClaim?: {
    claimToken?: string;
    status?: string;
    deliveredAt?: string;
    supportUrl?: string;
    sourceType?: string;
    relationshipStatus?: string;
  };
  paidPlanUrl?: string;
  paidPlanOrder?: {
    orderNo?: string;
    planTitle?: string;
    amountLabel?: string;
    paidAt?: string;
  };
};

type DiagnosticDirection = {
  key: string;
  title: string;
  summary: string;
  nextFocus: string;
};

const dimensionLabelMap: Record<string, string> = {
  crawl: "抓取基础",
  theme: "主题结构",
  ai: "AI信号",
  content: "内容资产",
  convert: "承接转化",
  trust: "信任背书",
};

const dimensionAdviceMap: Record<string, string> = {
  crawl: "优先补齐 HTTPS、规范地址（canonical）、抓取规则文件（robots.txt）与站点地图（sitemap.xml），确保官网地址规范、抓取稳定、可被搜索与 AI 系统持续发现。",
  theme: "集中首页主题表达，补齐 H1、标题、描述和更清晰的页面语义，让 AI 与用户都能更快理解官网重点。",
  ai: "继续完善 FAQ、结构化数据与分享语义，增强内容被 AI 理解、抽取、引用与推荐的稳定性。",
  content: "继续补齐 FAQ、案例、专题页与洞察栏目，让内容形成可复用、可沉淀、可持续扩展的资产体系。",
  convert: "强化电话、企微、表单与行动入口（CTA）等高意向承接入口，让官网不只被看见，也能有效承接咨询动作。",
  trust: "继续补齐公司信息、备案资质、客户背书与媒体报道等信任信号，增强官网的可信度与商务说服力。",
};

const dimensionImpactMap: Record<string, { label: string; summary: string }> = {
  crawl: {
    label: "更影响被发现",
    summary: "这一维偏弱时，更容易影响官网被搜索系统与 AI 系统持续发现、抓取和稳定索引。",
  },
  theme: {
    label: "更影响被理解",
    summary: "这一维偏弱时，AI 与用户会更难快速理解官网主线，进而影响页面语义清晰度与主题判断。",
  },
  ai: {
    label: "更影响被引用",
    summary: "这一维偏弱时，会直接影响内容被 AI 理解、抽取、引用与推荐的稳定性。",
  },
  content: {
    label: "更影响覆盖增长",
    summary: "这一维偏弱时，官网更难形成 FAQ、案例与洞察的持续覆盖，也会拖慢长尾可见性增长。",
  },
  convert: {
    label: "更影响咨询承接",
    summary: "这一维偏弱时，高意向用户更难顺手继续咨询，会直接影响官网承接与转化效率。",
  },
  trust: {
    label: "更影响商务信任",
    summary: "这一维偏弱时，品牌可信度与商务说服力会下降，也更容易影响合作判断与咨询信心。",
  },
};

const diagnosticDirectionMap: Record<string, Omit<DiagnosticDirection, "key">> = {
  crawl: {
    title: "先补抓取与索引基础",
    summary: "先把规范地址（canonical）、抓取规则文件（robots.txt）、站点地图（sitemap.xml）和地址规范做稳，避免官网被重复地址和抓取稳定性拖低整体表现。",
    nextFocus: "优先确认地址规范、抓取边界和索引基础是否完整。",
  },
  theme: {
    title: "先收主题结构与页面语义",
    summary: "围绕首页主题表达、页面语义和专题页结构做收束，让官网更容易被 AI 与用户同时理解。",
    nextFocus: "优先统一首页主题表达、H1、标题和描述的语义。",
  },
  ai: {
    title: "先补 AI 可见性信号",
    summary: "优先完善 FAQ、结构化数据与 AI 引用信号，提升官网在 AI 搜索与推荐场景中的可见性。",
    nextFocus: "优先检查 FAQ、结构化数据（Schema）和可引用表达是否足够完整。",
  },
  content: {
    title: "先补内容资产与 FAQ 体系",
    summary: "补齐 FAQ、案例、专题页与洞察栏目，让内容从零散产出升级为可持续增长资产。",
    nextFocus: "优先确认 FAQ、案例与专题页是否形成体系。",
  },
  convert: {
    title: "先优化承接路径与转化入口",
    summary: "强化行动入口（CTA）、企微、电话与表单承接，让官网从被看见走向有效转化。",
    nextFocus: "优先检查高意向咨询动作是否足够清晰、顺手。",
  },
  trust: {
    title: "先补品牌可信度与信任信号",
    summary: "完善公司信息、资质备案、客户背书与媒体信号，增强官网商务可信度。",
    nextFocus: "优先补齐资质、备案、客户背书与公司信息。",
  },
};

function setPageMeta(title: string, description: string) {
  document.title = title;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", description);
  }
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
  if (window.wx) {
    return window.wx;
  }

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

function formatBeijingTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date).replace(/\//g, "-");
}

function scoreTone(score: number) {
  if (score >= 85) return "text-emerald-300";
  if (score >= 65) return "text-amber-200";
  return "text-rose-200";
}

function scoreSurface(score: number) {
  if (score >= 85) return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  if (score >= 65) return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  return "border-rose-300/20 bg-rose-300/10 text-rose-100";
}

function dimensionRisk(score: number) {
  if (score >= 85) return { label: "低风险", tone: "text-emerald-200", chip: "border-emerald-300/20 bg-emerald-300/10" };
  if (score >= 65) return { label: "中风险", tone: "text-amber-100", chip: "border-amber-300/20 bg-amber-300/10" };
  return { label: "高风险", tone: "text-rose-100", chip: "border-rose-300/20 bg-rose-300/10" };
}

function dimensionDiagnosis(score: number) {
  if (score >= 85) return "基础相对完整，适合继续扩大覆盖与稳定性。";
  if (score >= 65) return "基础可用，但仍有明显优化空间，适合优先补齐关键短板。";
  return "当前基础偏弱，建议先完成关键项补齐，再继续扩展内容与承接。";
}

function dimensionPriorityAction(key: string) {
  return dimensionAdviceMap[key] || "建议先补齐当前维度的关键基础项，再推进后续优化。";
}

function dimensionBusinessImpact(key: string) {
  return dimensionImpactMap[key] || {
    label: "更影响结果判断",
    summary: "这一维的基础情况会直接影响官网整体表现与后续升级判断。",
  };
}

function radarPoint(index: number, total: number, ratio: number, radius: number, center: number) {
  const angle = (-Math.PI / 2) + (Math.PI * 2 * index) / total;
  const x = center + Math.cos(angle) * radius * ratio;
  const y = center + Math.sin(angle) * radius * ratio;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

function pointTuple(index: number, total: number, ratio: number, radius: number, center: number) {
  return radarPoint(index, total, ratio, radius, center)
    .split(",")
    .map(Number) as [number, number];
}

function domainFromUrl(value?: string) {
  if (!value) return "";
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

function reportDisplayName(report?: GeoReport | null) {
  if (!report) return "企业官网";
  const company = report.input.company?.trim();
  if (company) return company;
  return domainFromUrl(report.result.checkedUrl || report.input.websiteUrl) || "企业官网";
}

function reportTitleText(report?: GeoReport | null) {
  if (!report) return "企业官网 GEO 详细诊断报告";
  const company = report.input.company?.trim();
  if (company) return `${company}官网 GEO 详细诊断报告`;
  const domain = domainFromUrl(report.result.checkedUrl || report.input.websiteUrl);
  if (domain) return `${domain} GEO 详细诊断报告`;
  return "企业官网 GEO 详细诊断报告";
}

function buildTrendPoint(index: number, total: number, score: number, width: number, height: number, padding: number) {
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const x = total <= 1 ? width / 2 : padding + (usableWidth * index) / (total - 1);
  const y = padding + usableHeight * (1 - Math.max(0, Math.min(100, score)) / 100);
  return [x, y] as const;
}

export default function GeoReportPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token || "";
  const [report, setReport] = useState<GeoReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessLocked, setAccessLocked] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");
  const [expandedDimensions, setExpandedDimensions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const canonicalUrl = `${siteOrigin}/geo-report/${token}/`;
    const shareUrl = `${siteOrigin}/api/lead/submit?share=geo-report&token=${encodeURIComponent(token)}`;
    setCanonical(canonicalUrl);
    setPageMeta(`${defaultReportTitle} | 坚果猫 JGMAO`, defaultReportDescription);
    setPropertyMeta("og:title", defaultReportTitle);
    setPropertyMeta("og:description", defaultReportDescription);
    setPropertyMeta("og:type", "website");
    setPropertyMeta("og:image", reportShareImage);
    setPropertyMeta("og:url", shareUrl);
    setNamedMeta("twitter:card", "summary_large_image");
    setNamedMeta("twitter:title", defaultReportTitle);
    setNamedMeta("twitter:description", defaultReportDescription);
    setNamedMeta("twitter:image", reportShareImage);
    setNamedMeta("robots", "noindex, nofollow, noarchive");
  }, [token]);

  useEffect(() => {
    if (!report) return;
    const titleText = reportTitleText(report);
    const description = defaultReportDescription;
    const shareUrl = `${siteOrigin}/api/lead/submit?share=geo-report&token=${encodeURIComponent(token)}`;
    setPageMeta(`${titleText} | 坚果猫 JGMAO`, description);
    setPropertyMeta("og:title", titleText);
    setPropertyMeta("og:description", description);
    setPropertyMeta("og:image", reportShareImage);
    setPropertyMeta("og:url", shareUrl);
    setNamedMeta("twitter:title", titleText);
    setNamedMeta("twitter:description", description);
    setNamedMeta("twitter:image", reportShareImage);
  }, [report]);

  useEffect(() => {
    if (typeof window === "undefined" || !report) {
      return;
    }

    const ua = window.navigator.userAgent || "";
    if (!/MicroMessenger/i.test(ua)) {
      return;
    }

    let cancelled = false;

    async function setupWechatShare() {
      try {
        const wx = await loadWechatSdk();
        if (!wx || cancelled) {
          return;
        }

        const pageUrl = window.location.href.split("#")[0];
        const response = await fetch("/api/wechat/share-config", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: pageUrl }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false || !payload?.config) {
          return;
        }

        const titleText = reportTitleText(report);
        const shareUrl = `${siteOrigin}/api/lead/submit?share=geo-report&token=${encodeURIComponent(token)}`;
        const sharePayload = {
          title: titleText,
          desc: defaultReportDescription,
          link: shareUrl,
          imgUrl: reportShareImage,
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
          if (cancelled) {
            return;
          }
          wx.updateAppMessageShareData?.(sharePayload);
          wx.updateTimelineShareData?.({
            title: titleText,
            link: shareUrl,
            imgUrl: reportShareImage,
          });
          wx.onMenuShareAppMessage?.(sharePayload);
          wx.onMenuShareTimeline?.({
            title: titleText,
            link: shareUrl,
            imgUrl: reportShareImage,
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
  }, [report, token]);

  useEffect(() => {
    let cancelled = false;
    let isFetching = false;

    async function fetchReport() {
      if (!token) {
        setError("报告链接无效。");
        setIsLoading(false);
        return;
      }

      if (isFetching) {
        return;
      }

      isFetching = true;

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
          throw new Error(payload?.error || "报告不存在或已过期。");
        }
        if (!cancelled) {
          setAccessLocked(Boolean(payload?.accessLocked));
          setAccessMessage(String(payload?.accessMessage || ""));
          setReport(payload.report as GeoReport);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "报告读取失败。");
          setAccessLocked(false);
          setAccessMessage("");
          setReport(null);
        }
      } finally {
        isFetching = false;
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    function refreshIfVisible() {
      if (document.visibilityState === "visible") {
        void fetchReport();
      }
    }

    void fetchReport();
    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);
    const timer = window.setInterval(() => {
      refreshIfVisible();
    }, 60000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [token]);

  const dimensionList = useMemo(() => report?.result.dimensions || [], [report]);
  const deepAdvice = useMemo(() => report?.result.deepAdvice || [], [report]);
  const weakestDimension = useMemo(
    () => [...dimensionList].sort((a, b) => a.score - b.score)[0] || null,
    [dimensionList],
  );
  const strongestDimension = useMemo(
    () => [...dimensionList].sort((a, b) => b.score - a.score)[0] || null,
    [dimensionList],
  );
  const adviceBuckets = useMemo(() => {
    const source = deepAdvice.length
      ? deepAdvice
      : report?.result.priorities.map((item, index) => ({
          priority: index === 0 ? 1 : index === 1 ? 2 : 3,
          title: item,
          summary: item,
        })) || [];

    return {
      immediate: source.filter((item) => item.priority <= 1),
      near: source.filter((item) => item.priority === 2),
      later: source.filter((item) => item.priority >= 3),
    };
  }, [deepAdvice, report?.result.priorities]);
  const diagnosticDirections = useMemo(() => {
    if (!dimensionList.length) return [];

    const weakestKeys = [...dimensionList]
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .map((dimension) => dimension.key);

    const picked = weakestKeys
      .map((key) => {
        const recommendation = diagnosticDirectionMap[key];
        return recommendation ? { key, ...recommendation } : null;
      })
      .filter((item): item is DiagnosticDirection => Boolean(item));

    if (!picked.length) {
      return [
        {
          key: "default",
          title: "先围绕关键短板聚焦诊断",
          summary: "围绕当前报告里的关键短板，优先补齐官网基础结构、FAQ 信号与承接路径。",
          nextFocus: "优先确认当前最弱维度里的基础项是否已补齐。",
        },
      ];
    }

    return picked;
  }, [dimensionList]);
  const managementSummary = useMemo(() => {
    if (!report) return null;
    const score = report.result.score;
    const currentState =
      score >= 85
        ? "官网 GEO 基础已经比较完整，适合从“基础合规”进入“内容增长与规模化覆盖”阶段。"
        : score >= 65
          ? "官网 GEO 基础可用，但主题结构、AI 信号与承接路径仍有明显优化空间。"
          : "官网 GEO 基础仍不稳定，建议先完成关键基础项补齐，再推进内容增长。";

    const coreGap = weakestDimension
      ? `${weakestDimension.title} 是当前最明显的短板，建议优先处理相关基础项与结构问题。`
      : "建议优先处理当前评分中的未通过项。";

    const firstMove = adviceBuckets.immediate[0]?.title
      || report.result.priorities[0]
      || "先完成基础结构、FAQ 与承接路径的关键补齐。";

    return {
      currentState,
      coreGap,
      firstMove: `建议先优先关注“${firstMove}”，更容易快速改善当前最明显的短板。`,
    };
  }, [adviceBuckets.immediate, report, weakestDimension]);
  const historySeries = useMemo(() => {
    return [...(report?.history || [])]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-10);
  }, [report?.history]);
  const radarRings = [0.25, 0.5, 0.75, 1];
  const radarViewBox = 264;
  const radarCenter = 132;
  const radarRadius = 64;
  const radarLabelRatio = 1.18;
  const radarPolygon = useMemo(() => {
    if (!dimensionList.length) return "";
    return dimensionList
      .map((dimension, index) =>
        radarPoint(index, dimensionList.length, Math.max(0.12, Math.min(1, dimension.score / 100)), radarRadius, radarCenter),
      )
      .join(" ");
  }, [dimensionList]);
  const trendWidth = 520;
  const trendHeight = 220;
  const trendPadding = 28;
  const trendPoints = useMemo(() => {
    return historySeries.map((item, index) =>
      buildTrendPoint(index, historySeries.length, item.score, trendWidth, trendHeight, trendPadding),
    );
  }, [historySeries]);
  const trendPolyline = useMemo(() => trendPoints.map(([x, y]) => `${x},${y}`).join(" "), [trendPoints]);
  const latestHistory = historySeries[historySeries.length - 1] || null;
  const previousHistory = historySeries.length > 1 ? historySeries[historySeries.length - 2] : null;
  const trendDelta = latestHistory && previousHistory ? latestHistory.score - previousHistory.score : 0;
  const titleName = reportDisplayName(report);
  const titleText = reportTitleText(report);

  useEffect(() => {
    if (!dimensionList.length) {
      setExpandedDimensions({});
      return;
    }

    const weakestKey = [...dimensionList].sort((a, b) => a.score - b.score)[0]?.key;
    if (!weakestKey) return;

    setExpandedDimensions((current) => {
      if (Object.keys(current).length > 0) {
        return current;
      }
      return { [weakestKey]: true };
    });
  }, [dimensionList]);

  function toggleDimension(key: string) {
    setExpandedDimensions((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(82,230,255,0.14),transparent_24%),radial-gradient(circle_at_90%_18%,rgba(245,197,92,0.12),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(181,146,255,0.12),transparent_28%),linear-gradient(180deg,#050816_0%,#091222_38%,#050816_100%)]" />
      <div className="pointer-events-none absolute inset-0 ops-grid opacity-20" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-5 pb-28 pt-8 sm:px-6 lg:px-10">
        <div className="flex justify-start">
          <JgmaoPageBrand />
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <article className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">企业官网 GEO 详细诊断报告</p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.45rem]">
              {report ? titleText : "企业官网 GEO 详细诊断报告"}
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-300">
              这份报告会从抓取基础、主题结构、AI 信号、内容资产与承接转化等维度，帮助快速看清官网当前的 GEO 基础表现，并明确当前更值得优先关注的问题与方向。
            </p>

            {isLoading ? (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">正在读取详细分析报告...</div>
            ) : null}

            {error ? (
              <div className="mt-6 rounded-[1.5rem] border border-rose-300/20 bg-rose-300/10 p-5 text-sm leading-7 text-rose-100">
                {error}
              </div>
            ) : null}

            {report && accessLocked ? (
              <div className="mt-6 flex min-h-[50vh] flex-col items-center justify-center rounded-[1.9rem] border border-amber-300/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.12),rgba(15,23,42,0.72))] px-6 py-8 text-center shadow-[0_18px_50px_rgba(245,158,11,0.12)]">
                <div className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-medium tracking-[0.18em] text-amber-100/85">
                  详细报告已锁定
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-white sm:text-[2rem]">重新添加企微解锁报告</h2>
                <p className="mt-3 max-w-[32rem] text-sm leading-7 text-amber-50/95">
                  {accessMessage || "你已不在当前企微客户关系中，请重新添加企微后继续查看详细报告。"}
                </p>
                <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/6 px-5 py-5 backdrop-blur-xl">
                  <p className="text-sm font-medium text-white">扫码添加企微客服</p>
                  <p className="mt-2 text-xs leading-6 text-slate-300">添加完成后，报告会自动恢复查看权限。</p>
                  <img
                    src={report.wecomClaim?.supportUrl || wecomSupportQrImage}
                    alt="坚果猫企微客服二维码"
                    className="mx-auto mt-4 h-44 w-44 rounded-2xl border border-white/10 bg-white p-2"
                  />
                </div>
              </div>
            ) : null}

            {report && !accessLocked ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">基础评分</p>
                  <div className="mt-3 flex items-end gap-3">
                    <span className={`text-5xl font-semibold tracking-tight ${scoreTone(report.result.score)}`}>{report.result.score}</span>
                    <span className="pb-1 text-sm text-slate-400">/ 100</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{report.result.level}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">官网名称</p>
                    <p className="mt-3 text-sm font-medium text-white break-all">{titleName}</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">官网地址</p>
                    <p className="mt-3 text-sm font-medium text-white break-all">{domainFromUrl(report.result.checkedUrl)}</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">诊断维度</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{dimensionList.length || 6}</p>
                  </div>
                </div>

                {managementSummary ? (
                  <div className="rounded-[1.6rem] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(14,165,233,0.08),rgba(15,23,42,0.78))] p-5 shadow-[0_18px_50px_rgba(8,145,178,0.16)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">报告摘要</p>
                        <h2 className="mt-2 text-xl font-semibold text-white">先看整体判断，再看重点问题</h2>
                      </div>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${scoreSurface(report.result.score)}`}>
                        当前评分 {report.result.score}/100
                      </span>
                    </div>
                    <div className="mt-5 grid gap-3">
                      <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/35 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">当前状态</p>
                        <p className="mt-2 text-sm leading-7 text-slate-100">{managementSummary.currentState}</p>
                      </div>
                      <div className="rounded-[1.25rem] border border-amber-300/20 bg-amber-300/10 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-amber-100/80">当前最需关注</p>
                        <p className="mt-2 text-sm leading-7 text-slate-100">{managementSummary.coreGap}</p>
                      </div>
                      <div className="rounded-[1.25rem] border border-cyan-300/20 bg-cyan-300/10 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">建议先做</p>
                        <p className="mt-2 text-sm leading-7 text-slate-100">{managementSummary.firstMove}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">报告信息</p>
                  <div className="mt-4 space-y-2 text-sm leading-7 text-slate-300">
                    <p>官网网址：{report.input.websiteUrl || "未填写"}</p>
                    <p>公司 / 品牌：{report.input.company || "未填写"}</p>
                    <p>姓名 / 称呼：{report.input.name || "未填写"}</p>
                    <p>联系方式：{report.input.contact || "未填写"}</p>
                    <p>提交时间：{formatBeijingTime(report.createdAt)}（北京时间）</p>
                  </div>
                </div>
              </div>
            ) : null}
          </article>

          <div className="space-y-5">
            {report && !accessLocked ? (
              <>
                <motion.article
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-[1.8rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                    <ShieldCheck className="h-4 w-4" />
                    六维诊断结果
                  </div>
                  <div className="mt-5 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
                    <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
                      <p className="text-sm font-semibold text-white">整体表现概览</p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">用 6 个关键维度快速判断官网 GEO 的基础完整度，越接近外圈，说明该维度基础越完整。</p>
                      {dimensionList.length ? (
                        <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-slate-950/45 p-3">
                          <svg viewBox={`0 0 ${radarViewBox} ${radarViewBox}`} className="mx-auto h-[264px] w-full max-w-[280px] overflow-visible">
                            {radarRings.map((ring) => (
                              <polygon
                                key={ring}
                                points={dimensionList.map((_, index) => radarPoint(index, dimensionList.length, ring, radarRadius, radarCenter)).join(" ")}
                                fill="none"
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="1"
                              />
                            ))}
                            {dimensionList.map((dimension, index) => (
                              <g key={dimension.key}>
                                {(() => {
                                  const [axisX, axisY] = pointTuple(index, dimensionList.length, 1, radarRadius, radarCenter);
                                  const [labelX, labelY] = pointTuple(index, dimensionList.length, radarLabelRatio, radarRadius, radarCenter);
                                  return (
                                    <>
                                <line
                                  x1={radarCenter}
                                  y1={radarCenter}
                                  x2={axisX}
                                  y2={axisY}
                                  stroke="rgba(255,255,255,0.08)"
                                  strokeWidth="1"
                                />
                                <text
                                  x={labelX}
                                  y={labelY}
                                  fill="rgba(226,232,240,0.92)"
                                  fontSize="8.5"
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  {dimensionLabelMap[dimension.key] || dimension.title}
                                </text>
                                    </>
                                  );
                                })()}
                              </g>
                            ))}
                            <polygon
                              points={radarPolygon}
                              fill="rgba(82,230,255,0.22)"
                              stroke="rgba(125,211,252,0.95)"
                              strokeWidth="2"
                            />
                            {dimensionList.map((dimension, index) => {
                              const point = radarPoint(
                                index,
                                dimensionList.length,
                                Math.max(0.12, Math.min(1, dimension.score / 100)),
                                radarRadius,
                                radarCenter,
                              ).split(",");
                              return (
                                <circle
                                  key={`${dimension.key}-point`}
                                  cx={Number(point[0])}
                                  cy={Number(point[1])}
                                  r="3.5"
                                  fill="rgb(103 232 249)"
                                />
                              );
                            })}
                          </svg>
                        </div>
                      ) : null}
                      {strongestDimension || weakestDimension ? (
                        <div className="mt-4 grid gap-3">
                          {strongestDimension ? (
                            <div className={`rounded-2xl border px-4 py-3 ${scoreSurface(strongestDimension.score)}`}>
                              <p className="text-xs uppercase tracking-[0.18em] opacity-70">当前相对较强</p>
                              <div className="mt-2 flex items-center justify-between gap-3">
                                <p className="text-sm font-medium">{strongestDimension.title}</p>
                                <span className="text-xs opacity-75">{strongestDimension.score}分</span>
                              </div>
                            </div>
                          ) : null}
                          {weakestDimension ? (
                            <div className={`rounded-2xl border px-4 py-3 ${scoreSurface(weakestDimension.score)}`}>
                              <p className="text-xs uppercase tracking-[0.18em] opacity-70">当前最需关注</p>
                              <div className="mt-2 flex items-center justify-between gap-3">
                                <p className="text-sm font-medium">{weakestDimension.title}</p>
                                <span className="text-xs opacity-75">{weakestDimension.score}分</span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="grid gap-4">
                    {dimensionList.map((dimension) => (
                      <div key={dimension.key} className="rounded-[1.45rem] border border-white/10 bg-white/5 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.16)]">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-white">{dimension.title}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                              {dimension.rawScore} / {dimension.maxScore}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-semibold ${scoreTone(dimension.score)}`}>{dimension.score}</span>
                            <div className="mt-1">
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] ${dimensionRisk(dimension.score).chip} ${dimensionRisk(dimension.score).tone}`}>
                                {dimensionRisk(dimension.score).label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300" style={{ width: `${dimension.score}%` }} />
                        </div>
                        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">当前判断</p>
                          <p className="mt-2 text-sm leading-7 text-slate-200">{dimensionDiagnosis(dimension.score)}</p>
                        </div>
                        <div className="mt-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">优先建议</p>
                          <p className="mt-2 text-sm leading-7 text-slate-100">{dimensionPriorityAction(dimension.key)}</p>
                        </div>
                        <div className="mt-3 rounded-2xl border border-violet-300/15 bg-violet-300/[0.06] px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-violet-100/70">业务影响</p>
                            <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-300/10 px-2.5 py-1 text-[11px] text-violet-100">
                              {dimensionBusinessImpact(dimension.key).label}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-7 text-slate-100">{dimensionBusinessImpact(dimension.key).summary}</p>
                        </div>
                        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/45">
                          <button
                            type="button"
                            onClick={() => toggleDimension(dimension.key)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                          >
                            <div>
                              <p className="text-sm font-medium text-white">检查项说明</p>
                              <p className="mt-1 text-xs leading-6 text-slate-400">
                                {expandedDimensions[dimension.key] ? "收起本维度的具体通过项与问题点" : "展开查看本维度的具体通过项与问题点"}
                              </p>
                            </div>
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200">
                              {expandedDimensions[dimension.key] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </span>
                          </button>
                          {expandedDimensions[dimension.key] ? (
                            <div className="space-y-2 border-t border-white/10 px-4 pb-4 pt-3">
                              {dimension.items.map((item) => (
                                <div key={item.key} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
                                  {item.ok ? (
                                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                                  ) : (
                                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-white">{item.label}</p>
                                    <p className="mt-1 text-sm leading-7 text-slate-300">{item.ok ? item.positive : item.negative}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                </motion.article>

                <motion.article
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="rounded-[1.8rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                    <Globe2 className="h-4 w-4" />
                    本次诊断结果
                  </div>
                  <div className="mt-5 grid gap-4">
                    <div className="rounded-[1.45rem] border border-emerald-300/20 bg-emerald-300/10 p-4 shadow-[0_10px_28px_rgba(16,185,129,0.08)]">
                      <p className="text-sm font-semibold text-emerald-100">当前表现较好的部分</p>
                      <div className="mt-3 space-y-2">
                        {report.result.strengths.map((item) => (
                          <p key={item} className="text-sm leading-7 text-slate-100">
                            • {item}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.45rem] border border-amber-300/20 bg-amber-300/10 p-4 shadow-[0_10px_28px_rgba(245,158,11,0.08)]">
                      <p className="text-sm font-semibold text-amber-100">当前优先关注的问题</p>
                      <div className="mt-3 space-y-2">
                        {report.result.priorities.map((item) => (
                          <p key={item} className="text-sm leading-7 text-slate-100">
                            • {item}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">建议优先处理顺序</p>
                        <span className="inline-flex rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-[11px] text-slate-300">
                          共 {adviceBuckets.immediate.length + adviceBuckets.near.length + adviceBuckets.later.length} 项重点建议
                        </span>
                      </div>
                      <div className="mt-3 space-y-4">
                        {[
                          { title: "立即改", items: adviceBuckets.immediate, tone: "border-rose-300/20 bg-rose-300/10 text-rose-100" },
                          { title: "近期改", items: adviceBuckets.near, tone: "border-amber-300/20 bg-amber-300/10 text-amber-100" },
                          { title: "后续扩展", items: adviceBuckets.later, tone: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100" },
                        ].map((bucket) => (
                          <div key={bucket.title} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-white">{bucket.title}</p>
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] ${bucket.tone}`}>
                                {bucket.items.length || 0} 项
                              </span>
                            </div>
                            <div className="mt-3 space-y-3">
                              {bucket.items.length ? bucket.items.map((item) => (
                                <div key={`${bucket.title}-${item.priority}-${item.title}`} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                  <p className="text-sm font-medium text-white">{item.title}</p>
                                  <p className="mt-2 text-sm leading-7 text-slate-300">{item.summary}</p>
                                </div>
                              )) : (
                                <p className="text-sm leading-7 text-slate-400">当前阶段暂无需要重点补充的事项。</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>

                {historySeries.length ? (
                  <motion.article
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.06 }}
                    className="rounded-[1.8rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                      <Globe2 className="h-4 w-4" />
                      历次评分趋势
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-white">总分变化</p>
                        <p className="mt-2 text-sm leading-7 text-slate-300">同一官网会持续复用这份报告链接；每次重新评分后，新的结果会刷新到这条趋势里。</p>
                        <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-3">
                          <svg viewBox={`0 0 ${trendWidth} ${trendHeight}`} className="w-full">
                            {[0, 25, 50, 75, 100].map((mark) => {
                              const y = trendPadding + (trendHeight - trendPadding * 2) * (1 - mark / 100);
                              return (
                                <g key={mark}>
                                  <line
                                    x1={trendPadding}
                                    y1={y}
                                    x2={trendWidth - trendPadding}
                                    y2={y}
                                    stroke="rgba(255,255,255,0.08)"
                                    strokeWidth="1"
                                  />
                                  <text x={8} y={y + 4} fill="rgba(148,163,184,0.88)" fontSize="10">
                                    {mark}
                                  </text>
                                </g>
                              );
                            })}
                            <polyline
                              fill="none"
                              stroke="rgba(125,211,252,0.98)"
                              strokeWidth="3"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              points={trendPolyline}
                            />
                            {trendPoints.map(([x, y], index) => (
                              <g key={`${historySeries[index]?.createdAt || index}`}>
                                <circle cx={x} cy={y} r="4" fill="rgb(103 232 249)" />
                                <text x={x} y={trendHeight - 8} textAnchor="middle" fill="rgba(226,232,240,0.82)" fontSize="10">
                                  {historySeries[index] ? formatBeijingTime(historySeries[index].createdAt).slice(5, 10) : ""}
                                </text>
                              </g>
                            ))}
                          </svg>
                        </div>
                      </div>
                      <div className="grid gap-3">
                        <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">最近评分次数</p>
                          <p className="mt-3 text-2xl font-semibold text-white">{historySeries.length}</p>
                        </div>
                        <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">最新分数变化</p>
                          <p className="mt-3 text-2xl font-semibold text-white">
                            {trendDelta > 0 ? `+${trendDelta}` : trendDelta}
                          </p>
                          <p className="mt-2 text-sm leading-7 text-slate-300">
                            {previousHistory ? "相较上一次评分的变化。" : "当前只有一次评分记录。"}
                          </p>
                        </div>
                        <div className="rounded-[1.35rem] border border-cyan-300/15 bg-cyan-300/[0.07] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">当前判断</p>
                          <p className="mt-2 text-sm leading-7 text-slate-100">
                            {trendDelta > 0
                              ? "官网基础表现正在改善，建议继续围绕当前短板持续补齐。"
                              : trendDelta < 0
                                ? "最近一次评分较上次有所回落，建议优先复查本次短板变化。"
                                : "当前分数与最近一次基本持平，适合继续沿当前方向推进。"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ) : null}

                <motion.article
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.07 }}
                  className="rounded-[1.8rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                    <Globe2 className="h-4 w-4" />
                    下一步优先方向
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-white">当前更适合先关注哪些方向</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    这份报告会先帮助看清问题集中在哪些维度、风险大概处于什么水平，以及当前更值得优先处理的方向。
                  </p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {diagnosticDirections.map((item) => (
                      <div key={item.key} className="rounded-[1.45rem] border border-white/10 bg-white/5 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-3 text-sm leading-7 text-slate-300">{item.summary}</p>
                        <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">建议先看</p>
                          <p className="mt-2 text-sm leading-7 text-slate-100">{item.nextFocus}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.article>

                <motion.article
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 }}
                  className="rounded-[1.8rem] border border-cyan-300/15 bg-cyan-300/[0.07] p-5 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-100/70">
                    <Globe2 className="h-4 w-4" />
                    如何理解这份报告
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-white">这份报告帮助先看清问题、风险与优先方向</h3>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
                    <p>当前报告聚焦 <span className="font-medium text-white">6 维诊断、风险等级、当前短板与优先方向</span>，帮助先判断官网 GEO 的基础现状。</p>
                    <p>它更适合回答 <span className="font-medium text-white">“问题主要集中在哪、哪些风险更值得先关注、下一步应先看什么”</span>。</p>
                    <p>如果希望继续推进，也可以再进入 <span className="font-medium text-white">页面级分析、具体改造清单与优先级路线图</span> 这类更深入的升级方案。</p>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">当前可以获得什么</p>
                      <p className="mt-2 text-sm leading-7 text-slate-200">6 维评分、雷达图、风险等级、当前表现较好的部分、当前短板与优先方向。</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-cyan-300/20 bg-cyan-300/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">如果继续推进</p>
                      <p className="mt-2 text-sm leading-7 text-slate-100">可进一步进入页面级分析、具体改造清单与优先级路线图，帮助把当前方向判断落实到更具体的执行动作。</p>
                    </div>
                  </div>
                </motion.article>
              </>
            ) : null}
          </div>
        </section>

        {report && !accessLocked ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-4 sm:px-6">
            <div className="mx-auto max-w-[1120px]">
              <div className="pointer-events-auto rounded-[1.4rem] border border-cyan-300/20 bg-slate-950/88 p-3 shadow-[0_-18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
	                <a
	                  href={report.paidPlanUrl || `/geo-upgrade/?report=${encodeURIComponent(report.token)}&plan=solution#solution-plan`}
	                  className="flex w-full items-center justify-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
	                >
	                  {report.paidPlanUrl ? "查看已购官网 GEO 优化方案" : "查看本次官网 GEO 优化方案"}
	                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
