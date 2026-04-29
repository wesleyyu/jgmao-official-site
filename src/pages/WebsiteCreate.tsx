import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle2, Globe2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

import GrowthEntryFloating from "@/components/GrowthEntryFloating";
import JgmaoPageBrand from "@/components/JgmaoPageBrand";
import wecomSupportQrImage from "@/assets/wecom-support-qr.png";
import { siteOrigin } from "@/lib/share";

const pageTitle = "适合 AI 理解与持续运营的企业官网生成 | 坚果猫 JGMAO";
const pageDescription = "选择行业起点后，先搭建官网栏目、首页结构、内容模块与获客入口，再持续沉淀文章、案例、常见问答与知识库内容。";
const pageImage = `${siteOrigin}/geo-score-share-cover.png`;

const standardCapabilities = [
  {
    title: "GEO 诊断与优化引擎",
    desc: "持续评估品牌与官网在 AI 可见性、内容结构、可信信号和转化承接上的表现。",
  },
  {
    title: "可信内容资产中心",
    desc: "沉淀文章、案例、FAQ、产品/服务说明、知识库与行业内容，让企业信息更容易被用户和 AI 理解。",
  },
  {
    title: "AI 增长官网系统",
    desc: "作为对外展示、内容承载、线索转化和 GEO 优化的核心入口。",
  },
  {
    title: "AI 推荐监测系统",
    desc: "监测品牌、产品和内容在 AI 搜索、问答、推荐场景中的曝光与变化。",
  },
  {
    title: "智能获客与转化系统",
    desc: "打通咨询入口、线索收集、提醒通知和转化承接，让访问和内容曝光进入后续跟进。",
  },
];

const fitList = [
  "还没有独立官网，需要先建立可信官网入口",
  "旧官网不方便更新，希望后续能持续发布内容",
  "希望官网一开始就兼顾 AI 理解、内容沉淀与线索承接",
];

const differenceList = [
  "不是一次性交付页面，而是后续可持续更新内容",
  "不是只给用户浏览，也兼顾 AI 抓取、理解与推荐",
  "不是孤立官网，而是连接评分、诊断、内容和获客的增长入口",
];

