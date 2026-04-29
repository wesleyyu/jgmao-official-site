import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle2, Globe2, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

import GrowthEntryFloating from "@/components/GrowthEntryFloating";
import JgmaoPageBrand from "@/components/JgmaoPageBrand";
import wecomSupportQrImage from "@/assets/wecom-support-qr.png";
import { geoUpgradeCanonicalPath, siteOrigin } from "@/lib/share";

const pageTitle = "企业官网 GEO 升级方案 | 坚果猫 JGMAO";
const pageDescription =
  "覆盖页面级分析、具体改造清单与优先级路线图，帮助企业把官网升级为更可见、更可信、更可转化的增长入口。";
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
  {
    title: "业务影响判断",
    summary: "进一步判断当前问题更影响 AI 可见性、官网承接、咨询转化还是商务信任，帮助团队明确哪些问题最值得优先投入。",
  },
];

const deliverables = [
  "全站 GEO 体检与页面级分析",
  "官网关键页面的优先改造方向",
  "FAQ、专题页、结构化数据与信任信号补齐方向",
  "官网承接路径与行动入口优化方向",
  "AI 可见性、官网承接、咨询转化与商务信任的业务影响判断",
];

const servicePlans = [
  {
    name: "优化方案",
    price: "99元/次",
    tone: "border-white/10 bg-white/5",
    titleTone: "text-white",
    summary: "适合先按次获取一份当前官网的具体升级建议，快速明确先改什么、从哪里开始。",
    features: [
      "本次官网的具体优化方案交付页",
      "页面级问题分析",
      "本次优先改造方向",
      "FAQ、专题页、结构化数据补齐建议",
      "承接路径与行动入口优化建议",
    ],
  },
  {
    name: "坚果猫AI增长引擎标准版",
    price: "1299 元/月",
    tone: "border-cyan-300/20 bg-cyan-300/10",
    titleTone: "text-cyan-100",
    summary: "适合把官网升级、内容增长与智能获客串成持续系统，长期推进官网增长。",
    features: [
      "GEO 官网系统",
      "可信内容发布系统",
      "知识库系统",
      "智能获客系统",
      "AI 智能体服务系统",
      "官网 GEO 详细诊断报告",
      "官网 GEO 升级方案",
    ],
  },
];

type GeoPlanOrder = {
  orderNo: string;
  planKey: "solution" | "standard";
  planTitle: string;
  amountFen: number;
  amountLabel: string;
  status: string;
  paymentStatus: "ready" | "not_configured" | "paid";
  paymentMessage: string;
  planUrl?: string;
  reportToken?: string;
  reportUrl?: string;
  websiteUrl?: string;
  company?: string;
  contact?: string;
  createdAt: string;
  updatedAt: string;
};

function buildSolutionSuccessUrl(order: GeoPlanOrder) {
  const orderQuery = `paid=1&orderNo=${encodeURIComponent(order.orderNo)}`;
  if (order.reportToken) {
    return `${window.location.origin}/geo-plan/${encodeURIComponent(order.reportToken)}/?${orderQuery}`;
  }
  return `${window.location.origin}/geo-plan/?${orderQuery}`;
}

