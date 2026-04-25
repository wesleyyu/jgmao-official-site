import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, CheckCircle2, Globe2, ShieldCheck, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

import logoImage from "@/assets/jgmao-logo-black-square.png";
import wecomSupportQrImage from "@/assets/wecom-support-qr.jpg";
import { geoUpgradeCanonicalPath, siteOrigin } from "@/lib/share";

const pageTitle = "企业官网 GEO 升级方案 | 坚果猫 JGMAO";
const pageDescription =
  "更深入的 GEO 升级方案，覆盖页面级分析、具体改造清单与优先级路线图，帮助企业把官网升级为更可见、更可信、更可转化的增长入口。";
const pageImage = `${siteOrigin}/geo-score-share-cover.png`;

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

const solutionBlocks = [
  {
    title: "页面级分析",
    summary: "不只看首页，还会覆盖 FAQ、案例页、洞察页、联系页与关键专题页，帮助看清真正影响官网 GEO 的页面级问题。",
  },
  {
    title: "具体改造清单",
    summary: "明确建议补充哪些 FAQ、专题页、结构化数据（Schema）、信任信号与承接入口，帮助把问题判断进一步转化为可执行的改造方向。",
  },
  {
    title: "优先级路线图",
    summary: "把问题拆成立即处理、近期优化与后续扩展，帮助团队判断先改什么，以及如何更顺地推进官网升级。",
  },
];

const deliverables = [
  "全站 GEO 体检与页面级分析",
  "官网关键页面的优先改造方向",
  "FAQ、专题页、结构化数据与信任信号补齐方向",
  "更适合推进的承接路径与 CTA 优化方向",
];

const memberBenefits = [
  "成为网站系统会员，可免费获得专业版诊断报告",
  "后续支持定期复测、优化前后对比与新增页面检查",
  "FAQ、案例、洞察等内容资产可继续获得更新建议",
];

