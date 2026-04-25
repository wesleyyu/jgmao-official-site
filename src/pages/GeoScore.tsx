import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, CheckCircle2, Globe2, Phone, Sparkles, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

import logoImage from "@/assets/jgmao-logo-black-square.png";
import wecomSupportQrImage from "@/assets/wecom-support-qr.jpg";
import {
  geoScoreCanonicalPath,
  geoScoreWechatShareUrl,
  siteOrigin,
} from "@/lib/share";

const pageTitle = "企业官网 GEO 评分器";
const pageDescription = "输入官网网址，免费获取官网 GEO 基础评分，领取详细分析报告。";
const pageImage = `${siteOrigin}/geo-score-share-cover.png`;

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

const valuePoints = [
  "快速看清官网在 AI 可见性上的基础表现",
  "了解官网在抓取、主题结构与承接路径上的基础状态",
  "添加企微后，可继续查看 6 维完整诊断、风险等级与优先改进方向",
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

  async function handleSubmit() {
    const websiteUrl = form.websiteUrl.trim();
    const contact = form.contact.trim();
    const company = form.company.trim();
    const name = form.name.trim();

    setSubmitMessage("");
    setSubmitError("");
    setScoreResult(null);

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
      setSubmitMessage("基础评分已生成，添加企微后可继续查看更完整的诊断结果与优先改进方向。");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "提交失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(82,230,255,0.14),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(245,197,92,0.14),transparent_20%),linear-gradient(180deg,#050816_0%,#091222_45%,#050816_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-4 pb-32 pt-4">
        <div className="mb-4 flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.16em] text-slate-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回官网
          </Link>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 px-5 py-6 shadow-[0_22px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="flex items-center gap-3 opacity-90">
            <img src={logoImage} alt="坚果猫 JGMAO" className="h-10 w-10 rounded-2xl border border-white/10 object-cover" />
            <div>
              <p className="text-sm font-medium text-white">坚果猫 JGMAO</p>
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-6 text-[2rem] font-semibold leading-[1.08] tracking-tight text-white"
          >
            企业官网 GEO 评分器
          </motion.h1>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            输入官网网址，免费获取基础 GEO 评分；添加企微后，可继续领取更完整的分析结果。
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-100">
              官网 GEO 基础评分
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              快速识别官网关键短板
            </span>
          </div>
        </section>

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

        <section className="mt-5 rounded-[2rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">后续对接</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">添加企微，免费领取详细分析报告</h2>
          <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-sm font-medium text-white">扫码添加企微客服</p>
            <p className="mt-2 text-xs leading-6 text-slate-400">获取更完整的分析结果与一对一沟通</p>
            <img
              src={wecomSupportQrImage}
              alt="坚果猫企微客服二维码"
              className="mx-auto mt-4 h-40 w-40 rounded-2xl border border-white/10 bg-white p-2"
            />
          </div>
        </section>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4">
          <div className="pointer-events-auto flex w-full max-w-[430px] gap-3 rounded-[1.6rem] border border-white/10 bg-slate-950/78 p-3 shadow-[0_18px_48px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <a
              href="tel:400-9588-315"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-100"
            >
              <Phone className="h-4 w-4" />
              电话咨询
            </a>
            <a
              href="https://www.jgmao.com/"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200"
            >
              <Globe2 className="h-4 w-4" />
              查看官网
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
