import { ArrowLeft, BadgeCheck, CheckCircle2, FlaskConical, Leaf, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

import healthHeroImage from "@/assets/demo-health-consumer-hero.svg";
import healthLifestyleImage from "@/assets/demo-health-consumer-lifestyle.svg";
import wecomSupportQrImage from "@/assets/wecom-support-qr.png";
import { siteOrigin } from "@/lib/share";

const pageTitle = "青养研营养健康官网 Demo | 坚果猫 JGMAO";
const pageDescription = "一个可对外展示、可交互的健康消费行业虚拟品牌官网 Demo，展示产品、科普、信任背书与购买咨询等模块。";

const productCards = [
  {
    title: "轻养营养粉",
    desc: "面向日常营养补充场景，突出配方结构、适用人群与食用建议。",
    tone: "cream" as const,
    ingredients: "植物蛋白、膳食纤维、复合维生素",
    scenario: "早餐、运动后、忙碌办公日",
  },
  {
    title: "植物膳食纤维",
    desc: "适合需要建立成分认知和使用场景说明的功能食品页面。",
    tone: "green" as const,
    ingredients: "菊粉、抗性糊精、苹果纤维",
    scenario: "外食较多、蔬果摄入不足、日常轻负担",
  },
  {
    title: "睡眠支持软糖",
    desc: "以生活方式内容承接产品认知，避免过度功效化表达。",
    tone: "amber" as const,
    ingredients: "酸枣仁提取物、茶氨酸、维生素 B6",
    scenario: "睡前仪式、差旅作息、压力管理",
  },
];

const scienceTopics = ["营养补充适合哪些人群", "如何看懂产品成分表", "功能食品和普通食品有什么区别", "如何建立长期健康管理习惯"];
const trustSignals = ["检测报告展示区", "品牌资质与备案信息", "用户反馈与使用场景", "常见问题与风险提示"];

function setMeta() {
  const canonicalUrl = `${siteOrigin}/website-create/health-consumer-demo/`;
  document.title = pageTitle;

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute("content", pageDescription);
  }

  const ensureProperty = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("property", property);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };

  let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", canonicalUrl);

  ensureProperty("og:title", pageTitle);
  ensureProperty("og:description", pageDescription);
  ensureProperty("og:type", "website");
  ensureProperty("og:url", canonicalUrl);
  ensureProperty("og:image", `${siteOrigin}/geo-score-share-cover.png`);
}