export default function GeoUpgradePage() {
  const canonicalUrl = `${siteOrigin}${geoUpgradeCanonicalPath}`;
  const [showWecomModal, setShowWecomModal] = useState(false);
  const [acquireMethod, setAcquireMethod] = useState<"wecom" | "pay">("wecom");

  useEffect(() => {
    setCanonical(canonicalUrl);
    setPageMeta(pageTitle, pageDescription);
    setPropertyMeta("og:title", pageTitle);
    setPropertyMeta("og:description", pageDescription);
    setPropertyMeta("og:type", "website");
    setPropertyMeta("og:image", pageImage);
    setPropertyMeta("og:url", canonicalUrl);
    setNamedMeta("twitter:card", "summary_large_image");
    setNamedMeta("twitter:title", pageTitle);
    setNamedMeta("twitter:description", pageDescription);
    setNamedMeta("twitter:image", pageImage);
  }, [canonicalUrl]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(82,230,255,0.14),transparent_24%),radial-gradient(circle_at_88%_14%,rgba(245,197,92,0.14),transparent_24%),radial-gradient(circle_at_50%_82%,rgba(181,146,255,0.12),transparent_28%),linear-gradient(180deg,#050816_0%,#091222_40%,#050816_100%)]" />
      <div className="pointer-events-none absolute inset-0 ops-grid opacity-20" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-5 pb-24 pt-8 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/geo-score/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/8">
            <ArrowLeft className="h-4 w-4" />
            返回评分器
          </Link>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-300/15"
          >
            访问官网
            <Sparkles className="h-4 w-4" />
          </a>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <img src={logoImage} alt="坚果猫 JGMAO" className="h-8 w-8 rounded-xl object-cover" />
              <span className="text-sm font-medium text-white">坚果猫 JGMAO</span>
            </div>

            <p className="mt-5 text-xs uppercase tracking-[0.22em] text-slate-400">专业版升级方案</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-[2.5rem]">
              企业官网 GEO 升级方案
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-300">
              专业版不是更详细的报告，而是一份可执行的企业官网 GEO 升级方案。
            </p>
            <p className="mt-3 text-base leading-8 text-slate-300">
              它会进一步回答哪些页面该优先分析、哪些模块该优先改，以及如何分阶段推进官网 GEO 升级。
            </p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-[1.35rem] border border-cyan-300/20 bg-cyan-300/10 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">适合哪些企业团队</p>
                <p className="mt-2 text-sm leading-7 text-slate-100">
                  适合已经完成基础评分与详细诊断，并准备继续推进官网 GEO 升级、页面改造与承接优化的企业团队。
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">将进一步获得什么</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">
                  进一步获得页面级分析、具体改造清单与优先级路线图，帮助判断官网升级应从哪里开始。
                </p>
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
              <ShieldCheck className="h-4 w-4" />
              专业版会进一步覆盖
            </div>
            <div className="mt-5 grid gap-4">
              {solutionBlocks.map((block) => (
                <div key={block.title} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
                  <p className="text-base font-semibold text-white">{block.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{block.summary}</p>
                </div>
              ))}
            </div>
          </motion.article>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="rounded-[1.9rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
              <Globe2 className="h-4 w-4" />
              你将进一步获得
            </div>
            <div className="mt-5 grid gap-3">
              {deliverables.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <p className="text-sm leading-7 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="rounded-[1.9rem] border border-cyan-300/15 bg-cyan-300/[0.07] p-5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-100/70">
              <CheckCircle2 className="h-4 w-4" />
              网站系统会员权益
            </div>
            <div className="mt-5 space-y-3">
              {memberBenefits.map((item) => (
                <div key={item} className="rounded-[1.3rem] border border-white/10 bg-slate-950/35 px-4 py-4">
                  <p className="text-sm leading-7 text-slate-100">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-[1.4rem] border border-emerald-300/20 bg-emerald-300/10 p-4">
                <p className="text-sm font-semibold text-emerald-100">网站系统会员</p>
                <p className="mt-2 text-sm leading-7 text-slate-100">
                  成为网站系统会员，可免费获得专业版诊断报告，并继续享有定期复测、优化前后对比与新增页面检查等持续权益。
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-amber-300/20 bg-amber-300/10 p-4">
                <p className="text-sm font-semibold text-amber-100">单独获取专业版</p>
                <p className="mt-2 text-sm leading-7 text-slate-100">
                  如果当前还不准备进入网站系统会员，也可以单独获取专业版，进一步获得页面级分析、具体改造清单与优先级路线图。
                </p>
              </div>
            </div>
          </motion.article>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1120px] items-center justify-center">
          <button
            type="button"
            onClick={() => {
              setAcquireMethod("wecom");
              setShowWecomModal(true);
            }}
            className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/15 px-6 py-3 text-sm font-medium text-cyan-50 transition hover:bg-cyan-300/20"
          >
            获取专业版方案
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showWecomModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/78 px-5 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#071224] p-6 shadow-[0_24px_80px_rgba(2,8,23,0.55)]">
            <button
              type="button"
              onClick={() => setShowWecomModal(false)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">获取专业版方案</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAcquireMethod("wecom")}
                className={`rounded-[1.2rem] border px-4 py-3 text-sm font-medium transition ${
                  acquireMethod === "wecom"
                    ? "border-cyan-300/25 bg-cyan-300/15 text-cyan-50"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/8"
                }`}
              >
                添加企微获取
              </button>
              <button
                type="button"
                onClick={() => setAcquireMethod("pay")}
                className={`rounded-[1.2rem] border px-4 py-3 text-sm font-medium transition ${
                  acquireMethod === "pay"
                    ? "border-amber-300/25 bg-amber-300/15 text-amber-50"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/8"
                }`}
              >
                微信支付获取
              </button>
            </div>

            {acquireMethod === "wecom" ? (
              <>
                <h2 className="mt-5 text-2xl font-semibold text-white">扫码添加企微</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  添加企微后，可继续沟通专业版获取方式、会员权益与官网 GEO 升级推进方向。
                </p>
                <div className="mt-6 flex justify-center rounded-[1.5rem] border border-white/10 bg-white p-4">
                  <img
                    src={wecomSupportQrImage}
                    alt="坚果猫企微客服二维码"
                    className="h-56 w-56 rounded-2xl object-cover"
                  />
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-[1.6rem] border border-amber-300/20 bg-amber-300/10 p-5">
                <h2 className="text-2xl font-semibold text-white">微信支付获取</h2>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  微信支付获取入口正在接入中。当前如需尽快获取专业版方案，建议先通过企微沟通，我们会继续同步支付入口。
                </p>
                <button
                  type="button"
                  onClick={() => setAcquireMethod("wecom")}
                  className="mt-5 inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/15 px-5 py-2.5 text-sm font-medium text-cyan-50 transition hover:bg-cyan-300/20"
                >
                  先添加企微获取
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
