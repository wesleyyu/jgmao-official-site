import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, FileSearch, MoveUpRight, Radar, Workflow } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";

import { getInsightArticleBySlug, getPublishedInsights, type InsightArticle } from "@/content/insights";
import { cn } from "@/lib/utils";

type Locale = "zh" | "en";

type InsightsPageProps = {
  locale: Locale;
};

const iconMap = {
  radar: Radar,
  workflow: Workflow,
  "file-search": FileSearch,
} as const;

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

function InsightHero({ article, locale }: { article: InsightArticle; locale: Locale }) {
  const Icon = iconMap[article.iconKey];

  return (
    <article className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-slate-300">
          {t(article.category, locale)}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" />
          {article.publishedAt}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-slate-400">
          {article.readingTime}
        </span>
      </div>

      <div className="mt-5 flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border"
          style={{ borderColor: `${article.accent}55`, backgroundColor: `${article.accent}22`, color: article.accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-[2.5rem]">{t(article.title, locale)}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{t(article.description, locale)}</p>
        </div>
      </div>
    </article>
  );
}

export function InsightsIndexPage({ locale }: InsightsPageProps) {
  const insights = getPublishedInsights();

  useEffect(() => {
    setPageMeta(
      locale === "zh" ? "新闻 / 洞察 | 坚果猫 JGMAO" : "News / Insights | JGMAO",
      locale === "zh"
        ? "坚果猫 JGMAO 关于 GEO、AI 增长网站、内容结构与增长方法论的持续洞察栏目。"
        : "JGMAO's continuously updated insights on GEO, AI growth websites, content systems, and growth methodology.",
    );
  }, [locale]);

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
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "新闻 / 洞察" : "News / Insights"}</p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.45rem]">
              {locale === "zh" ? "持续更新的内容栏目" : "A continuously updated insight hub"}
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-300">
              {locale === "zh"
                ? "这里承载坚果猫关于 GEO、AI 增长网站、内容结构、案例延展与增长方法论的持续内容输出。首页只保留轻入口，完整内容在这里持续沉淀。"
                : "This hub holds JGMAO's ongoing content about GEO, AI growth websites, content systems, case extensions, and growth methodology."}
            </p>
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{locale === "zh" ? "后续内容机制" : "Content Workflow"}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {locale === "zh"
                  ? "当前采用本地内容文件机制，后续可通过 OpenClaw 的 JGMAO Support Agent 与飞书协同生成、审核与发布文章。"
                  : "The current system uses local content files and can later connect OpenClaw's JGMAO Support Agent with Feishu for drafting, review, and publishing."}
              </p>
            </div>
          </article>

          <div className="space-y-4">
            {insights.map((article, index) => {
              const Icon = iconMap[article.iconKey];

              return (
                <motion.article
                  key={article.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/6 shadow-[0_18px_80px_rgba(0,0,0,0.22)] backdrop-blur"
                >
                  <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${article.accent}, transparent 88%)` }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
                          style={{ borderColor: `${article.accent}55`, backgroundColor: `${article.accent}22`, color: article.accent }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-slate-300">
                            {t(article.category, locale)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{article.publishedAt}</span>
                    </div>

                    <h2 className="mt-5 text-2xl font-semibold text-white">{t(article.title, locale)}</h2>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{t(article.summary, locale)}</p>

                    <div className="mt-5 flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                        {article.metric}
                        <span className="text-slate-500">/</span>
                        {t(article.metricLabel, locale)}
                      </span>

                      <Link
                        href={`/insights/${article.slug}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/8"
                      >
                        {locale === "zh" ? "查看文章" : "Read article"}
                        <MoveUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

export function InsightDetailPage({ locale }: InsightsPageProps) {
  const params = useParams();
  const [, setLocation] = useLocation();
  const article = params?.slug ? getInsightArticleBySlug(params.slug) : undefined;

  useEffect(() => {
    if (!article) {
      setPageMeta(
        locale === "zh" ? "文章未找到 | 坚果猫 JGMAO" : "Article not found | JGMAO",
        locale === "zh" ? "未找到对应的新闻 / 洞察内容。" : "The requested insight article could not be found.",
      );
      return;
    }

    setPageMeta(t(article.seoTitle, locale), t(article.seoDescription, locale));
  }, [article, locale]);

  if (!article) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
        <div className="relative mx-auto flex min-h-screen w-full max-w-[960px] flex-col px-5 pb-10 pt-8 sm:px-6 lg:px-10">
          <Link href="/insights" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/8">
            <ArrowLeft className="h-4 w-4" />
            {locale === "zh" ? "返回新闻 / 洞察" : "Back to Insights"}
          </Link>
          <div className="mt-10 rounded-[2rem] border border-white/10 bg-slate-950/55 p-8 text-center backdrop-blur-xl">
            <h1 className="text-3xl font-semibold text-white">{locale === "zh" ? "文章未找到" : "Article not found"}</h1>
            <p className="mt-4 text-base leading-8 text-slate-300">
              {locale === "zh" ? "这个内容暂时不可用，请返回新闻 / 洞察列表查看其他文章。" : "This content is not available. Please go back to the insights list."}
            </p>
            <button
              type="button"
              onClick={() => setLocation("/insights")}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/8"
            >
              {locale === "zh" ? "查看全部内容" : "View all insights"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(82,230,255,0.14),transparent_24%),radial-gradient(circle_at_90%_18%,rgba(245,197,92,0.12),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(181,146,255,0.12),transparent_28%),linear-gradient(180deg,#050816_0%,#091222_38%,#050816_100%)]" />
      <div className="pointer-events-none absolute inset-0 ops-grid opacity-20" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1080px] flex-col px-5 pb-12 pt-8 sm:px-6 lg:px-10">
        <Link href="/insights" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/8">
          <ArrowLeft className="h-4 w-4" />
          {locale === "zh" ? "返回新闻 / 洞察" : "Back to Insights"}
        </Link>

        <section className="mt-8 space-y-6">
          <InsightHero article={article} locale={locale} />

          <article className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
            <div className="space-y-6">
              {article.sections.map((section) => (
                <section key={section.title.en} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <h2 className="text-xl font-semibold text-white">{t(section.title, locale)}</h2>
                  <p className="mt-3 text-base leading-8 text-slate-300">{t(section.body, locale)}</p>
                  {section.bullets?.length ? (
                    <div className="mt-4 space-y-2">
                      {section.bullets.map((bullet) => (
                        <div key={bullet.en} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3">
                          <span className="mt-1 h-2 w-2 rounded-full bg-cyan-200" />
                          <p className="text-sm leading-7 text-slate-200">{t(bullet, locale)}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
