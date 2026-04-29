import { ArrowLeft, BadgeCheck, MessageCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

import aiTechHeroImage from "@/assets/demo-ai-tech-hero.svg";
import aiTechSceneImage from "@/assets/demo-ai-tech-scene.svg";
import b2bHeroImage from "@/assets/demo-b2b-hero.svg";
import b2bSceneImage from "@/assets/demo-b2b-scene.svg";
import designServiceHeroImage from "@/assets/demo-design-service-hero.svg";
import designServiceSceneImage from "@/assets/demo-design-service-scene.svg";
import educationHeroImage from "@/assets/demo-education-hero.svg";
import educationSceneImage from "@/assets/demo-education-scene.svg";
import localServiceHeroImage from "@/assets/demo-local-service-hero.svg";
import localServiceSceneImage from "@/assets/demo-local-service-scene.svg";
import manufacturingHeroImage from "@/assets/demo-manufacturing-hero.svg";
import manufacturingSceneImage from "@/assets/demo-manufacturing-scene.svg";
import petHeroImage from "@/assets/demo-pet-medical-hero.svg";
import petSceneImage from "@/assets/demo-pet-medical-scene.svg";
import wecomSupportQrImage from "@/assets/wecom-support-qr.png";
import { siteOrigin } from "@/lib/share";

type DemoTone = "steel" | "sand" | "local" | "blue" | "orange" | "violet" | "pet";

type IndustryDemo = {
  id: string;
  brand: string;
  label: string;
  title: string;
  subtitle: string;
  badge: string;
  tone: DemoTone;
  nav: string[];
  offerings: Array<{
    title: string;
    desc: string;
    meta: string;
  }>;
  knowledge: string[];
  trust: string[];
  cta: string;
  disclaimer: string;
  imageLabels: string[];
  heroImage?: string;
  sceneImages?: string[];
};

const demoData: Record<string, IndustryDemo> = {
  manufacturing: {
    id: "manufacturing",
    brand: "云工智造",
    label: "工业设备官网 Demo",
    title: "让设备能力、行业方案和交付实力被客户快速看懂",
    subtitle: "面向制造业企业的官网 Demo，展示产品中心、应用行业、案例、资质实力和技术咨询入口。",
    badge: "制造业虚拟品牌示例",
    tone: "steel",
    nav: ["产品", "方案", "案例", "资质", "咨询"],
    offerings: [
      { title: "自动化产线设备", desc: "展示设备参数、适用工艺、选型建议和交付周期。", meta: "产品中心" },
      { title: "新能源行业方案", desc: "按行业痛点、生产场景和改善目标组织解决方案。", meta: "行业方案" },
      { title: "工厂升级案例", desc: "呈现客户背景、项目难点、交付过程和结果变化。", meta: "客户案例" },
    ],
    knowledge: ["如何选择适合产线的自动化设备", "设备交付周期通常受哪些因素影响", "工厂升级前需要准备哪些资料", "售后维护和备件服务如何安排"],
    trust: ["工厂与设备环境展示", "专利/认证/检测报告", "客户行业案例", "技术团队与售后流程"],
    cta: "预约技术沟通",
    disclaimer: "本页面为制造业官网 Demo，品牌、案例和数据均为示例内容。",
    imageLabels: ["生产车间", "设备细节", "工程师调试"],
    heroImage: manufacturingHeroImage,
    sceneImages: [manufacturingSceneImage, manufacturingHeroImage, manufacturingSceneImage],
  },
  "design-service": {
    id: "design-service",
    brand: "栖木设计",
    label: "设计服务官网 Demo",
    title: "把作品、流程和服务价值讲清楚，让客户更愿意咨询",
    subtitle: "适合设计公司、品牌策划和创意服务团队，展示服务项目、作品案例、流程、评价与报价咨询。",
    badge: "设计服务虚拟品牌示例",
    tone: "sand",
    nav: ["服务", "作品", "流程", "评价", "咨询"],
    offerings: [
      { title: "品牌视觉升级", desc: "讲清品牌策略、视觉方向、交付物和合作流程。", meta: "服务项目" },
      { title: "商业空间设计", desc: "用项目图、改造思路和客户目标展示专业能力。", meta: "作品案例" },
      { title: "官网与物料设计", desc: "承接企业线上展示、招商资料和销售转化需求。", meta: "延展服务" },
    ],
    knowledge: ["设计项目通常如何报价", "合作前需要准备哪些资料", "从沟通到交付需要多久", "如何判断设计是否适合品牌增长"],
    trust: ["代表作品集", "客户评价", "服务流程透明", "团队经验与获奖背书"],
    cta: "提交设计需求",
    disclaimer: "本页面为设计服务官网 Demo，作品、客户评价和项目信息均为示例内容。",
    imageLabels: ["品牌视觉", "空间案例", "创意提案"],
    heroImage: designServiceHeroImage,
    sceneImages: [designServiceSceneImage, designServiceHeroImage, designServiceSceneImage],
  },
  "local-service": {
    id: "local-service",
    brand: "邻里优选",
    label: "本地服务官网 Demo",
    title: "让附近客户快速了解服务项目、价格范围和预约方式",
    subtitle: "适合门店、本地生活、维修、洗护、预约类服务，突出地址、评价、服务流程和预约入口。",
    badge: "本地服务虚拟品牌示例",
    tone: "local",
    nav: ["服务", "门店", "评价", "优惠", "预约"],
    offerings: [
      { title: "到店基础服务", desc: "展示服务项目、价格区间、营业时间和注意事项。", meta: "服务项目" },
      { title: "上门预约服务", desc: "讲清服务区域、预约流程和到场准备。", meta: "预约服务" },
      { title: "会员复购权益", desc: "承接优惠活动、老客复购和私域咨询入口。", meta: "优惠活动" },
    ],
    knowledge: ["服务覆盖哪些区域", "是否需要提前预约", "价格是否透明", "到店或上门流程是什么"],
    trust: ["门店地址与导航", "真实评价展示", "营业执照与服务规范", "客服响应时间"],
    cta: "立即预约服务",
    disclaimer: "本页面为本地服务官网 Demo，门店、评价和优惠信息均为示例内容。",
    imageLabels: ["门店环境", "服务现场", "客户评价"],
    heroImage: localServiceHeroImage,
    sceneImages: [localServiceSceneImage, localServiceHeroImage, localServiceSceneImage],
  },
  b2b: {
    id: "b2b",
    brand: "启链方案",
    label: "B2B 企业官网 Demo",
    title: "把行业方案、核心能力和销售线索承接串成增长路径",
    subtitle: "适合面向企业客户获客、项目合作和销售转化的 B2B 公司。",
    badge: "B2B 虚拟品牌示例",
    tone: "blue",
    nav: ["方案", "能力", "案例", "资料", "演示"],
    offerings: [
      { title: "行业数字化方案", desc: "按行业场景、痛点、流程和收益组织页面。", meta: "行业方案" },
      { title: "系统集成能力", desc: "展示技术架构、实施流程和交付保障。", meta: "核心能力" },
      { title: "资料下载承接", desc: "用白皮书、选型表和案例集换取销售线索。", meta: "资料中心" },
    ],
    knowledge: ["适合哪些企业", "合作周期通常多久", "是否支持试点项目", "如何评估投入产出"],
    trust: ["行业客户案例", "交付方法论", "安全与合规说明", "售前顾问跟进机制"],
    cta: "预约方案演示",
    disclaimer: "本页面为 B2B 企业官网 Demo，客户、资料和案例均为示例内容。",
    imageLabels: ["方案架构", "客户场景", "资料下载"],
    heroImage: b2bHeroImage,
    sceneImages: [b2bSceneImage, b2bHeroImage, b2bSceneImage],
  },
  education: {
    id: "education",
    brand: "知阶学堂",
    label: "教育培训官网 Demo",
    title: "把课程体系、师资实力和试听预约讲得更清楚",
    subtitle: "适合职业教育、课程培训、研学机构和知识服务品牌。",
    badge: "教育培训虚拟品牌示例",
    tone: "orange",
    nav: ["课程", "师资", "案例", "试听", "校区"],
    offerings: [
      { title: "职业提升课程", desc: "展示课程大纲、适合基础、学习周期和学习成果。", meta: "课程体系" },
      { title: "名师小班课", desc: "展示师资经历、授课方式和课程服务。", meta: "师资介绍" },
      { title: "试听预约", desc: "承接课程顾问、试听课、课表领取和校区咨询。", meta: "试听预约" },
    ],
    knowledge: ["适合什么基础", "课程如何安排", "是否可以试听", "退费和补课规则是什么"],
    trust: ["师资介绍", "学员案例", "课程大纲透明", "校区与服务保障"],
    cta: "预约试听课程",
    disclaimer: "本页面为教育培训官网 Demo，师资、案例和课程安排均为示例内容。",
    imageLabels: ["课堂现场", "师资介绍", "学员成果"],
    heroImage: educationHeroImage,
    sceneImages: [educationSceneImage, educationHeroImage, educationSceneImage],
  },
  "ai-tech": {
    id: "ai-tech",
    brand: "智流云",
    label: "AI/科技官网 Demo",
    title: "让产品能力、应用场景和 Demo 预约更容易被理解",
    subtitle: "适合软件、SaaS、AI 产品、技术服务和创新项目。",
    badge: "AI/科技虚拟品牌示例",
    tone: "violet",
    nav: ["产品", "场景", "文档", "白皮书", "Demo"],
    offerings: [
      { title: "智能流程助手", desc: "讲清产品能力、适用角色、接入流程和核心收益。", meta: "产品介绍" },
      { title: "行业场景方案", desc: "按营销、客服、运营、知识库等场景组织内容。", meta: "场景方案" },
      { title: "技术文档中心", desc: "沉淀 API、权限、安全和部署说明。", meta: "技术文档" },
    ],
    knowledge: ["如何接入", "数据是否安全", "是否支持私有化", "和现有系统如何打通"],
    trust: ["安全合规说明", "技术架构图", "客户场景案例", "更新日志与文档"],
    cta: "预约产品 Demo",
    disclaimer: "本页面为 AI/科技官网 Demo，产品功能、客户和技术信息均为示例内容。",
    imageLabels: ["产品界面", "场景方案", "技术文档"],
    heroImage: aiTechHeroImage,
    sceneImages: [aiTechSceneImage, aiTechHeroImage, aiTechSceneImage],
  },
  "pet-medical": {
    id: "pet-medical",
    brand: "伴爪动物医院",
    label: "宠物医疗服务官网 Demo",
    title: "让宠物主人快速了解诊疗服务、医生团队和预约方式",
    subtitle: "适合宠物医院、动物诊所、体检、疫苗驱虫、绝育手术、口腔护理、皮肤诊疗与影像检查等服务机构。",
    badge: "宠物医疗虚拟品牌示例",
    tone: "pet",
    nav: ["诊疗", "医生", "设备", "科普", "预约"],
    offerings: [
      { title: "宠物体检与疫苗", desc: "说明体检项目、疫苗驱虫安排、适合年龄和预约流程。", meta: "基础诊疗" },
      { title: "口腔与皮肤专科", desc: "展示常见症状、检查方式、医生团队和护理建议。", meta: "专科服务" },
      { title: "影像与手术服务", desc: "介绍设备环境、术前须知、术后护理和风险提示。", meta: "设备环境" },
    ],
    knowledge: ["什么时候需要带宠物就诊", "疫苗和驱虫怎么安排", "体检需要做哪些项目", "如何预约医生"],
    trust: ["执业资质展示", "医生团队与擅长方向", "设备环境与服务流程", "地址电话与营业时间"],
    cta: "预约问诊",
    disclaimer: "本页面为宠物医疗服务官网 Demo，医生、设备和诊疗内容均为示例信息，不替代线下专业兽医诊断。",
    imageLabels: ["诊室环境", "医生团队", "影像设备"],
    heroImage: petHeroImage,
    sceneImages: [petSceneImage, petHeroImage, petSceneImage],
  },
};

const toneClasses: Record<DemoTone, { bg: string; dark: string; soft: string; accent: string; text: string }> = {
  steel: { bg: "bg-[#eef3f6]", dark: "bg-[#17242c]", soft: "bg-[#dfe9ee]", accent: "text-[#42677a]", text: "text-[#18242a]" },
  sand: { bg: "bg-[#f5efe7]", dark: "bg-[#3a2c24]", soft: "bg-[#ead9c8]", accent: "text-[#8b6544]", text: "text-[#2d211a]" },
  local: { bg: "bg-[#f6f1df]", dark: "bg-[#274137]", soft: "bg-[#e3edd9]", accent: "text-[#5f7f43]", text: "text-[#1f3128]" },
  blue: { bg: "bg-[#edf4ff]", dark: "bg-[#14233f]", soft: "bg-[#dbe8ff]", accent: "text-[#3765a3]", text: "text-[#17223a]" },
  orange: { bg: "bg-[#fff4e8]", dark: "bg-[#432b18]", soft: "bg-[#ffe2bd]", accent: "text-[#a45c1e]", text: "text-[#332111]" },
  violet: { bg: "bg-[#f3efff]", dark: "bg-[#21183f]", soft: "bg-[#e4dcff]", accent: "text-[#6049a9]", text: "text-[#201936]" },
  pet: { bg: "bg-[#fff6ed]", dark: "bg-[#34251c]", soft: "bg-[#ffe2cf]", accent: "text-[#9a5d31]", text: "text-[#2d2119]" },
};

function navHref(index: number, total: number) {
  if (index === total - 1) return "#consult";
  if (index === 0 || index === 1) return "#offerings";
  if (index === 2) return "#trust";
  return "#knowledge";
}

export default function IndustryDemoPage({ demoId }: { demoId: string }) {
  const demo = demoData[demoId] ?? demoData.manufacturing;
  const tone = toneClasses[demo.tone];
  const [selectedOfferingIndex, setSelectedOfferingIndex] = useState(0);
  const selectedOffering = demo.offerings[selectedOfferingIndex] ?? demo.offerings[0];

  useEffect(() => {
    const canonicalUrl = `${siteOrigin}/website-create/${demo.id}-demo/`;
    document.title = `${demo.brand}官网 Demo | 坚果猫 JGMAO`;

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute("content", demo.subtitle);
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

    ensureProperty("og:title", `${demo.brand}官网 Demo | 坚果猫 JGMAO`);
    ensureProperty("og:description", demo.subtitle);
    ensureProperty("og:type", "website");
    ensureProperty("og:url", canonicalUrl);
    ensureProperty("og:image", `${siteOrigin}/geo-score-share-cover.png`);
  }, [demo]);

  return (
    <main className={`min-h-screen ${tone.bg} ${tone.text}`}>
      <section className="px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <nav className="fixed inset-x-4 top-4 z-40 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-[1.6rem] border border-white/70 bg-white/82 px-5 py-3 shadow-xl shadow-black/8 backdrop-blur-xl">
            <a href="#" className="inline-flex items-center gap-2 font-semibold">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full ${tone.dark} text-sm text-white`}>{demo.brand.slice(0, 1)}</span>
              {demo.brand}
            </a>
            <div className="flex flex-wrap gap-3 text-sm font-medium opacity-80">
              <Link href="/website-create/" className="inline-flex items-center gap-1 transition hover:opacity-70">
                <ArrowLeft className="h-3.5 w-3.5" />
                行业起点
              </Link>
              {demo.nav.map((item, index) => (
                <a key={item} href={navHref(index, demo.nav.length)} className="transition hover:opacity-70">
                  {item}
                </a>
              ))}
            </div>
            <a href="#consult" className={`inline-flex items-center justify-center rounded-full ${tone.dark} px-4 py-2 text-sm font-semibold text-white`}>
              {demo.cta}
            </a>
          </nav>

          <div className="mt-24 flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-white/70 px-4 py-2 text-sm font-medium shadow-sm">{demo.badge}</span>
          </div>

          <div className="grid gap-8 py-14 lg:grid-cols-[1fr_430px] lg:items-center">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full ${tone.soft} px-4 py-2 text-sm font-semibold ${tone.accent}`}>
                <Sparkles className="h-4 w-4" />
                {demo.label}
              </div>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl">{demo.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-9 opacity-80">{demo.subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#consult" className={`inline-flex items-center justify-center rounded-full ${tone.dark} px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10`}>
                  {demo.cta}
                </a>
                <a href="#offerings" className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/75 px-6 py-3 text-sm font-semibold">
                  查看服务结构
                </a>
              </div>
            </div>

            <DemoVisual demo={demo} tone={tone} />
          </div>
        </div>
      </section>

      <section id="offerings" className="mx-auto grid max-w-6xl gap-6 px-5 pb-10 sm:px-8 lg:grid-cols-[1fr_0.9fr]">
        <article className="rounded-[2rem] bg-white p-6 shadow-sm">
          <p className={`text-sm font-semibold ${tone.accent}`}>核心模块</p>
          <h2 className="mt-3 text-3xl font-semibold">像正式官网一样展示业务和承接咨询</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {demo.imageLabels.map((label, index) => (
              <SceneImage key={label} label={label} imageSrc={demo.sceneImages?.[index]} index={index} tone={tone} />
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {demo.offerings.map((offering, index) => (
              <button
                key={offering.title}
                type="button"
                onClick={() => setSelectedOfferingIndex(index)}
                className={`rounded-[1.4rem] border border-black/10 p-4 text-left transition ${
                  selectedOfferingIndex === index ? `${tone.soft} ring-2 ring-black/10` : "bg-white hover:-translate-y-0.5"
                }`}
              >
                <p className="text-xs font-semibold opacity-60">{offering.meta}</p>
                <p className="mt-2 text-lg font-semibold">{offering.title}</p>
                <p className="mt-3 text-sm leading-7 opacity-75">{offering.desc}</p>
              </button>
            ))}
          </div>
          <div className={`mt-6 rounded-[1.6rem] ${tone.soft} p-5`}>
            <p className="text-xs font-semibold opacity-60">当前查看</p>
            <h3 className="mt-2 text-2xl font-semibold">{selectedOffering.title}</h3>
            <p className="mt-3 text-sm leading-7 opacity-80">{selectedOffering.desc}</p>
          </div>
        </article>

        <article id="knowledge" className={`rounded-[2rem] ${tone.dark} p-6 text-white shadow-sm`}>
          <p className="text-sm font-semibold opacity-70">知识内容 / FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold">把常见问题沉淀成可被 AI 理解的内容资产</h2>
          <div className="mt-6 grid gap-3">
            {demo.knowledge.map((topic) => (
              <div key={topic} className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90">
                {topic}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[0.9fr_1fr]">
        <article className={`rounded-[2rem] border border-black/10 ${tone.soft} p-6`}>
          <p className={`text-sm font-semibold ${tone.accent}`}>信任信号</p>
          <h2 className="mt-3 text-3xl font-semibold">正式官网需要让客户先相信你</h2>
          <TrustVisual tone={tone} />
          <div className="mt-6 grid gap-3">
            {demo.trust.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/65 px-4 py-3">
                <BadgeCheck className={`mt-0.5 h-4 w-4 shrink-0 ${tone.accent}`} />
                <p className="text-sm leading-6 opacity-80">{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article id="consult" className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0ce] px-4 py-2 text-sm font-semibold text-[#7a5a1c]">
            <MessageCircle className="h-4 w-4" />
            下一步
          </div>
          <h2 className="mt-4 text-3xl font-semibold">按这个行业生成官网框架</h2>
          <p className="mt-4 text-sm leading-7 opacity-75">
            添加企微客服后，可以基于企业实际品牌、服务项目、资质素材和获客目标，生成更贴近业务的官网框架与内容填充方向。
          </p>
          <div className="mt-5 rounded-[1.5rem] border border-black/10 bg-[#fbf8ef] p-4">
            <img src={wecomSupportQrImage} alt="坚果猫企微客服二维码" className="mx-auto h-48 w-48 rounded-2xl object-cover" />
            <p className="mt-3 text-center text-sm font-semibold">扫码添加企微客服</p>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-32 sm:px-8">
        <div className="rounded-[1.6rem] border border-black/10 bg-white/70 p-5 text-sm leading-7 opacity-75">
          <p className="font-semibold opacity-100">演示说明</p>
          <p className="mt-2">{demo.disclaimer}</p>
        </div>
      </section>
      <FloatingDemoBar cta={demo.cta} tone={tone} />
    </main>
  );
}

function DemoVisual({ demo, tone }: { demo: IndustryDemo; tone: Record<"bg" | "dark" | "soft" | "accent" | "text", string> }) {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-2xl shadow-black/10 backdrop-blur">
      <div className={`relative min-h-[320px] overflow-hidden rounded-[1.5rem] ${tone.soft} p-6`}>
        {demo.heroImage ? <img src={demo.heroImage} alt={`${demo.brand}官网首页场景图`} className="absolute inset-0 h-full w-full object-cover" /> : null}
        {demo.heroImage ? <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-white/10" /> : null}
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
        <div className={`absolute bottom-6 left-5 h-16 w-28 rounded-full ${tone.dark} opacity-20 blur-xl`} />
        <div className="relative flex min-h-[270px] flex-col justify-between">
          <div className="rounded-3xl bg-white/75 px-4 py-3 shadow-lg shadow-black/10">
            <p className={`text-xs font-semibold ${tone.accent}`}>{demo.label}</p>
            <p className="mt-1 text-lg font-semibold">{demo.brand}</p>
          </div>
          <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
            <div className={`min-h-28 rounded-[1.4rem] ${tone.dark} p-4 text-white shadow-xl shadow-black/10`}>
              <p className="text-xs font-semibold text-white/60">首页主视觉示意</p>
              <p className="mt-3 text-2xl font-semibold leading-tight">{demo.imageLabels[0]}</p>
            </div>
            <div className="grid gap-3">
              {demo.imageLabels.slice(1, 3).map((label) => (
                <div key={label} className="rounded-[1.1rem] bg-white/70 p-3 text-xs font-semibold shadow-sm">
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {demo.offerings.map((item) => (
              <div key={item.title} className="rounded-2xl bg-white/70 px-4 py-3">
                <p className="text-xs font-semibold opacity-60">{item.meta}</p>
                <p className="mt-1 text-sm font-semibold">{item.title}</p>
              </div>
            ))}
          </div>
          <div className={`rounded-2xl ${tone.dark} px-4 py-3 text-sm font-semibold text-white`}>
            {demo.cta}
          </div>
        </div>
      </div>
      <p className="mt-4 rounded-2xl bg-[#fff7e8] px-4 py-3 text-sm leading-6 text-[#6a5636]">
        Demo 重点：展示首屏、核心业务、内容资产、信任信号和咨询入口如何组成一个可对外展示的网站。
      </p>
    </div>
  );
}

function SceneImage({
  label,
  imageSrc,
  index,
  tone,
}: {
  label: string;
  imageSrc?: string;
  index: number;
  tone: Record<"bg" | "dark" | "soft" | "accent" | "text", string>;
}) {
  const height = index === 0 ? "min-h-52" : "min-h-44";

  return (
    <div className={`relative ${height} overflow-hidden rounded-[1.5rem] ${tone.soft} p-4 shadow-inner`}>
      {imageSrc ? <img src={imageSrc} alt={`${label}场景图`} className="absolute inset-0 h-full w-full object-cover" /> : null}
      {imageSrc ? <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-black/8 to-white/8" /> : null}
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/35" />
      <div className={`absolute bottom-4 left-4 h-16 w-24 rounded-full ${tone.dark} opacity-15 blur-xl`} />
      <div className="relative flex h-full flex-col justify-between">
        <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${imageSrc ? "bg-black/28 text-white backdrop-blur" : `bg-white/75 ${tone.accent}`}`}>
          场景示意
        </span>
        <div>
          {imageSrc ? null : <div className={`mb-3 h-16 rounded-[1rem] ${tone.dark} opacity-85`} />}
          <p className={`text-lg font-semibold ${imageSrc ? "text-white drop-shadow" : ""}`}>{label}</p>
        </div>
      </div>
    </div>
  );
}

function TrustVisual({ tone }: { tone: Record<"bg" | "dark" | "soft" | "accent" | "text", string> }) {
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-3">
      {["资质证书", "客户评价", "团队/环境"].map((label, index) => (
        <div key={label} className="rounded-[1.3rem] bg-white/70 p-4 shadow-sm">
          <div className={`h-20 rounded-[1rem] ${index === 1 ? tone.dark : tone.soft} ${index === 1 ? "opacity-90" : ""}`} />
          <p className={`mt-3 text-sm font-semibold ${tone.accent}`}>{label}</p>
          <div className="mt-2 grid gap-1.5">
            <div className="h-2 rounded-full bg-black/10" />
            <div className="h-2 w-2/3 rounded-full bg-black/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FloatingDemoBar({ cta, tone }: { cta: string; tone: Record<"bg" | "dark" | "soft" | "accent" | "text", string> }) {
  return (
    <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-3xl rounded-[1.4rem] border border-white/70 bg-white/88 p-3 shadow-2xl shadow-black/15 backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold">想生成类似官网框架？可直接添加企微确认行业、素材和上线节奏。</p>
        <a href="#consult" className={`inline-flex shrink-0 items-center justify-center rounded-full ${tone.dark} px-5 py-2.5 text-sm font-semibold text-white`}>
          {cta}
        </a>
      </div>
    </div>
  );
}
