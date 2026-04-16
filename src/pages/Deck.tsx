import {
  ArrowRight,
  Bot,
  Building2,
  ChartColumn,
  ChevronRight,
  CircleDollarSign,
  Factory,
  FileCheck2,
  Gauge,
  Globe2,
  Layers3,
  Radar,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { PRODUCT_EDITIONS, getEditionSteps } from "@/lib/enterpriseModel";

const slides = [
  {
    id: "cover",
    index: "01",
    tag: "Investment Narrative",
    title: "TrustOps",
    subtitle: "把 AI 内容生成，升级成企业可控的运营基础设施。",
    body:
      "这不是另一个生成工具，而是企业把 AI 内容安全放行、可追责留痕、可审计运营起来的控制层。我们卖的是最后一公里的放行权和治理权。",
    accent: "从“会生成”走向“敢扩量”",
  },
  {
    id: "problem",
    index: "02",
    tag: "Problem",
    title: "AI 产能暴涨，但企业放行能力没有同步升级。",
    subtitle: "内容团队越高效，品牌、法务、合规就越焦虑。",
    body:
      "企业已经接受 AI 生成不可逆，但审批、授权、证据和审计仍停留在群聊、表格和人工判断里。真正的缺口不是生成能力，而是规模化使用 AI 的企业控制面。",
    accent: "生产工具很多，治理中台很少",
  },
  {
    id: "solution",
    index: "03",
    tag: "Solution",
    title: "TrustOps 把生成、校验、审批、发布、封存串成一条线。",
    subtitle: "让每一次内容产出都带着上下文、规则和证据往前走。",
    body:
      "产品的价值不在于替代模型，而在于占据模型和企业流程之间的关键节点。它把风险判断、授权校验、审批路由和审计留痕统一成可复用工作流。",
    accent: "控制层，而不是 another AI app",
  },
  {
    id: "model",
    index: "04",
    tag: "Business Model",
    title: "商业模式是 SaaS 订阅打底，私有化和合规模块抬升客单价。",
    subtitle: "先切效率，再吃治理预算，再接企业级交付。",
    body:
      "低配版本解决团队上手和日常放行，高配版本承接法务、品牌和审计需求。由此自然形成从 Starter 到本地版的 land-and-expand 路径。",
    accent: "标准化订阅 + 高毛利增购 + 实施维保",
  },
  {
    id: "market",
    index: "05",
    tag: "Market Size",
    title: "OpenClaw 行为操作审计不是旧市场，而是 AI 治理、审计取证与流程控制的交叉新品类。",
    subtitle: "与其把它塞进日志软件，不如把它定义成 AI 操作治理市场。",
    body:
      "它既不是通用 SIEM，也不是传统 PAM，而是面向 AI 内容、Agent 与自动化工作流的动作级审计层。短期从内容与工作流审计切入，长期扩展到企业 AI 控制平面。",
    accent: "定义品类，比借用旧品类更重要",
  },
  {
    id: "gtm",
    index: "06",
    tag: "Go-To-Market",
    title: "最好的切口不是“更强模型”，而是“更少事故”。",
    subtitle: "先从品牌内容团队进去，再向法务、合规和 IT 扩单。",
    body:
      "首单由市场团队推动，扩单由法务和数字化部门放大。TrustOps 天然适合多部门联名采购，因为它同时覆盖效率、安全和责任归属。",
    accent: "一个产品，对接三类预算",
  },
  {
    id: "timing",
    index: "07",
    tag: "Why Now",
    title: "监管、出海和品牌风险把“治理”从可选项变成必选项。",
    subtitle: "企业对 provenance、标识、留痕和解释性能力的预算会继续抬升。",
    body:
      "随着 AI Act、中国生成合成内容标识规则以及企业内部风险审查要求持续推进，市场会从单点工具竞争转向流程和证据体系竞争。",
    accent: "行业正在奖励“能举证”的系统",
  },
  {
    id: "close",
    index: "08",
    tag: "Closing",
    title: "TrustOps 想成为企业 AI 内容工厂的默认控制平面。",
    subtitle: "谁掌握放行、留痕和审计入口，谁就掌握企业 AI 内容的运营主权。",
    body:
      "融资/路演的核心不是证明我们也能生成，而是证明我们占住了生成之后最难被替代、最容易扩预算的位置。",
    accent: "把工具卖成基础设施",
  },
];

const tractionPoints = [
  "买单角色天然多元：市场要效率，法务要留痕，IT 要控制面。",
  "风险场景越复杂，产品替代成本越高，续费与扩单空间越大。",
  "模型快速变化不一定伤害 TrustOps，反而放大治理层的中立价值。",
];

const solutionBlocks = [
  {
    title: "Flow Control",
    text: "把生成、授权、风控、审批、发布连成同一工作流。",
    icon: Layers3,
  },
  {
    title: "Evidence Chain",
    text: "把指纹、水印、登记、封存和审计调取收成同一证据链。",
    icon: FileCheck2,
  },
  {
    title: "Operator View",
    text: "让品牌、法务、合规和 IT 在同一控制面看到相同状态。",
    icon: Gauge,
  },
];

const pricingPlans = [
  {
    title: "启航版",
    price: "¥9,800 / 年",
    evidence: "1 万次 / 月",
    audit: "200 次 / 月",
    overage: "按量计费，无上限",
    similarity: "一对一基础比对",
    detail: "适合刚开始把 evidence.pack 和 audit.pull 接入内容流程的团队。",
  },
  {
    title: "团队版",
    price: "¥39,800 / 年",
    evidence: "4 万次 / 月",
    audit: "1,000 次 / 月",
    overage: "按量计费，无上限",
    similarity: "一对一 + 小批量检索",
    detail: "适合有明确审批流和小团队素材治理需求的电商与品牌团队。",
  },
  {
    title: "企业增强版",
    price: "¥129,800 / 年",
    evidence: "15 万次 / 月",
    audit: "5,000 次 / 月",
    overage: "按量计费，无上限",
    similarity: "全场景 + 大批量 + 自定义阈值",
    detail: "适合跨部门协作、批量检索和高频审计抽检场景。",
  },
  {
    title: "企业本地版",
    price: "Custom Quote",
    evidence: "按部署方案配置",
    audit: "按合规策略配置",
    overage: "许可证 + 维保",
    similarity: "私有化规则与策略引擎",
    detail: "面向高监管行业，保留本地部署、审计和深度集成空间。",
  },
];

const pricingFoundation =
  "所有标准版本均包含：嵌入水印、生成指纹、确权登记。";

const marketSizing = [
  {
    label: "全球 TAM",
    value: "5亿-15亿美元",
    note: "对应 AI 治理、审计取证、流程控制交叉带的中期机会。",
    icon: Globe2,
  },
  {
    label: "中国 TAM",
    value: "5亿-20亿元",
    note: "适用于内容密集、AI 使用高频、需要审计留痕的企业客户。",
    icon: ChartColumn,
  },
  {
    label: "中国 3 年 SAM",
    value: "2亿-8亿元",
    note: "聚焦电商、品牌、零售、出海营销与高合规行业的现实可服务市场。",
    icon: Radar,
  },
  {
    label: "初期 SOM",
    value: "3000万-1.5亿元",
    note: "从中大型内容密集企业切入后，在前 3 年内可争取的市场空间。",
    icon: CircleDollarSign,
  },
];

const marketMethod = [
  "不是把 OpenClaw 直接等同于 SIEM、PAM 或传统审计软件，而是把它定义为 AI 操作治理层。",
  "估算基础来自相邻赛道：AI Governance、PAM、审计日志与企业内容合规预算的交叉区间。",
  "客群先限定在中大型、内容密集、AI 已进入正式流程且需要留痕/回放/举证的企业。",
  "按当前价格带反推，若覆盖 1 万到 3 万家目标客户、平均客单价 5 万到 10 万元，中国中期市场空间可落在数亿元级别。",
];

const marketWhyBigger = [
  {
    title: "风险等级更高",
    behavior: "行为审计对应的是系统失控、数据泄露、业务停摆与监管重罚，接近企业生存级风险。",
    ownership: "内容确权更多对应侵权赔偿、下架和授权纠纷，通常属于财务损失。",
  },
  {
    title: "预算池更大",
    behavior: "行为审计更容易进入安全、风控、IT、合规预算，这些预算通常高于内容或品牌预算。",
    ownership: "确权主要落在品牌、法务、内容预算内，单项预算上限通常更低。",
  },
  {
    title: "采购优先级更靠前",
    behavior: "企业会优先为“避免重大事故”付费，因为事故可能带来停机、罚款和高层问责。",
    ownership: "企业未必会优先为“增强权属证明”付费，除非侵权事件已经高频发生。",
  },
  {
    title: "适用边界更广",
    behavior: "行为审计可覆盖 Agent、API 调用、文件读写、审批链路、自动化动作与数据访问。",
    ownership: "内容确权主要围绕图片、视频、文案等内容资产本身展开，边界更窄。",
  },
];

const gtmCards = [
  {
    title: "Land",
    text: "从品牌内容团队切入，用一个真实审批链路快速上线。",
    icon: Radar,
  },
  {
    title: "Expand",
    text: "把授权校验、工单和法务台账接进来，抬升组织依赖度。",
    icon: TrendingUp,
  },
  {
    title: "Lock-In",
    text: "一旦证据和流程沉淀到系统内，迁移成本会显著上升。",
    icon: Shield,
  },
];

const marketProof = [
  "2025 年 9 月 1 日起，中国《人工智能生成合成内容标识办法》施行，企业对标识与留痕能力会更敏感。",
  "欧盟 AI Act 自 2024 年 8 月 1 日起生效，透明度与高风险治理将持续影响出海品牌客户。",
  "NIST 在 2024 年 7 月发布生成式 AI 风险管理画像，说明企业治理正在进入制度化阶段。",
];

function Deck() {
  return (
    <main className="min-h-screen bg-[#f3ede2] text-[#1d1a16]">
      <div className="fixed inset-x-0 top-0 z-30 border-b border-black/8 bg-[#f3ede2]/88 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1d1a16] text-[#f3ede2]">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a5a2f]">
                TrustOps Deck
              </p>
              <p className="text-sm text-black/60">Investor / Roadshow Narrative</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {slides.map((slide) => (
              <a
                key={slide.id}
                href={`#${slide.id}`}
                className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-black/60 transition hover:border-black/20 hover:text-black"
              >
                {slide.index}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-10 pt-24 sm:px-10 lg:px-12">
        <section
          id="cover"
          className="relative overflow-hidden rounded-[2.5rem] bg-[#111820] px-7 py-8 text-[#f8f2e8] shadow-[0_35px_90px_rgba(0,0,0,0.22)] md:px-10 md:py-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(255,173,91,0.18),_transparent_22%)]" />
          <div className="relative grid min-h-[74vh] gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffbf7e]">
                  <Sparkles className="h-4 w-4" />
                  {slides[0].tag}
                </div>
                <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                  {slides[0].title}
                </h1>
                <p className="mt-5 max-w-3xl text-2xl leading-10 text-[#d8d0c4]">
                  {slides[0].subtitle}
                </p>
                <p className="mt-6 max-w-2xl text-base leading-8 text-[#b7b0a5]">
                  {slides[0].body}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="rounded-full bg-[#f8f2e8] px-5 py-3 text-sm font-semibold text-[#111820]">
                  {slides[0].accent}
                </div>
                <a
                  href="#model"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-[#f8f2e8] transition hover:bg-white/8"
                >
                  查看商业模式
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="grid gap-4 self-end md:grid-cols-2 lg:grid-cols-1">
              {tractionPoints.map((point, index) => (
                <article
                  key={point}
                  className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffbf7e]">
                    0{index + 1}
                  </p>
                  <p className="mt-3 text-lg leading-8 text-[#f8f2e8]">{point}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <article
            id="problem"
            className="rounded-[2.25rem] bg-[#d76337] px-7 py-8 text-[#fff7f1] shadow-[0_24px_60px_rgba(176,76,39,0.24)] md:px-9"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffd9c9]">
              {slides[1].index} / {slides[1].tag}
            </p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight md:text-4xl">
              {slides[1].title}
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#ffe4d8]">{slides[1].subtitle}</p>
            <p className="mt-6 text-base leading-8 text-[#fff1ea]/92">{slides[1].body}</p>
            <div className="mt-8 rounded-[1.4rem] border border-white/14 bg-white/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ffe4d8]">
                Core Tension
              </p>
              <p className="mt-3 text-xl leading-9 text-white">{slides[1].accent}</p>
            </div>
          </article>

          <article
            id="solution"
            className="rounded-[2.25rem] border border-black/10 bg-[#fffaf3] px-7 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)] md:px-9"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a5a2f]">
              {slides[2].index} / {slides[2].tag}
            </p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight md:text-4xl">
              {slides[2].title}
            </h2>
            <p className="mt-5 text-lg leading-8 text-black/68">{slides[2].subtitle}</p>
            <p className="mt-6 text-base leading-8 text-black/72">{slides[2].body}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {solutionBlocks.map(({ title, text, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-[1.5rem] border border-black/8 bg-[#f4ecdf] p-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111820] text-[#f6efe4]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-lg font-semibold">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-black/64">{text}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section
          id="model"
          className="rounded-[2.4rem] bg-[#111820] px-7 py-8 text-[#f8f2e8] shadow-[0_28px_80px_rgba(0,0,0,0.18)] md:px-10 md:py-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffbf7e]">
                {slides[3].index} / {slides[3].tag}
              </p>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">{slides[3].title}</h2>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-[#d7d0c4]">
                {slides[3].subtitle}
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-[#f8f2e8]">
              {slides[3].accent}
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {pricingPlans.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5"
              >
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-4 text-2xl font-semibold text-[#ffbf7e]">{item.price}</p>
                <div className="mt-4 space-y-2 text-sm text-[#d7d0c4]">
                  <p>
                    <span className="text-[#b9b0a1]">evidence.pack:</span> {item.evidence}
                  </p>
                  <p>
                    <span className="text-[#b9b0a1]">audit.pull:</span> {item.audit}
                  </p>
                  <p>
                    <span className="text-[#b9b0a1]">超出计费:</span> {item.overage}
                  </p>
                  <p>
                    <span className="text-[#b9b0a1]">相似度能力:</span> {item.similarity}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#ffead3]">{item.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[#ffbf7e]/18 bg-[#ffbf7e]/8 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ffbf7e]">
              Foundation
            </p>
            <p className="mt-3 text-lg leading-8 text-[#f8f2e8]">{pricingFoundation}</p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {PRODUCT_EDITIONS.map((edition) => (
              <article
                key={edition.id}
                className="rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5"
              >
                <p className="text-sm font-semibold text-white">{edition.shortName}</p>
                <p className="mt-2 text-sm leading-7 text-[#b9b0a1]">{edition.segment}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.18em] text-[#b9b0a1]">workflow</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#ffbf7e]">
                    {getEditionSteps(edition.id).length} steps
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="market"
          className="rounded-[2.35rem] border border-black/10 bg-[#fffaf3] px-7 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)] md:px-10 md:py-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a5a2f]">
                {slides[4].index} / {slides[4].tag}
              </p>
              <h2 className="mt-5 text-3xl font-semibold leading-tight md:text-4xl">
                {slides[4].title}
              </h2>
              <p className="mt-5 text-lg leading-8 text-black/68">{slides[4].subtitle}</p>
              <p className="mt-6 text-base leading-8 text-black/72">{slides[4].body}</p>

              <div className="mt-8 rounded-[1.5rem] border border-black/8 bg-[#f4ecdf] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a5a2f]">
                  Market Framing
                </p>
                <p className="mt-3 text-xl leading-9 text-[#1d1a16]">{slides[4].accent}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {marketSizing.map(({ label, value, note, icon: Icon }) => (
                <article
                  key={label}
                  className="rounded-[1.5rem] border border-black/8 bg-[#f4ecdf] p-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1d1a16] text-[#f4ecdf]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#8a5a2f]">
                    {label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-[#1d1a16]">{value}</p>
                  <p className="mt-3 text-sm leading-7 text-black/64">{note}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-[1.65rem] bg-[#111820] p-6 text-[#f8f2e8]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8f2e8] text-[#111820]">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sizing Logic</p>
                <p className="text-sm text-[#b9b0a1]">这是一套适合融资/路演的口径，不是假装存在单独行业统计代码。</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {marketMethod.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4"
                >
                  <p className="text-sm leading-7 text-[#f8f2e8]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-[1.65rem] bg-[#d76337] p-6 text-[#fff7f1]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7f1] text-[#d76337]">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Why Behavior Audit Is Bigger</p>
                <p className="text-sm text-[#ffe4d8]">
                  行为审计卖的是企业级 AI 失控风险的保险，确权卖的是内容资产的权属证明。
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {marketWhyBigger.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.3rem] border border-white/14 bg-white/10 p-5"
                >
                  <p className="text-lg font-semibold text-white">{item.title}</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[1rem] bg-white/8 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffd9c9]">
                        行为审计
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#fff7f1]">{item.behavior}</p>
                    </div>
                    <div className="rounded-[1rem] bg-black/10 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffd9c9]">
                        内容确权
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#fff1ea]">{item.ownership}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr]">
          <article
            id="gtm"
            className="rounded-[2.25rem] border border-black/10 bg-[#fffaf3] px-7 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)] md:px-9"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a5a2f]">
              {slides[5].index} / {slides[5].tag}
            </p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight md:text-4xl">
              {slides[5].title}
            </h2>
            <p className="mt-5 text-lg leading-8 text-black/68">{slides[5].subtitle}</p>
            <p className="mt-6 text-base leading-8 text-black/72">{slides[5].body}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {gtmCards.map(({ title, text, icon: Icon }) => (
                <article
                  key={title}
                  className="rounded-[1.5rem] border border-black/8 bg-[#f4ecdf] p-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1d1a16] text-[#f4ecdf]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-lg font-semibold">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-black/64">{text}</p>
                </article>
              ))}
            </div>
          </article>

          <article
            id="timing"
            className="rounded-[2.25rem] bg-[#0b5a64] px-7 py-8 text-[#f4fffe] shadow-[0_24px_60px_rgba(6,66,74,0.24)] md:px-9"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a7eef7]">
              {slides[6].index} / {slides[6].tag}
            </p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight md:text-4xl">
              {slides[6].title}
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#d7fbff]">{slides[6].subtitle}</p>
            <div className="mt-8 space-y-4">
              {marketProof.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.35rem] border border-white/12 bg-white/8 p-4"
                >
                  <p className="text-sm leading-7 text-[#eefefe]">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[1.4rem] border border-white/12 bg-white/8 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#a7eef7]">
                Interpretation
              </p>
              <p className="mt-3 text-xl leading-9 text-white">{slides[6].accent}</p>
            </div>
          </article>
        </section>

        <section
          id="close"
          className="rounded-[2.5rem] bg-[#1d1a16] px-7 py-8 text-[#f8f2e8] shadow-[0_30px_80px_rgba(0,0,0,0.18)] md:px-10 md:py-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffbf7e]">
                {slides[7].index} / {slides[7].tag}
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
                {slides[7].title}
              </h2>
              <p className="mt-5 max-w-3xl text-xl leading-9 text-[#dfd7ca]">
                {slides[7].subtitle}
              </p>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#b9b0a1]">
                {slides[7].body}
              </p>
            </div>

            <div className="grid gap-4">
              <article className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8f2e8] text-[#1d1a16]">
                    <CircleDollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Investment Story</p>
                    <p className="text-sm text-[#b9b0a1]">工具竞争之外的基础设施叙事</p>
                  </div>
                </div>
              </article>

              <article className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8f2e8] text-[#1d1a16]">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Buying Center</p>
                    <p className="text-sm text-[#b9b0a1]">市场、法务、IT 三方共同放大预算</p>
                  </div>
                </div>
              </article>

              <article className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8f2e8] text-[#1d1a16]">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Platform Position</p>
                    <p className="text-sm text-[#b9b0a1]">模型可替换，治理层更稳定</p>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/#/deck"
              className="inline-flex items-center gap-2 rounded-full bg-[#f8f2e8] px-5 py-3 text-sm font-semibold text-[#1d1a16] transition hover:bg-white"
            >
              当前本地地址
              <ChevronRight className="h-4 w-4" />
            </a>
            <a
              href="/#/"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-[#f8f2e8] transition hover:bg-white/8"
            >
              返回主演示页
              <Building2 className="h-4 w-4" />
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Deck;
