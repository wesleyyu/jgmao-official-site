import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle2, Globe2, Sparkles, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

import GrowthEntryFloating from "@/components/GrowthEntryFloating";
import JgmaoPageBrand from "@/components/JgmaoPageBrand";
import wecomSupportQrImage from "@/assets/wecom-support-qr.png";
import {
  geoScoreCanonicalPath,
  geoScoreWechatShareUrl,
  siteOrigin,
} from "@/lib/share";

const pageTitle = "企业官网 GEO 评分器";
const pageDescription = "输入官网网址，免费获取官网 GEO 基础评分，领取详细分析报告。";
const pageImage = `${siteOrigin}/geo-score-share-cover.png`;
const recentReportStorageKey = "jgmao.geoScore.recentReportToken";

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

async function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("当前环境不支持复制。");
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("复制失败。");
  }
}

function buildWecomClaimPrompt(relationshipStatus?: string, accessLocked?: boolean) {
  if (relationshipStatus === "removed" || accessLocked) {
    return "请重新添加企微客服，继续免费获得详细报告。";
  }
  return "请添加企微客服，免费获得详细报告。";
}

function readRecentReportToken() {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    return window.localStorage.getItem(recentReportStorageKey)?.trim() || "";
  } catch {
    return "";
  }
}

function writeRecentReportToken(token: string) {
  if (typeof window === "undefined" || !token) {
    return;
  }
  try {
    window.localStorage.setItem(recentReportStorageKey, token);
  } catch {
    // noop
  }
}

function clearRecentReportToken(token?: string) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const current = window.localStorage.getItem(recentReportStorageKey)?.trim() || "";
    if (!token || current === token) {
      window.localStorage.removeItem(recentReportStorageKey);
    }
  } catch {
    // noop
  }
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

type ScoreResult = {
  score: number;
  level: string;
  strengths: string[];
  priorities: string[];
  checkedUrl: string;
};

type ReportMeta = {
  token: string;
  reportUrl: string;
  reportStatus: string;
  unchangedWithin24h: boolean;
  accessLocked?: boolean;
  accessMessage?: string;
  wecomClaim?: {
    claimToken: string;
    status: string;
    deliveredAt: string;
    supportUrl?: string;
    sourceType?: string;
    relationshipStatus?: string;
  };
};

const valuePoints = [
  "快速看清官网在 AI 可见性上的基础表现",
  "了解官网在抓取、主题结构与承接路径上的基础状态",
  "可继续通过添加企微免费获取详细报告，查看 6 维完整诊断、风险等级与优先改进方向",
];

