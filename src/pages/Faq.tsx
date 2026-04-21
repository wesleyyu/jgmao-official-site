import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, HelpCircle, MoveUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

import logoImage from "@/assets/jgmao-logo-black-square.png";
import { getFeaturedFaqs, getPublishedFaqs, type FaqItem } from "@/content/faqs";
import { cn } from "@/lib/utils";

type Locale = "zh" | "en";

type FaqPageProps = {
  locale: Locale;
};

const siteUrl = "http://49.232.252.118:8800";

function t(text: Record<Locale, string>, locale: Locale) {
  return text[locale];
}

function setPageMeta(title: string, description: string) {
  document.title = title;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", description);
  }
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

function FaqCard({
  item,
  locale,
  expanded,
  onToggle,
  index,
  featured = false,
}: {
  item: FaqItem;
  locale: Locale;
  expanded: boolean;
  onToggle: () => void;
  index: number;
  featured?: boolean;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn(
        "rounded-[1.7rem] border border-white/10 bg-white/6 shadow-[0_18px_80px_rgba(0,0,0,0.22)] backdrop-blur",
        featured ? "p-5" : "px-4 py-4",
      )}
    >
      <button type="button" onClick={onToggle} className="w-full text-left">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 px-2 text-[11px] uppercase tracking-[0.16em] text-slate-300">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            {featured ? (
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{locale === "zh" ? `重点问题 0${index + 1}` : `Featured Q0${index + 1}`}</p>
            ) : null}
            <div className={cn("flex items-start justify-between gap-3", featured && "mt-3")}>
              <h3 className={cn("font-semibold text-white", featured ? "text-xl" : "text-base")}>{t(item.question, locale)}</h3>
              <ArrowRight className={cn("mt-1 h-4 w-4 shrink-0 text-slate-400 transition", expanded && "rotate-90 text-white")} />
            </div>
            <div className={cn("overflow-hidden transition-[max-height,opacity,margin] duration-300", expanded ? "mt-3 max-h-[520px] opacity-100" : "max-h-0 opacity-0")}>
              <p className="text-sm leading-7 text-slate-300">{t(item.answer, locale)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={tag.en} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                    {t(tag, locale)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </button>
    </motion.article>
  );
}

export function FaqIndexPage({ locale }: FaqPageProps) {
  const featuredFaqs = getFeaturedFaqs();
  const allFaqs = getPublishedFaqs();
  const moreFaqs = allFaqs.filter((item) => !item.featured);
  const [activeIds, setActiveIds] = useState<string[]>(featuredFaqs.slice(0, 1).map((item) => item.id));

  useEffect(() => {
    setCanonical(`${siteUrl}/faq`);
    setPageMeta(
      locale === "zh" ? "FAQ | 坚果猫 JGMAO" : "FAQ | JGMAO",
      locale === "zh"
        ? "持续更新的 FAQ 栏目，围绕坚果猫 JGMAO 的 GEO、AI 增长网站、内容系统、获客转化与合作方式沉淀高频问题。"
        : "A continuously updated FAQ hub covering JGMAO's GEO, AI growth websites, content systems, lead conversion, and collaboration model.",
    );
  }, [locale]);

  useEffect(() => {
    const scriptId = "jgmao-faq-structured-data";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: allFaqs.map((item) => ({
          "@type": "Question",
          name: t(item.question, locale),
          acceptedAnswer: {
            "@type": "Answer",
            text: t(item.answer, locale),
          },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: locale === "zh" ? "FAQ | 坚果猫 JGMAO" : "FAQ | JGMAO",
        url: `${siteUrl}/faq`,
        inLanguage: locale === "zh" ? "zh-CN" : "en",
        description:
          locale === "zh"
            ? "围绕坚果猫 JGMAO 的 GEO、AI 增长网站、内容系统、获客转化与合作方式沉淀高频问题。"
            : "Frequently asked questions about JGMAO's GEO, AI growth websites, content systems, conversion, and collaboration.",
        publisher: {
          "@type": "Organization",
          name: locale === "zh" ? "坚果猫 JGMAO" : "JGMAO",
          logo: {
            "@type": "ImageObject",
            url: new URL(logoImage, window.location.origin).href,
          },
        },
      },
    ];

    script.textContent = JSON.stringify(structuredData);

    return () => {
      script?.remove();
    };
  }, [allFaqs, locale]);

  const toggle = (id: string) => {
    setActiveIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(82,230,255,0.14),transparent_24%),radial-gradient(circle_at_90%_18%,rgba(245,197,92,0.12),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(181,146,255,0.12),transparent_28%),linear-gradient(180deg,#050816_0%,#091222_38%,#050816_100%)]" />
      <div className="pointer-events-none absolute inset-0 ops-grid opacity-20" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 pb-10 pt-8 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/8">
            <ArrowLeft className="h-4 w-4" />
            {locale === "zh" ? "返回首页" : "Back to home"}
          </Link>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.76fr_1.24fr]">
          <article className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">FAQ</p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.45rem]">
              {locale === "zh" ? "持续更新的 FAQ 栏目" : "A continuously updated FAQ hub"}
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-300">
              {locale === "zh"
                ? "这里持续沉淀坚果猫 JGMAO 关于 GEO、AI 增长网站、内容系统、智能获客与合作方式的高频问题。首页只保留精选入口，完整问题与回答都集中在这里。"
                : "This hub continually captures JGMAO's most frequent questions about GEO, AI growth websites, content systems, intelligent lead capture, and collaboration."}
            </p>
          </article>

          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {featuredFaqs.map((item, index) => (
                <FaqCard
                  key={item.id}
                  item={item}
                  locale={locale}
                  index={index}
                  featured
                  expanded={activeIds.includes(item.id)}
                  onToggle={() => toggle(item.id)}
                />
              ))}
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/45 p-5 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{locale === "zh" ? "更多问题" : "More Questions"}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {locale === "zh"
                      ? "更多问题会持续围绕坚果猫的能力边界、合作方式与整站增长系统更新。"
                      : "More questions will continue to cover JGMAO's boundaries, collaboration model, and site-wide growth system."}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                  <HelpCircle className="h-3.5 w-3.5" />
                  {allFaqs.length} {locale === "zh" ? "个问题" : "questions"}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {moreFaqs.map((item, index) => (
                  <FaqCard
                    key={item.id}
                    item={item}
                    locale={locale}
                    index={index + featuredFaqs.length}
                    expanded={activeIds.includes(item.id)}
                    onToggle={() => toggle(item.id)}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/insights" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/8">
                {locale === "zh" ? "查看新闻 / 洞察" : "View Insights"}
                <MoveUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