export default function HealthConsumerDemoPage() {
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const selectedProduct = productCards[selectedProductIndex] ?? productCards[0];

  useEffect(() => {
    setMeta();
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f2e8] text-[#1c241a]">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_12%_18%,rgba(119,168,99,0.32),transparent_28%),linear-gradient(135deg,#f9f3e5_0%,#e7f1dd_58%,#f6ead9_100%)] px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <nav className="fixed inset-x-4 top-4 z-40 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-[1.6rem] border border-white/70 bg-white/82 px-5 py-3 shadow-xl shadow-black/8 backdrop-blur-xl">
            <a href="#" className="inline-flex items-center gap-2 font-semibold text-[#24331f]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#24331f] text-sm text-white">青</span>
              青养研
            </a>
            <div className="flex flex-wrap gap-3 text-sm font-medium text-[#53614d]">
              <Link href="/website-create/" className="inline-flex items-center gap-1 transition hover:text-[#24331f]">
                <ArrowLeft className="h-3.5 w-3.5" />
                行业起点
              </Link>
              <a href="#products" className="transition hover:text-[#24331f]">产品</a>
              <a href="#science" className="transition hover:text-[#24331f]">科普</a>
              <a href="#trust" className="transition hover:text-[#24331f]">信任信号</a>
              <a href="#consult" className="transition hover:text-[#24331f]">购买咨询</a>
            </div>
            <a href="#consult" className="inline-flex items-center justify-center rounded-full bg-[#24331f] px-4 py-2 text-sm font-semibold text-white">
              咨询购买
            </a>
          </nav>

          <div className="mt-24 grid gap-8 pb-14 pt-6 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#dfeecf] px-4 py-2 text-sm font-semibold text-[#405b33]">
                <Leaf className="h-4 w-4" />
                虚拟品牌示例，不代表真实客户案例
              </div>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-[#162214] md:text-6xl">
                青养研营养健康官网样例
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-9 text-[#3f4b38]">
                这是一个基于健康消费行业常见结构生成的演示样例，用来展示 AI 如何组织品牌介绍、产品说明、科普内容、信任背书和购买咨询入口。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#consult" className="inline-flex items-center justify-center rounded-full bg-[#24331f] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#24331f]/20">
                咨询购买方式
              </a>
              <a href="#products" className="inline-flex items-center justify-center rounded-full border border-[#24331f]/10 bg-white/75 px-6 py-3 text-sm font-semibold text-[#24331f]">
                查看产品
              </a>
            </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-2xl shadow-[#5d7645]/15 backdrop-blur">
              <ProductHeroImage />
              <div className="mt-4 rounded-[1.5rem] bg-[#24331f] p-5 text-white">
                <p className="text-sm text-[#d7efc3]">品牌首页框架</p>
                <h2 className="mt-3 text-3xl font-semibold">营养补充，不止看成分，也看长期习惯</h2>
                <div className="mt-5 grid gap-3">
                  {["品牌定位", "核心产品", "适用人群", "购买咨询"].map((item) => (
                    <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-[#f4ffe9]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-4 rounded-2xl bg-[#fff7e8] px-4 py-3 text-sm leading-6 text-[#6a5636]">
                样例重点：避免夸大功效，用品牌、成分、科普、资质和 FAQ 建立可信内容资产。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="structure" className="mx-auto grid max-w-6xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-4">
        {[
          { icon: Leaf, title: "品牌介绍", desc: "讲清品牌理念、适用人群和健康生活方式定位。" },
          { icon: FlaskConical, title: "产品说明", desc: "展示成分来源、食用方式、适用场景和注意事项。" },
          { icon: Sparkles, title: "科普内容", desc: "沉淀营养知识、常见误区和长期使用建议。" },
          { icon: ShieldCheck, title: "信任背书", desc: "补齐检测报告、资质备案、用户反馈与品牌背书。" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-[1.6rem] border border-[#24331f]/10 bg-white p-5 shadow-sm">
              <Icon className="h-6 w-6 text-[#6f964d]" />
              <h3 className="mt-4 text-xl font-semibold text-[#182416]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#56604f]">{item.desc}</p>
            </article>
          );
        })}
      </section>

      <section id="products" className="mx-auto grid max-w-6xl gap-6 px-5 pb-10 sm:px-8 lg:grid-cols-[1fr_0.9fr]">
        <article className="rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-[#6f964d]">产品内容资产</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#182416]">产品页不只介绍商品，也承接 AI 理解</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {productCards.map((product, index) => (
              <button
                key={product.title}
                type="button"
                onClick={() => setSelectedProductIndex(index)}
                className={`rounded-[1.4rem] text-left transition ${
                  selectedProductIndex === index ? "ring-2 ring-[#6f964d] ring-offset-4 ring-offset-white" : "hover:-translate-y-0.5"
                }`}
              >
                <ProductImage title={product.title} tone={product.tone} />
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-[1.6rem] border border-[#24331f]/10 bg-[#fbf8ef] p-5">
            <p className="text-xl font-semibold text-[#24331f]">{selectedProduct.title}</p>
            <p className="mt-3 text-sm leading-7 text-[#596250]">{selectedProduct.desc}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="text-xs font-semibold text-[#6f964d]">示例成分说明</p>
                <p className="mt-2 text-sm text-[#24331f]">{selectedProduct.ingredients}</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="text-xs font-semibold text-[#6f964d]">适用场景</p>
                <p className="mt-2 text-sm text-[#24331f]">{selectedProduct.scenario}</p>
              </div>
            </div>
          </div>
        </article>

        <article id="science" className="rounded-[2rem] bg-[#24331f] p-6 text-white shadow-sm">
          <LifestyleImage />
          <p className="text-sm font-semibold text-[#d7efc3]">科普与 FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold">让用户和 AI 都更容易理解品牌</h2>
          <div className="mt-6 grid gap-3">
            {scienceTopics.map((topic) => (
              <div key={topic} className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-[#f4ffe9]">
                {topic}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section id="trust" className="mx-auto grid max-w-6xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[0.9fr_1fr]">
        <article className="rounded-[2rem] border border-[#6f964d]/20 bg-[#e8f3dc] p-6">
          <p className="text-sm font-semibold text-[#516d3d]">信任信号</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#182416]">健康消费品牌需要先建立可信依据</h2>
          <TrustImage />
          <div className="mt-6 grid gap-3">
            {trustSignals.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/65 px-4 py-3">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#6f964d]" />
                <p className="text-sm leading-6 text-[#3d4936]">{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article id="consult" className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0ce] px-4 py-2 text-sm font-semibold text-[#7a5a1c]">
            <MessageCircle className="h-4 w-4" />
            下一步
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-[#182416]">按健康消费行业生成官网框架</h2>
          <p className="mt-4 text-sm leading-7 text-[#56604f]">
            添加企微客服后，可以基于企业实际品牌、产品、资质、内容素材和获客目标，生成更贴近业务的官网框架与内容填充方向。
          </p>
          <div className="mt-5 rounded-[1.5rem] border border-[#24331f]/10 bg-[#fbf8ef] p-4">
            <img src={wecomSupportQrImage} alt="坚果猫企微客服二维码" className="mx-auto h-48 w-48 rounded-2xl object-cover" />
            <p className="mt-3 text-center text-sm font-semibold text-[#24331f]">扫码添加企微客服</p>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-32 sm:px-8">
        <div className="rounded-[1.6rem] border border-[#b5894e]/20 bg-[#fff7e8] p-5 text-sm leading-7 text-[#6a5636]">
          <p className="font-semibold text-[#7a5a1c]">演示与健康信息说明</p>
          <p className="mt-2">
            本页面为虚拟品牌官网 Demo，用于展示健康消费行业官网可包含的页面结构、内容资产和信任信号，不代表真实客户案例。页面中的产品、成分、场景和反馈均为示例内容，不构成医疗建议，也不替代医生、营养师或其他专业人士意见。
          </p>
        </div>
      </section>
      <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-3xl rounded-[1.4rem] border border-white/70 bg-white/88 p-3 shadow-2xl shadow-black/15 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-[#24331f]">想生成类似健康消费官网？可直接添加企微确认品牌、产品和内容素材。</p>
          <a href="#consult" className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#24331f] px-5 py-2.5 text-sm font-semibold text-white">
            咨询生成
          </a>
        </div>
      </div>
    </main>
  );
}

function ProductHeroImage() {
  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.85),transparent_24%),linear-gradient(145deg,#d8e9c4_0%,#f8edd4_58%,#c3d7a7_100%)] p-6">
      <img src={healthHeroImage} alt="健康消费官网产品与生活方式示意图" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#24331f]/20 via-transparent to-white/10" />
      <div className="relative flex h-full min-h-[270px] items-end justify-between">
        <div className="rounded-3xl bg-white/82 px-4 py-3 shadow-lg shadow-[#728f56]/15 backdrop-blur">
          <p className="text-xs font-semibold text-[#536d42]">核心产品图</p>
          <p className="mt-1 text-lg font-semibold text-[#24331f]">轻养营养粉</p>
        </div>
        <div className="grid gap-2">
          {["低糖配方", "植物营养", "日常补充"].map((item) => (
            <span key={item} className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#526d45] shadow-sm">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductImage({ title, tone }: { title: string; tone: "cream" | "green" | "amber" }) {
  const toneClass = {
    cream: "from-[#f8edcf] to-[#d8e6c6]",
    green: "from-[#dcebd0] to-[#a9c38d]",
    amber: "from-[#ffe1a8] to-[#d8c397]",
  }[tone];

  return (
    <div className={`relative min-h-48 overflow-hidden rounded-[1.4rem] bg-gradient-to-br ${toneClass} p-4 shadow-inner`}>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/35" />
      <div className="relative mx-auto mt-4 h-28 w-20 rounded-[1.4rem] border border-white/70 bg-white/70 shadow-xl shadow-[#526d45]/15">
        <div className="mx-auto mt-5 h-9 w-9 rounded-full bg-[#dfeecf]" />
        <div className="mx-auto mt-4 h-2 w-12 rounded-full bg-[#24331f]/60" />
        <div className="mx-auto mt-2 h-1.5 w-9 rounded-full bg-[#7d9d5c]/65" />
      </div>
      <p className="relative mt-4 text-center text-sm font-semibold text-[#24331f]">{title}</p>
    </div>
  );
}

function LifestyleImage() {
  return (
    <div className="mb-5 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#e8f3dc_0%,#f4d69f_100%)] p-4 text-[#24331f]">
      <div className="relative min-h-56 overflow-hidden rounded-[1.2rem]">
        <img src={healthLifestyleImage} alt="健康消费品牌生活方式内容示意图" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/76 via-white/34 to-transparent" />
        <div className="relative max-w-sm p-5">
          <p className="text-xs font-semibold text-[#6f8c55]">生活方式场景示意</p>
          <h3 className="mt-3 text-2xl font-semibold leading-tight">早餐、办公、运动后的日常营养补充</h3>
          <div className="mt-5 flex flex-wrap gap-2">
            {["场景内容", "科普文章", "常见问题"].map((item) => (
              <span key={item} className="rounded-full bg-[#24331f]/85 px-3 py-1.5 text-xs font-semibold text-white">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustImage() {
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      <div className="rounded-[1.4rem] bg-white/70 p-4 shadow-sm">
        <p className="text-xs font-semibold text-[#6f964d]">检测报告与资质示意</p>
        <div className="mt-3 grid gap-2">
          <div className="h-3 rounded-full bg-[#24331f]/20" />
          <div className="h-3 w-5/6 rounded-full bg-[#24331f]/15" />
          <div className="h-3 w-2/3 rounded-full bg-[#24331f]/15" />
        </div>
        <div className="mt-4 rounded-xl border border-[#6f964d]/20 bg-[#e8f3dc] px-3 py-2 text-xs font-semibold text-[#516d3d]">
          检测与资质展示区
        </div>
      </div>
      <div className="rounded-[1.4rem] bg-[#24331f] p-4 text-white shadow-sm">
        <p className="text-xs font-semibold text-[#d7efc3]">品牌背书场景示意</p>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-14 flex-1 rounded-xl bg-white/12" />
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-[#f4ffe9]">资质、备案、用户反馈和品牌故事可以集中呈现。</p>
      </div>
    </div>
  );
}
