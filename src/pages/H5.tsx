import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BadgeCheck, Globe, LayoutTemplate, Mail, Phone, Radar, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

import growthFlywheelImage from "@/assets/h5-growth-flywheel.jpg";
import logoImage from "@/assets/jgmao-logo-black-square.png";

const siteUrl = "https://www.jgmao.com";

const painPoints = [
  {
    title: "AI 搜索中看不见",
    body: "企业明明有产品、有服务，但在 AI 搜索与推荐场景里缺少稳定可见性。",
    icon: Radar,
  },
  {
    title: "官网既难被看见，也难以转化",
    body: "官网内容缺少清晰结构与 GEO 能力，既不容易被 AI 理解和推荐，也难以承接高意向用户。",
    icon: LayoutTemplate,
  },
  {
    title: "内容做了很多，但没有形成增长资产",
    body: "内容持续产出，却缺少统一结构、主题沉淀与长期复用，难以支撑 AI 可见性、官网承接与持续获客。",
    icon: Sparkles,
  },
];

const solutions = [
  {
    title: "提升 AI 可见性",
    body: "让企业内容更容易被 AI 理解、引用与推荐，持续扩大在 AI 搜索场景中的品牌曝光与内容触达。",
  },
  {
    title: "重构官网承接与转化",
    body: "让官网从展示页面升级为可解释、可信、可转化的增长入口。",
  },
  {
    title: "建立内容与获客闭环",
    body: "把内容资产、线索承接、转化路径与推荐反馈连成一个可持续优化的增长系统。",
  },
];

const trustPoints = [
  "国家高新技术企业",
  "清华系基金合伙人战略投资",
  "核心技术曾获北京市科委专项基金支持，并获新华社视频专题报道",
];

const brands = ["奥迪", "沃尔沃", "壳牌", "美孚", "佳通轮胎", "PICC", "中国平安", "中信保诚"];

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