export default function GeoUpgradePage() {
  const canonicalUrl = `${siteOrigin}${geoUpgradeCanonicalPath}`;
  const searchParams = new URLSearchParams(window.location.search);
  const reportToken = searchParams.get("report")?.trim() || "";
  const [showWecomModal, setShowWecomModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"solution" | "standard">("standard");
  const [solutionOrder, setSolutionOrder] = useState<GeoPlanOrder | null>(null);
  const [solutionOrderLoading, setSolutionOrderLoading] = useState(false);
  const [solutionOrderError, setSolutionOrderError] = useState("");

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

    if (
      window.location.hash === "#solution-plan"
      || window.location.hash === "#standard-plan"
      || searchParams.get("plan") === "solution"
      || searchParams.get("plan") === "standard"
    ) {
      window.setTimeout(() => {
        const targetId = window.location.hash === "#standard-plan" || searchParams.get("plan") === "standard" ? "standard-plan" : "solution-plan";
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 80);
    }
  }, [canonicalUrl]);

  async function createSolutionOrder() {
    setSolutionOrderLoading(true);
    setSolutionOrderError("");
    try {
      const response = await fetch("/api/lead/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "geo-plan-order-create",
          planKey: "solution",
          reportToken,
          source: "geo-upgrade",
          page: reportToken ? `/geo-upgrade/?report=${reportToken}&plan=solution` : "/geo-upgrade/",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false || !payload?.order) {
        throw new Error(payload?.error || "订单创建失败，请稍后再试。");
      }
      setSolutionOrder(payload.order as GeoPlanOrder);
    } catch (error) {
      setSolutionOrderError(error instanceof Error ? error.message : "订单创建失败，请稍后再试。");
      setSolutionOrder(null);
    } finally {
      setSolutionOrderLoading(false);
    }
  }

  async function openSolutionPayModal() {
    setSelectedPlan("solution");
    setShowWecomModal(true);
    await createSolutionOrder();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(82,230,255,0.14),transparent_24%),radial-gradient(circle_at_88%_14%,rgba(245,197,92,0.14),transparent_24%),radial-gradient(circle_at_50%_82%,rgba(181,146,255,0.12),transparent_28%),linear-gradient(180deg,#050816_0%,#091222_40%,#050816_100%)]" />
      <div className="pointer-events-none absolute inset-0 ops-grid opacity-20" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-5 pb-24 pt-8 sm:px-6 lg:px-10">
        <div className="flex justify-start">
          <JgmaoPageBrand />
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">官网升级与系统方案</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-[2.5rem]">
              企业官网 GEO 升级方案
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-300">
              帮助企业从详细诊断走向页面级分析、改造清单与优先级路线图。
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
              本页会进一步覆盖
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
              方案与开通方式
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              如果你希望把评分、诊断与官网升级继续串起来，可以先从按次优化方案或持续系统方案里选择更合适的一种。
            </p>

            <div className="mt-5 grid gap-3">
              {servicePlans.map((plan) => {
                if (plan.name === "优化方案") {
                  return (
                    <div
                      id="solution-plan"
                      key={plan.name}
                      className={`rounded-[1.4rem] border p-4 text-left ${plan.tone}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-sm font-semibold ${plan.titleTone}`}>{plan.name}</p>
                        <p className="text-base font-semibold text-white">{plan.price}</p>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">按次获取</p>
                      <p className="mt-2 text-sm leading-7 text-slate-100">{plan.summary}</p>
                      <div className="mt-3 grid gap-2">
                        {plan.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-2">
                            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                            <p className="text-sm leading-6 text-slate-100">{feature}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => {
                            void openSolutionPayModal();
                          }}
                          className="inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/15 px-4 py-2.5 text-sm font-medium text-cyan-50 transition hover:bg-cyan-300/20 sm:col-span-2"
                        >
                          微信支付获取
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
	                  <div
	                    key={plan.name}
	                    id="standard-plan"
	                    className={`rounded-[1.4rem] border p-4 text-left ${plan.tone}`}
	                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-sm font-semibold ${plan.titleTone}`}>{plan.name}</p>
                      <p className="text-base font-semibold text-white">{plan.price}</p>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">持续系统服务</p>
                    <p className="mt-2 text-sm leading-7 text-slate-100">{plan.summary}</p>
                    <div className="mt-3 grid gap-2">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2">
                          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                          <p className="text-sm leading-6 text-slate-100">{feature}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan("standard");
                        setShowWecomModal(true);
                      }}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/15 px-4 py-2.5 text-sm font-medium text-cyan-50 transition hover:bg-cyan-300/20"
                    >
                      添加企微客服开通
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.article>
        </section>
      </div>

      <GrowthEntryFloating />

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
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">
              {selectedPlan === "solution" ? "微信支付获取" : "获取方案与开通方式"}
            </p>

            {selectedPlan === "solution" ? (
              <div className="mt-5 rounded-[1.6rem] border border-amber-300/20 bg-amber-300/10 p-5">
                <h2 className="text-2xl font-semibold text-white">微信支付获取</h2>
                {solutionOrderLoading ? (
                  <p className="mt-3 text-sm leading-7 text-slate-200">正在为本次官网 GEO 优化方案创建订单，请稍候。</p>
                ) : solutionOrderError ? (
                  <>
                    <p className="mt-3 text-sm leading-7 text-rose-100">{solutionOrderError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        void createSolutionOrder();
                      }}
                      className="mt-5 inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/15 px-5 py-2.5 text-sm font-medium text-cyan-50 transition hover:bg-cyan-300/20"
                    >
                      重新创建订单
                    </button>
                  </>
                ) : solutionOrder ? (
                  <>
                    <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-slate-950/45 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-400">订单编号</span>
                        <span className="text-sm font-semibold text-white">{solutionOrder.orderNo}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-400">当前方案</span>
                        <span className="text-sm text-slate-100">{solutionOrder.planTitle}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-400">订单金额</span>
                        <span className="text-sm font-semibold text-amber-100">{solutionOrder.amountLabel}</span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-200">{solutionOrder.paymentMessage}</p>
                    {solutionOrder.paymentStatus === "paid" ? (
                      <a
                        href={solutionOrder.planUrl || buildSolutionSuccessUrl(solutionOrder)}
                        className="mt-5 inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                      >
                        查看已购优化方案
                      </a>
                    ) : solutionOrder.paymentStatus === "not_configured" ? (
	                      <p className="mt-3 text-sm leading-7 text-slate-300">
	                        当前先保留这笔预订单。支付链路完成后，这里会直接拉起本次 99 元按次支付。
	                      </p>
                    ) : (
	                      <button
	                        type="button"
	                        onClick={() => {
	                          const returnUrl = buildSolutionSuccessUrl(solutionOrder);
	                          window.location.href = `/api/lead/submit?payment=start&orderNo=${encodeURIComponent(solutionOrder.orderNo)}&returnUrl=${encodeURIComponent(returnUrl)}`;
	                        }}
                        className="mt-5 inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/15 px-5 py-2.5 text-sm font-medium text-cyan-50 transition hover:bg-cyan-300/20"
                      >
                        立即微信支付
                      </button>
                    )}
                  </>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    当前可通过微信支付获取本次官网 GEO 优化方案。系统会先生成本次订单，再继续拉起微信支付。
                  </p>
                )}
              </div>
            ) : (
              <>
                <h2 className="mt-5 text-2xl font-semibold text-white">扫码添加企微</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  添加企微后，可继续确认标准版系统方案的适用范围、开通内容与推进节奏。
                </p>
                <div className="mt-6 flex justify-center rounded-[1.5rem] border border-white/10 bg-white p-4">
                  <img
                    src={wecomSupportQrImage}
                    alt="坚果猫企微客服二维码"
                    className="h-56 w-56 rounded-2xl object-cover"
                  />
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  适合希望把官网升级、内容增长与智能获客系统持续串起来推进的企业团队。
                </p>
              </>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