const industryTemplates = [
  {
    title: "健康消费行业起点",
    desc: "适合保健品、营养品、功能食品、滋补品与健康生活方式品牌。",
    demoName: "青养研营养健康官网 Demo",
    demoUrl: "/website-create/health-consumer-demo/",
    pages: ["品牌介绍", "产品功效", "成分说明", "适用人群", "科普内容", "购买咨询"],
    modules: ["首屏突出品牌定位、核心产品和适用人群", "产品页讲清成分来源、食用方式和适用场景", "科普页沉淀营养知识、使用建议和常见误区", "信任区补检测报告、资质备案、用户反馈与品牌背书"],
    faq: ["适合哪些人群", "成分是否安全", "怎么吃/怎么用", "有哪些检测或资质"],
    cta: "引导客户了解产品、领取资料或咨询购买方式",
  },
  {
    title: "宠物医疗服务行业起点",
    desc: "适合宠物医院、动物诊所、宠物体检、疫苗驱虫、绝育手术、口腔护理、皮肤诊疗与影像检查等服务机构。",
    demoName: "伴爪动物医院官网 Demo",
    demoUrl: "/website-create/pet-medical-demo/",
    pages: ["医院介绍", "诊疗服务", "医生团队", "设备环境", "养宠科普", "预约咨询"],
    modules: ["首屏突出医院定位、重点科室和预约入口", "诊疗服务页讲清体检、疫苗、驱虫、绝育和专科项目", "医生团队页展示执业资质、擅长方向和出诊安排", "信任区补医院资质、设备环境、服务流程与真实评价"],
    faq: ["什么时候需要带宠物就诊", "疫苗和驱虫怎么安排", "体检需要做哪些项目", "如何预约医生"],
    cta: "引导客户预约问诊、电话咨询或添加客服",
  },
  {
    title: "教育培训行业起点",
    desc: "适合课程培训、职业教育、研学机构与知识服务。",
    demoName: "知阶学堂官网 Demo",
    demoUrl: "/website-create/education-demo/",
    pages: ["课程体系", "师资介绍", "学员案例", "试听预约", "常见问题", "校区信息"],
    modules: ["首屏突出课程结果和适合人群", "课程页拆清大纲、课时、收获和适合基础", "师资页展示经历、成果和授课风格", "案例页呈现学员变化、作品或升学就业结果"],
    faq: ["适合什么基础", "课程如何安排", "是否可以试听", "退费和补课规则是什么"],
    cta: "引导客户预约试听、领取课表或咨询顾问",
  },
  {
    title: "制造业行业起点",
    desc: "适合工厂、设备、零部件、工业服务类企业。",
    demoName: "云工智造设备官网 Demo",
    demoUrl: "/website-create/manufacturing-demo/",
    pages: ["产品中心", "行业解决方案", "客户案例", "资质实力", "常见问题", "联系咨询"],
    modules: ["首屏突出主营产品与应用行业", "产品详情页补参数、场景和选型说明", "案例页展示客户行业、问题与交付结果", "资质实力区补工厂、设备、认证与备案信息"],
    faq: ["产品怎么选型", "交付周期多久", "是否支持定制", "售后和质保怎么做"],
    cta: "引导客户提交产品需求或预约技术沟通",
  },
  {
    title: "设计服务行业起点",
    desc: "适合设计公司、咨询服务、品牌策划、摄影与创意团队。",
    demoName: "栖木设计服务官网 Demo",
    demoUrl: "/website-create/design-service-demo/",
    pages: ["服务项目", "作品案例", "服务流程", "客户评价", "报价咨询", "关于团队"],
    modules: ["首屏讲清服务定位和代表作品", "服务页拆清交付范围、流程与适合客户", "案例页展示改造前后、策略思路和成果", "团队页补专业经历、客户评价与合作方式"],
    faq: ["怎么收费", "项目周期多久", "是否可以先做诊断", "需要客户准备哪些资料"],
    cta: "引导客户提交项目需求或预约方案沟通",
  },
  {
    title: "本地服务行业起点",
    desc: "适合门店、维修、家政、医美、餐饮与到店服务。",
    demoName: "邻里优选服务官网 Demo",
    demoUrl: "/website-create/local-service-demo/",
    pages: ["门店介绍", "服务项目", "地址导航", "客户评价", "预约咨询", "优惠活动"],
    modules: ["首屏突出服务范围、城市区域和预约入口", "服务页讲清项目、价格区间与注意事项", "评价区展示真实反馈和到店体验", "联系页强化地址、电话、营业时间和地图导航"],
    faq: ["服务覆盖哪些区域", "是否需要提前预约", "价格是否透明", "到店/上门流程是什么"],
    cta: "引导客户一键预约、电话咨询或添加客服",
  },
  {
    title: "AI/科技行业起点",
    desc: "适合软件、SaaS、AI 产品、技术服务与创新项目。",
    demoName: "智流云科技官网 Demo",
    demoUrl: "/website-create/ai-tech-demo/",
    pages: ["产品介绍", "场景方案", "技术文档", "白皮书", "Demo 预约", "更新日志"],
    modules: ["首屏讲清产品能力、适用场景和核心收益", "场景页按角色、流程和接入方式组织", "文档页补 API、部署、权限和安全说明", "更新日志持续沉淀产品能力和可信信号"],
    faq: ["如何接入", "数据是否安全", "是否支持私有化", "和现有系统如何打通"],
    cta: "引导客户预约 Demo、申请试用或联系技术顾问",
  },
  {
    title: "B2B 企业行业起点",
    desc: "适合面向企业客户获客、项目合作和销售转化的公司。",
    demoName: "启链方案官网 Demo",
    demoUrl: "/website-create/b2b-demo/",
    pages: ["行业方案", "核心能力", "客户案例", "资料下载", "销售线索", "FAQ"],
    modules: ["首屏锁定目标行业和核心价值", "方案页按行业痛点、解决方式和成果组织", "资料页承接白皮书、报价单或选型资料", "线索页补预算、需求和联系方式字段"],
    faq: ["适合哪些企业", "部署/合作周期多久", "是否支持试点", "如何评估投入产出"],
    cta: "引导客户下载资料、预约演示或提交项目需求",
  },
];