export default function GeoScorePage() {
  const [form, setForm] = useState({
    websiteUrl: "",
    contact: "",
    company: "",
    name: "",
  });
  const [scoreCountLabel, setScoreCountLabel] = useState("100+");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [reportMeta, setReportMeta] = useState<ReportMeta | null>(null);
  const [isCopyingAccessLink, setIsCopyingAccessLink] = useState(false);
  const [accessLinkFeedback, setAccessLinkFeedback] = useState("");
  const [accessLinkCopied, setAccessLinkCopied] = useState(false);
  const [accessEntryHighlighted, setAccessEntryHighlighted] = useState(false);
  const [wecomPromptHighlighted, setWecomPromptHighlighted] = useState(false);
  const reportTokenFromQuery = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("report")?.trim() || ""
    : "";
  const [recentReportToken] = useState(() => (reportTokenFromQuery ? "" : readRecentReportToken()));
  const activeReportToken = reportTokenFromQuery || recentReportToken;
  const isReportUnlocked = Boolean(
    reportMeta?.token
      && reportMeta.wecomClaim?.status === "delivered"
      && !reportMeta.accessLocked,
  );

  function replaceWithReportEntryUrl(token: string) {
    if (typeof window === "undefined" || !token) {
      return;
    }
    const nextUrl = `${window.location.pathname}?report=${encodeURIComponent(token)}`;
    if (window.location.search === `?report=${encodeURIComponent(token)}`) {
      return;
    }
    window.history.replaceState({}, "", nextUrl);
  }

  useEffect(() => {
    setCanonical(`${siteOrigin}${geoScoreCanonicalPath}`);
    setPageMeta(pageTitle, pageDescription);
    setPropertyMeta("og:title", pageTitle);
    setPropertyMeta("og:description", pageDescription);
    setPropertyMeta("og:type", "website");
    setPropertyMeta("og:image", pageImage);
    setPropertyMeta("og:url", `${siteOrigin}${geoScoreCanonicalPath}`);
    setNamedMeta("twitter:card", "summary_large_image");
    setNamedMeta("twitter:title", pageTitle);
    setNamedMeta("twitter:description", pageDescription);
    setNamedMeta("twitter:image", pageImage);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
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

        const sharePayload = {
          title: pageTitle,
          desc: pageDescription,
          link: geoScoreWechatShareUrl,
          imgUrl: pageImage,
        };

        wx.ready(() => {
          if (cancelled) {
            return;
          }
          wx.updateAppMessageShareData?.(sharePayload);
          wx.updateTimelineShareData?.({
            title: pageTitle,
            link: geoScoreWechatShareUrl,
            imgUrl: pageImage,
          });
          wx.onMenuShareAppMessage?.(sharePayload);
          wx.onMenuShareTimeline?.({
            title: pageTitle,
            link: geoScoreWechatShareUrl,
            imgUrl: pageImage,
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const response = await fetch("/api/lead/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ type: "geo-score-stats" }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false) {
          return;
        }
        if (!cancelled && typeof payload?.displayCount === "string" && payload.displayCount.trim()) {
          setScoreCountLabel(payload.displayCount.trim());
        }
      } catch {
        // noop
      }
    }

    void fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeReportToken) {
      return;
    }

    let cancelled = false;

    async function loadExistingReport() {
      try {
        const response = await fetch("/api/lead/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ type: "geo-report-fetch", token: activeReportToken }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false || !payload?.report || cancelled) {
          clearRecentReportToken(activeReportToken);
          return;
        }

        const report = payload.report;
        setScoreResult(report.result as ScoreResult);
        setReportMeta({
          token: String(report.token || activeReportToken),
          reportUrl: String(report.reportUrl || ""),
          reportStatus: String(report.reportStatus || ""),
          unchangedWithin24h: Boolean(report.unchangedWithin24h),
          accessLocked: Boolean(payload?.accessLocked),
          accessMessage: String(payload?.accessMessage || ""),
          wecomClaim: {
            claimToken: String(report.wecomClaim?.claimToken || ""),
            status: String(report.wecomClaim?.status || "pending"),
            deliveredAt: String(report.wecomClaim?.deliveredAt || ""),
            supportUrl: String(report.wecomClaim?.supportUrl || ""),
            sourceType: String(report.wecomClaim?.sourceType || ""),
            relationshipStatus: String(report.wecomClaim?.relationshipStatus || "pending"),
          },
        });
        setForm((current) => ({
          ...current,
          websiteUrl: current.websiteUrl || String(report.input?.websiteUrl || report.result?.checkedUrl || ""),
          contact: current.contact || String(report.input?.contact || ""),
          company: current.company || String(report.input?.company || ""),
          name: current.name || String(report.input?.name || ""),
        }));
        writeRecentReportToken(String(report.token || activeReportToken));
        const relationshipStatus = String(report.wecomClaim?.relationshipStatus || "pending");
        const claimStatus = String(report.wecomClaim?.status || "pending");
        if (claimStatus === "delivered" && !payload?.accessLocked) {
          setSubmitMessage(reportTokenFromQuery ? "已读取你的专属入口链接，可继续查看当前评分结果与详细报告。" : "已找到你上次的评分记录，可直接查看详细报告。");
        } else {
          setSubmitMessage(`${reportTokenFromQuery ? "已读取你的专属入口链接" : "已找到你上次的评分记录"}，${buildWecomClaimPrompt(relationshipStatus, Boolean(payload?.accessLocked))}`);
        }
      } catch {
        // noop
      }
    }

    void loadExistingReport();
    return () => {
      cancelled = true;
    };
  }, [activeReportToken, reportTokenFromQuery]);

  useEffect(() => {
    const token = reportMeta?.token || reportTokenFromQuery;
    const claimStatus = reportMeta?.wecomClaim?.status || "";
    const relationshipStatus = reportMeta?.wecomClaim?.relationshipStatus || "";
    if (!token || (claimStatus === "delivered" && relationshipStatus !== "removed")) {
      return;
    }

    let cancelled = false;
    const timer = window.setInterval(() => {
      void (async () => {
        try {
          const response = await fetch("/api/lead/submit", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ type: "geo-report-fetch", token }),
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok || payload?.ok === false || !payload?.report || cancelled) {
            return;
          }
          const report = payload.report;
          if (String(report.wecomClaim?.status || "") !== "delivered") {
            return;
          }
          setReportMeta((current) => current ? ({
            ...current,
            token: String(report.token || current.token || token),
            reportUrl: String(report.reportUrl || current.reportUrl || ""),
            reportStatus: String(report.reportStatus || current.reportStatus || ""),
            unchangedWithin24h: Boolean(report.unchangedWithin24h),
            accessLocked: Boolean(payload?.accessLocked),
            accessMessage: String(payload?.accessMessage || ""),
            wecomClaim: {
              claimToken: String(report.wecomClaim?.claimToken || current.wecomClaim?.claimToken || ""),
              status: String(report.wecomClaim?.status || "delivered"),
              deliveredAt: String(report.wecomClaim?.deliveredAt || ""),
              supportUrl: String(report.wecomClaim?.supportUrl || current.wecomClaim?.supportUrl || ""),
              sourceType: String(report.wecomClaim?.sourceType || current.wecomClaim?.sourceType || ""),
              relationshipStatus: String(report.wecomClaim?.relationshipStatus || current.wecomClaim?.relationshipStatus || "pending"),
            },
          }) : current);
          setSubmitMessage(String(payload?.accessLocked)
            ? (String(payload?.accessMessage || "") || "请重新添加企微客服，继续免费获得详细报告。")
            : "企微领取已完成，你现在可以直接查看详细报告。");
        } catch {
          // noop
        }
      })();
    }, 8000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [reportMeta?.token, reportMeta?.wecomClaim?.status, reportTokenFromQuery]);

  async function handleSubmit() {
    const websiteUrl = form.websiteUrl.trim();
    const contact = form.contact.trim();
    const company = form.company.trim();
    const name = form.name.trim();

    setSubmitMessage("");
    setSubmitError("");
    setScoreResult(null);
    setReportMeta(null);

    if (!websiteUrl || !contact) {
      setSubmitError("请至少填写官网网址和联系方式。");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/lead/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "geo-score",
          websiteUrl,
          contact,
          company,
          name,
          source: "geo-score-h5",
          page: "/geo-score/",
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false || !payload?.result) {
        throw new Error(payload?.error || "提交失败，请稍后再试。");
      }

      setScoreResult(payload.result as ScoreResult);
      const nextReportMeta: ReportMeta = {
        token: String(payload.reportToken || ""),
        reportUrl: String(payload.reportUrl || ""),
        reportStatus: String(payload.reportStatus || ""),
        unchangedWithin24h: Boolean(payload.unchangedWithin24h),
        accessLocked: Boolean(payload.accessLocked),
        accessMessage: String(payload.accessMessage || ""),
        wecomClaim: {
          claimToken: String(payload.wecomClaim?.claimToken || ""),
          status: String(payload.wecomClaim?.status || "pending"),
          deliveredAt: String(payload.wecomClaim?.deliveredAt || ""),
          supportUrl: String(payload.wecomClaim?.supportUrl || ""),
          sourceType: String(payload.wecomClaim?.sourceType || ""),
          relationshipStatus: String(payload.wecomClaim?.relationshipStatus || "pending"),
        },
      };
      setReportMeta(nextReportMeta);
      if (nextReportMeta.token) {
        writeRecentReportToken(nextReportMeta.token);
        replaceWithReportEntryUrl(nextReportMeta.token);
      }
      setSubmitMessage("基础评分已生成，已为你生成专属入口链接，可继续通过添加企微免费获取详细报告。");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "提交失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyAccessLink() {
    if (!reportMeta?.token) return;
    const accessUrl = `${siteOrigin}/geo-score/?report=${encodeURIComponent(reportMeta.token)}`;
    try {
      setIsCopyingAccessLink(true);
      await copyText(accessUrl);
      setAccessLinkCopied(true);
      setAccessLinkFeedback("专属入口链接已复制，可直接发给自己保存。");
      setSubmitMessage("你的专属入口链接已复制，下次直接打开这条链接即可继续查看当前评分结果。");
      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          setAccessLinkCopied(false);
        }, 1800);
      }
    } catch {
      setAccessLinkCopied(false);
      setAccessLinkFeedback("当前环境无法直接复制，已为你弹出专属入口链接，请手动复制保存。");
      if (typeof window !== "undefined") {
        window.prompt("请手动复制你的专属入口链接", accessUrl);
      }
      setSubmitError("复制失败，请手动长按复制你的专属入口链接。");
    } finally {
      setIsCopyingAccessLink(false);
    }
  }

  function handleOpenAccessEntry() {
    if (!reportMeta?.token) return;
    const accessUrl = `${siteOrigin}/geo-score/?report=${encodeURIComponent(reportMeta.token)}`;
    const needsWecomClaim = reportMeta.wecomClaim?.status !== "delivered" || reportMeta.accessLocked;
    if (needsWecomClaim) {
      const prompt = buildWecomClaimPrompt(reportMeta.wecomClaim?.relationshipStatus, reportMeta.accessLocked);
      setWecomPromptHighlighted(true);
      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          setWecomPromptHighlighted(false);
        }, 1800);
      }
      if (reportMeta.accessMessage) {
        setAccessLinkFeedback("");
        setSubmitMessage("");
      } else {
        setAccessLinkFeedback(prompt);
        setSubmitMessage(prompt);
      }
      if (typeof window !== "undefined") {
        window.location.hash = "geo-wecom-claim";
      }
      return;
    }
    if (typeof window !== "undefined") {
      setAccessEntryHighlighted(true);
      window.setTimeout(() => {
        setAccessEntryHighlighted(false);
      }, 1800);
      if (reportMeta.reportUrl) {
        window.location.href = reportMeta.reportUrl;
        return;
      }
      if (window.location.search !== `?report=${encodeURIComponent(reportMeta.token)}`) {
        window.location.href = accessUrl;
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(82,230,255,0.14),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(245,197,92,0.14),transparent_20%),linear-gradient(180deg,#050816_0%,#091222_45%,#050816_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-4 pb-32 pt-4">
        <div className="mb-4 flex justify-start">
          <JgmaoPageBrand />
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 px-5 py-6 shadow-[0_22px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-6 text-[2rem] font-semibold leading-[1.08] tracking-tight text-white"
          >
            企业官网 GEO 评分器
          </motion.h1>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            输入官网网址，免费获取基础 GEO 评分，查看官网在 AI 抓取、理解与采信中的基础表现；添加企微后可继续免费获取详细报告。
          </p>
          {reportTokenFromQuery ? (
            <p className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs leading-6 text-cyan-100">
              当前正通过你的专属入口链接访问，可直接查看这份报告的解锁状态与后续入口。
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-100">
              官网 AI 采信基础评分
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              快速识别官网 AI 采信关键短板
            </span>
          </div>
	        </section>

	        {reportMeta?.token ? (
	          <section className="mt-5 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-5 backdrop-blur-xl">
		            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">最近一次评分</p>
		            <h2 className="mt-3 text-xl font-semibold text-white">
		              {isReportUnlocked ? "可继续查看详细报告" : "详细报告待解锁"}
		            </h2>
		            <p className="mt-2 text-sm leading-6 text-cyan-50/85">
		              {isReportUnlocked
		                ? "已识别到你上次提交并完成企微解锁的报告，可直接继续查看。"
		                : buildWecomClaimPrompt(reportMeta.wecomClaim?.relationshipStatus, reportMeta.accessLocked)}
		            </p>
	            <button
	              type="button"
	              onClick={handleOpenAccessEntry}
		              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
		            >
		              {isReportUnlocked ? "查看详细报告" : "重新添加企微解锁报告"}
		            </button>
		          </section>
		        ) : null}

	        {reportMeta?.token && !isReportUnlocked ? (
	        <section className="mt-5 rounded-[2rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl">
	          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">你将获得什么</p>
          <div className="mt-4 space-y-3">
            {valuePoints.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-white/5 p-3.5">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                <p className="text-sm leading-6 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
	        </section>
	        ) : null}

        <section className="mt-5 rounded-[2rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">填写信息</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">提交官网，立即查看评分</h2>

	          <div className="mt-5 space-y-3">
	            {[
	              { key: "websiteUrl", label: "官网网址", placeholder: "例如：https://www.example.com" },
              { key: "contact", label: "联系方式", placeholder: "微信 / 手机 / 邮箱" },
              { key: "company", label: "公司 / 品牌（选填）", placeholder: "例如：某保险公司" },
              { key: "name", label: "姓名 / 称呼（选填）", placeholder: "例如：王先生" },
            ].map((field) => (
              <label key={field.key} className="block">
                <span className="mb-2 block text-sm text-slate-300">{field.label}</span>
                <input
                  value={form[field.key as keyof typeof form]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:bg-white/[0.07]"
                  placeholder={field.placeholder}
                />
	              </label>
	            ))}
	          </div>

		          {submitMessage ? <p className="mt-4 text-sm text-emerald-300">{submitMessage}</p> : null}
          {submitError ? <p className="mt-4 text-sm text-rose-300">{submitError}</p> : null}

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          >
            {isSubmitting ? "正在生成评分..." : "立即获取基础 GEO 评分"}
            <Sparkles className="h-4 w-4" />
          </button>
          <p className="mt-3 text-center text-xs leading-6 text-slate-400">
            已为 {scoreCountLabel} 个官网完成评分
          </p>
        </section>

        {scoreResult ? (
          <section className="mt-5 rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/70">评分结果</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-5xl font-semibold leading-none text-white">{scoreResult.score}</p>
                <p className="mt-2 text-sm text-emerald-50/90">{scoreResult.level}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-right text-xs text-emerald-50/85">
                <p>检测网址</p>
                <p className="mt-1 max-w-[11rem] break-all text-[11px] leading-5 text-white">{scoreResult.checkedUrl}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/10 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                  当前亮点
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-50/90">
                  {scoreResult.strengths.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/10 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <TriangleAlert className="h-4 w-4 text-amber-200" />
                  优先改进
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-50/90">
                  {scoreResult.priorities.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

	        {reportMeta?.token && !isReportUnlocked ? (
	        <section className="mt-5 rounded-[2rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl">
	          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">后续对接</p>
	          <h2 className="mt-3 text-2xl font-semibold text-white">免费解锁详细分析报告</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            添加企微免费获取详细报告。
          </p>
          <div className="mt-5 grid gap-3">
            <div
              id="geo-wecom-claim"
              className="rounded-[1.6rem] border border-cyan-300/20 bg-cyan-300/10 p-4 text-center shadow-[0_12px_30px_rgba(34,211,238,0.08)]"
            >
              <p className="text-sm font-medium text-white">扫码添加企微客服</p>
              <p className="mt-2 text-xs leading-6 text-cyan-50/85">添加后自动解锁详细报告，并进入一对一沟通</p>
              <img
                src={reportMeta?.wecomClaim?.supportUrl || wecomSupportQrImage}
                alt="坚果猫企微客服二维码"
                className="mx-auto mt-4 h-40 w-40 rounded-2xl border border-white/10 bg-white p-2"
              />
              {reportMeta?.token ? (
                <div className="mt-4 space-y-3 text-left">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs leading-6 text-slate-300">
                    已为你生成专属入口，方便后续继续查看当前评分状态与报告解锁进度。
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAccessEntry}
                    className={`inline-flex w-full items-center justify-center rounded-full border px-4 py-3 text-sm font-semibold transition ${
                      accessEntryHighlighted
                        ? "border-cyan-200/40 bg-cyan-200/20 text-white"
                        : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/15"
                    }`}
                  >
                    {accessEntryHighlighted
                      ? (reportMeta.wecomClaim?.status === "delivered" && !reportMeta.accessLocked ? "正在打开详细报告..." : "正在打开你的专属入口...")
                      : (reportMeta.wecomClaim?.status === "delivered" && !reportMeta.accessLocked ? "查看详细报告" : "打开我的专属入口")}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCopyAccessLink()}
                    disabled={isCopyingAccessLink}
                    className={`inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      accessLinkCopied
                        ? "border border-emerald-300/30 bg-emerald-300/15 text-emerald-100"
                        : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {isCopyingAccessLink ? "正在复制..." : accessLinkCopied ? "专属入口链接已复制" : "复制专属入口链接"}
                  </button>
                  {accessLinkFeedback ? (
                    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs leading-6 text-cyan-50">
                      {accessLinkFeedback}
                    </div>
                  ) : null}
                  {reportMeta.accessMessage && !accessLinkFeedback ? (
                    <div
                      className={`rounded-2xl px-3 py-2 text-xs leading-6 transition ${
                        wecomPromptHighlighted
                          ? "border border-amber-200/35 bg-amber-200/15 text-white shadow-[0_0_0_1px_rgba(253,230,138,0.16)]"
                          : "border border-white/10 bg-white/5 text-slate-300"
                      }`}
                    >
                      {reportMeta.accessMessage}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
	          </div>
	        </section>
	        ) : null}

	        {!reportMeta?.token ? (
	          <section className="mt-5 rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-5 backdrop-blur-xl">
	            <h2 className="text-2xl font-semibold text-white">还没有官网？</h2>
	            <p className="mt-2 text-sm leading-6 text-amber-50/85">
	              可以先制作一个适合 GEO 的企业官网，再进行评分、诊断与优化。
	            </p>
	            <Link
	              href="/website-create/"
	              className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-amber-200/30 bg-amber-200/15 px-4 py-3 text-sm font-medium text-amber-50 transition hover:bg-amber-200/20"
	            >
	              立即了解官网生成
	            </Link>
	          </section>
	        ) : null}

        <GrowthEntryFloating />
      </div>
    </main>
  );
}