export default function H5LandingPage() {
  const [leadForm, setLeadForm] = useState({
    name: "",
    company: "",
    contact: "",
    demand: "",
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitMessage, setLeadSubmitMessage] = useState("");
  const [leadSubmitError, setLeadSubmitError] = useState("");

  useEffect(() => {
    const pageTitle = "帮助企业构建 AI 时代的增长飞轮 | 坚果猫 JGMAO";
    const pageDescription = "帮助企业把 AI 可见性、内容、官网、获客与推荐反馈连成一个可持续运转的增长系统。";
    const shareImageUrl = `${siteUrl}/h5-share-cover.jpg`;
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/h5";

    setCanonical(`${siteUrl}${currentPath === "/ai-growth" ? "/ai-growth" : "/h5"}`);
    setPageMeta(pageTitle, pageDescription);
    setPropertyMeta("og:title", pageTitle);
    setPropertyMeta("og:description", pageDescription);
    setPropertyMeta("og:type", "website");
    setPropertyMeta("og:image", shareImageUrl);
    setPropertyMeta("og:url", `${siteUrl}${currentPath === "/ai-growth" ? "/ai-growth" : "/h5"}`);
    setNamedMeta("twitter:card", "summary_large_image");
    setNamedMeta("twitter:title", pageTitle);
    setNamedMeta("twitter:description", pageDescription);
    setNamedMeta("twitter:image", shareImageUrl);
  }, []);

  async function handleLeadSubmit() {
    const name = leadForm.name.trim();
    const company = leadForm.company.trim();
    const contact = leadForm.contact.trim();
    const demand = leadForm.demand.trim();

    setLeadSubmitMessage("");
    setLeadSubmitError("");

    if (!contact || !demand) {
      setLeadSubmitError("请至少填写联系方式和需求简述。");
      return;
    }

    setIsSubmittingLead(true);

    try {
      const response = await fetch("/api/lead/submit", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name,
          company,
          contact,
          demand,
          source: "h5",
          page: "/h5",
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "提交失败，请稍后再试。");
      }

      setLeadForm({
        name: "",
        company: "",
        contact: "",
        demand: "",
      });
      setLeadSubmitMessage("需求已提交，我们会尽快与你联系。");
    } catch (error) {
      setLeadSubmitError(error instanceof Error ? error.message : "提交失败，请稍后再试。");
    } finally {
      setIsSubmittingLead(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(82,230,255,0.16),transparent_26%),radial-gradient(circle_at_80%_18%,rgba(245,197,92,0.14),transparent_20%),linear-gradient(180deg,#050816_0%,#091222_42%,#050816_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-4 pb-28 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.16em] text-slate-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回官网
          </Link>
          <a
            href="tel:400-9588-315"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-cyan-100"
          >
            <Phone className="h-3.5 w-3.5" />
            立即沟通
          </a>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 px-5 py-6 shadow-[0_22px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="flex items-center gap-3 opacity-90">
            <img src={logoImage} alt="坚果猫 JGMAO" className="h-10 w-10 rounded-2xl border border-white/10 object-cover" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">JGMao AI Growth Engine</p>
              <p className="mt-1 text-sm font-medium text-white">坚果猫 JGMAO</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(145deg,rgba(10,22,36,0.96),rgba(18,34,52,0.78))] p-2 shadow-[0_18px_54px_rgba(0,0,0,0.28)]">
            <div className="relative overflow-hidden rounded-[1.45rem] border border-white/10 bg-[#09111f]">
              <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(4,8,18,0.12)_0%,rgba(4,8,18,0.52)_28%,rgba(4,8,18,0.82)_62%,rgba(4,8,18,0.96)_100%)]" />
              <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(82,230,255,0.14),transparent_34%),radial-gradient(circle_at_78%_24%,rgba(245,197,92,0.14),transparent_22%)]" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-[radial-gradient(circle_at_bottom,rgba(8,16,30,0.92),transparent_72%)]" />
              <img
                src={growthFlywheelImage}
                alt="AI 时代增长飞轮主视觉"
                className="block h-[360px] w-full object-cover object-center"
              />

              <div className="absolute inset-x-0 top-[7.4rem] z-20 p-5">
                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="max-w-[15rem] text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-white"
                >
                  帮助企业构建
                  <br />
                  <span className="bg-gradient-to-r from-cyan-200 via-amber-100 to-violet-200 bg-clip-text text-transparent">
                    AI 时代的增长飞轮
                  </span>
                </motion.h1>

                <p className="mt-4 max-w-[16rem] text-sm leading-7 text-slate-200">
                  把 AI 可见性、内容、官网、获客与推荐反馈连成一个可持续运转的增长系统。
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-100">
              让企业在 AI 搜索里被看见
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              适合提升 AI 可见性、官网 GEO 与内容增长能力的团队
            </span>
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">为什么现在需要</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">企业常见的 3 个增长断点</h2>
          <div className="mt-5 space-y-3">
            {painPoints.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{item.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">我们怎么做</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">用一套 AI 增长系统，把问题变成结果</h2>
          <div className="mt-5 space-y-3">
            {solutions.map((item, index) => (
              <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 text-sm font-semibold text-amber-100">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">为什么值得信任</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">跨越行业，赢得领先品牌的长期信任</h2>
          <div className="mt-5 space-y-3">
            {trustPoints.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-100" />
                <p className="text-sm leading-7 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {brands.map((brand) => (
              <span key={brand} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                {brand}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] border border-cyan-300/20 bg-[linear-gradient(145deg,rgba(10,22,36,0.94),rgba(16,31,48,0.86))] p-5 shadow-[0_22px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">下一步怎么开始</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">告诉我们你的行业场景、官网现状与增长诉求</h2>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            如果你也在寻找 AI 时代更有效的增长方式，欢迎现在联系我们。
          </p>

          <div className="mt-5 grid gap-3">
            <label className="rounded-[1.3rem] border border-white/10 bg-white/10 px-4 py-3">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">姓名 / 称呼</span>
              <input
                value={leadForm.name}
                onChange={(event) => setLeadForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="怎么称呼你"
                className="mt-2 w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </label>
            <label className="rounded-[1.3rem] border border-white/10 bg-white/10 px-4 py-3">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">公司 / 品牌</span>
              <input
                value={leadForm.company}
                onChange={(event) => setLeadForm((current) => ({ ...current, company: event.target.value }))}
                placeholder="你的公司或品牌名称"
                className="mt-2 w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </label>
            <label className="rounded-[1.3rem] border border-white/10 bg-white/10 px-4 py-3">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">联系方式</span>
              <input
                value={leadForm.contact}
                onChange={(event) => setLeadForm((current) => ({ ...current, contact: event.target.value }))}
                placeholder="手机号 / 微信 / 邮箱"
                className="mt-2 w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </label>
            <label className="rounded-[1.3rem] border border-white/10 bg-white/10 px-4 py-3">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">需求简述</span>
              <textarea
                value={leadForm.demand}
                onChange={(event) => setLeadForm((current) => ({ ...current, demand: event.target.value }))}
                placeholder="比如行业场景、官网现状、增长目标或合作方向"
                rows={4}
                className="mt-2 w-full resize-none bg-transparent text-sm leading-7 text-white placeholder:text-slate-500 focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={handleLeadSubmit}
              disabled={isSubmittingLead}
              className="inline-flex items-center justify-between rounded-[1.3rem] border border-cyan-300/20 bg-cyan-300/10 px-4 py-4 text-sm font-medium text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {isSubmittingLead ? "提交中..." : "提交需求"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {leadSubmitMessage ? <p className="text-sm leading-7 text-cyan-100">{leadSubmitMessage}</p> : null}
            {leadSubmitError ? <p className="text-sm leading-7 text-rose-200">{leadSubmitError}</p> : null}
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/92 p-3 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[430px] gap-3">
          <a
            href="tel:400-9588-315"
            className="flex-1 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-center text-sm font-medium text-cyan-100"
          >
            电话咨询
          </a>
          <a
            href="https://www.jgmao.com"
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-full border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-medium text-white"
          >
            查看官网
          </a>
        </div>
      </div>
    </main>
  );
}