function setPageMeta(title: string, description: string) {
  document.title = title;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", description);
  }
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

export default function WebsiteCreatePage() {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null);

  useEffect(() => {
    const canonicalUrl = `${siteOrigin}/website-create/`;
    setCanonical(canonicalUrl);
    setPageMeta(pageTitle, pageDescription);
    setPropertyMeta("og:title", pageTitle);
    setPropertyMeta("og:description", pageDescription);
    setPropertyMeta("og:type", "website");
    setPropertyMeta("og:image", pageImage);
    setPropertyMeta("og:url", canonicalUrl);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(245,197,92,0.16),transparent_24%),radial-gradient(circle_at_88%_18%,rgba(82,230,255,0.14),transparent_23%),radial-gradient(circle_at_50%_84%,rgba(161,245,106,0.12),transparent_28%),linear-gradient(180deg,#050816_0%,#091222_42%,#050816_100%)]" />
      <div className="pointer-events-none absolute inset-0 ops-grid opacity-20" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-5 pb-24 pt-8 sm:px-6 lg:px-10">
        <div className="flex justify-start">
          <JgmaoPageBrand />
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.86fr]">
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-[2rem] border border-white/10 bg-slate-950/58 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-amber-100/70">先搭建官网，再持续沉淀内容资产</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
              先搭建一个适合 AI 理解与持续运营的企业官网
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
              选择行业起点后，先形成官网栏目、首页结构、内容模块与咨询入口，再通过内容发布系统持续沉淀文章、案例、常见问答与知识库内容，让官网逐步成为可运营的内容资产。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full bg-amber-200 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-100"
              >
                咨询官网生成方案
              </a>
            </div>
          </motion.article>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-6 backdrop-blur-xl"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-amber-100/70">标准版</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">坚果猫AI增长引擎标准版</h2>
            <p className="mt-3 text-3xl font-semibold text-amber-100">1299 元/月</p>
            <p className="mt-3 text-sm leading-7 text-amber-50/90">
              通过 GEO 诊断与优化、可信内容资产、AI 增长官网、AI 推荐监测与智能获客转化，帮助企业从被 AI 看见，到被 AI 理解、信任和推荐，并把内容曝光转化为真实线索。
            </p>
            <div className="mt-5 grid gap-3">
              {standardCapabilities.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                  <div>
                    <p className="text-sm font-semibold leading-6 text-slate-100">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.aside>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <InfoCard eyebrow="适合场景" title="适合这些官网起点" items={fitList} />
          <InfoCard eyebrow="核心差异" title="和普通官网有什么不同" items={differenceList} />
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/58 p-6 backdrop-blur-xl">
          <div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">行业起点</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">选择行业起点，让官网一开始就更适合 AI 理解与持续运营</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                不同企业需要沉淀的内容资产、展示重点和获客路径并不相同。可以先选择接近的行业起点，快速形成官网栏目、首页模块、常见问答方向和咨询承接入口，再根据实际业务持续补充内容。
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {industryTemplates.map((template, index) => {
              const isSelected = selectedTemplateIndex === index;
              return (
                <article
                  key={template.title}
                  className={`rounded-[1.5rem] border p-5 transition hover:-translate-y-0.5 ${
                    isSelected
                      ? "border-cyan-200/45 bg-cyan-300/10 shadow-[0_18px_60px_rgba(34,211,238,0.12)]"
                      : "border-white/10 bg-white/[0.04] hover:border-cyan-200/30 hover:bg-white/[0.06]"
                  }`}
                >
                  <h3 className="text-lg font-semibold text-white">{template.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{template.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {template.pages.map((page) => (
                      <span key={page} className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1.5 text-xs text-slate-200">
                        {page}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Link
                      href={template.demoUrl}
                      className="inline-flex items-center justify-center rounded-full border border-lime-200/25 bg-lime-200/10 px-3 py-2.5 text-sm font-semibold text-lime-50 transition hover:border-lime-100/40 hover:bg-lime-200/15"
                    >
                      查看官网 Demo
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateIndex(isSelected ? null : index)}
                      className={`inline-flex items-center justify-center rounded-full px-3 py-2.5 text-sm font-semibold transition ${
                        isSelected ? "bg-cyan-200 text-slate-950" : "border border-cyan-200/25 bg-cyan-200/10 text-cyan-50 hover:border-cyan-100/40 hover:bg-cyan-200/15"
                      }`}
                    >
                      {isSelected ? "收起结构" : "查看结构"}
                    </button>
                  </div>
                  {isSelected ? (
                    <div className="mt-5 grid gap-4 rounded-[1.25rem] border border-cyan-200/20 bg-slate-950/35 p-4">
                      <TemplateWireframe template={template} />
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">示例首页结构</p>
                        <div className="mt-3 grid gap-2">
                          {template.modules.map((module) => (
                            <div key={module} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                              <p className="text-sm leading-6 text-slate-100">{module}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">常见问题方向</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {template.faq.map((item) => (
                            <span key={item} className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-slate-200">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-[1rem] border border-amber-200/20 bg-amber-300/10 p-3">
                        <p className="text-sm font-semibold text-white">获客承接入口</p>
                        <p className="mt-2 text-sm leading-6 text-amber-50">{template.cta}</p>
                        <a
                          href="#contact"
                          className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-amber-200 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-100"
                        >
                          按这个方向生成官网框架
                        </a>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <section id="contact" className="mt-6 grid gap-5 rounded-[2rem] border border-white/10 bg-slate-950/58 p-6 backdrop-blur-xl lg:grid-cols-[1fr_280px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-100">
              <CheckCircle2 className="h-4 w-4" />
              下一步
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-white">先确认行业起点与内容填充方式</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              添加企微客服后，可以先沟通行业、栏目数量、已有素材、内容更新频率、是否需要知识库与智能获客系统，再确认官网框架生成和后续内容运营方式。
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Globe2 className="h-4 w-4 text-cyan-200" />
                AI 生成框架
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <BadgeCheck className="h-4 w-4 text-amber-200" />
                日常填充内容
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Sparkles className="h-4 w-4 text-lime-200" />
                智能获客承接
              </span>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white p-4">
            <img src={wecomSupportQrImage} alt="坚果猫企微客服二维码" className="mx-auto h-56 w-56 rounded-2xl object-cover" />
            <p className="mt-3 text-center text-sm font-medium text-slate-950">扫码添加企微客服</p>
          </div>
        </section>
      </div>

      <GrowthEntryFloating />
    </main>
  );
}

function TemplateWireframe({ template }: { template: (typeof industryTemplates)[number] }) {
  const [primaryPage, secondaryPage, casePage, trustPage, faqPage, contactPage] = template.pages;

  return (
    <div className="rounded-[1.1rem] border border-white/10 bg-[#07111f] p-3 shadow-inner shadow-cyan-950/30">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-white">AI 生成框架示意图</p>
        <span className="rounded-full bg-cyan-300/15 px-2 py-1 text-[10px] text-cyan-100">Wireframe</span>
      </div>
      <div className="overflow-hidden rounded-[0.9rem] border border-white/10 bg-slate-950">
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.04] px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-rose-300/80" />
          <span className="h-2 w-2 rounded-full bg-amber-300/80" />
          <span className="h-2 w-2 rounded-full bg-lime-300/80" />
          <div className="ml-2 h-2 flex-1 rounded-full bg-white/10" />
        </div>
        <div className="grid gap-2 p-3">
          <div className="rounded-xl border border-cyan-200/20 bg-cyan-300/12 p-3">
            <div className="h-2 w-2/3 rounded-full bg-cyan-100/70" />
            <div className="mt-2 h-2 w-1/2 rounded-full bg-white/20" />
            <div className="mt-3 flex gap-2">
              <span className="rounded-full bg-amber-200 px-2.5 py-1 text-[10px] font-semibold text-slate-950">{contactPage ?? "联系咨询"}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-slate-200">{primaryPage}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[primaryPage, secondaryPage, casePage, trustPage].filter(Boolean).map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.05] p-2">
                <div className="mb-2 h-10 rounded-md bg-white/8" />
                <p className="text-[10px] font-medium text-slate-100">{item}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium text-slate-100">{faqPage ?? "常见问题"}</span>
              <span className="text-[10px] text-amber-100">AI 可读内容资产</span>
            </div>
            <div className="grid gap-1.5">
              <div className="h-2 rounded-full bg-white/12" />
              <div className="h-2 w-5/6 rounded-full bg-white/12" />
              <div className="h-2 w-2/3 rounded-full bg-white/12" />
            </div>
          </div>
          <div className="rounded-lg border border-amber-200/20 bg-amber-300/12 px-3 py-2 text-center text-[10px] font-semibold text-amber-50">
            {template.cta}
          </div>
        </div>
      </div>
    </div>
  );
}

function IndustryDemoLink({ template }: { template: (typeof industryTemplates)[number] }) {
  return (
    <div className="rounded-[1.1rem] border border-lime-200/20 bg-lime-300/[0.07] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-lime-100/70">完整 Demo 官网</p>
          <h4 className="mt-2 text-lg font-semibold text-white">{template.demoName}</h4>
        </div>
        <span className="rounded-full border border-lime-200/20 bg-lime-200/10 px-3 py-1.5 text-xs text-lime-50">虚拟品牌示例</span>
      </div>
      <p className="mt-3 text-sm leading-7 text-lime-50/90">
        打开后可查看一个接近正式对外展示的虚拟品牌官网 Demo，包含导航、首屏、业务模块、信任信号与咨询入口。
      </p>
      <Link
        href={template.demoUrl}
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-lime-200 px-4 py-2.5 text-sm font-semibold text-[#182416] transition hover:bg-lime-100"
      >
        查看完整 Demo 官网
      </Link>
    </div>
  );
}

function HealthConsumerDemo() {
  const demoSections = [
    { title: "首页首屏", desc: "品牌定位、核心产品、适用人群与购买咨询入口" },
    { title: "产品页", desc: "成分来源、功效说明、食用方式与检测资质" },
    { title: "科普页", desc: "营养知识、适用场景、常见误区与问答内容" },
    { title: "信任页", desc: "检测报告、备案信息、用户反馈与品牌背书" },
  ];

  return (
    <div className="rounded-[1.1rem] border border-lime-200/20 bg-lime-300/[0.07] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-lime-100/70">行业框架样例</p>
          <h4 className="mt-2 text-lg font-semibold text-white">青养研营养健康官网样例</h4>
        </div>
        <span className="rounded-full border border-lime-200/20 bg-lime-200/10 px-3 py-1.5 text-xs text-lime-50">虚拟品牌示例</span>
      </div>
      <p className="mt-3 text-sm leading-7 text-lime-50/90">
        以下为健康消费行业框架样例，用于展示 AI 可生成的网站结构，不代表真实客户案例。
      </p>
      <div className="mt-4 grid gap-3">
        {demoSections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
            <p className="text-sm font-semibold text-white">{section.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">{section.desc}</p>
          </div>
        ))}
      </div>
      <Link
        href="/website-create/health-consumer-demo/"
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-lime-200 px-4 py-2.5 text-sm font-semibold text-[#182416] transition hover:bg-lime-100"
      >
        查看完整健康消费样例页
      </Link>
    </div>
  );
}

function InfoCard({ eyebrow, title, items }: { eyebrow: string; title: string; items: string[] }) {
  return (
    <article className="rounded-[1.7rem] border border-white/10 bg-slate-950/50 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)] backdrop-blur-xl">
      <span className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-100">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2.5">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(103,232,249,0.45)]" />
            <p className="text-sm leading-7 text-slate-200">{item}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
