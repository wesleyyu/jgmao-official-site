import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, CircleAlert, ExternalLink, Globe2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";

import { siteOrigin } from "@/lib/share";

type ReportItem = {
  key: string;
  label: string;
  ok: boolean;
  weight: number;
  positive: string;
  negative: string;
};

type ReportDimension = {
  key: string;
  title: string;
  score: number;
  rawScore: number;
  maxScore: number;
  items: ReportItem[];
};

type ReportAdvice = {
  priority: number;
  title: string;
  summary: string;
};

type GeoReport = {
  token: string;
  createdAt: string;
  reportUrl: string;
  input: {
    name: string;
    company: string;
    contact: string;
    websiteUrl: string;
    source: string;
    page: string;
  };
  result: {
    score: number;
    level: string;
    strengths: string[];
    priorities: string[];
    checkedUrl: string;
    dimensions?: ReportDimension[];
    deepAdvice?: ReportAdvice[];
  };
};

const dimensionLabelMap: Record<string, string> = {
  crawl: "抓取基础",
  theme: "主题结构",
  ai: "AI信号",
  content: "内容资产",
  convert: "承接转化",
  trust: "信任背书",
};

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

function setCanonical(url: string) {
  let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function formatBeijingTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date).replace(/\//g, "-");
}

function scoreTone(score: number) {
  if (score >= 85) return "text-emerald-300";
  if (score >= 65) return "text-amber-200";
  return "text-rose-200";
}

function scoreSurface(score: number) {
  if (score >= 85) return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  if (score >= 65) return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  return "border-rose-300/20 bg-rose-300/10 text-rose-100";
}

function dimensionRisk(score: number) {
  if (score >= 85) return { label: "低风险", tone: "text-emerald-200", chip: "border-emerald-300/20 bg-emerald-300/10" };
  if (score >= 65) return { label: "中风险", tone: "text-amber-100", chip: "border-amber-300/20 bg-amber-300/10" };
  return { label: "高风险", tone: "text-rose-100", chip: "border-rose-300/20 bg-rose-300/10" };
}

function radarPoint(index: number, total: number, ratio: number, radius: number, center: number) {
  const angle = (-Math.PI / 2) + (Math.PI * 2 * index) / total;
  const x = center + Math.cos(angle) * radius * ratio;
  const y = center + Math.sin(angle) * radius * ratio;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

function pointTuple(index: number, total: number, ratio: number, radius: number, center: number) {
  return radarPoint(index, total, ratio, radius, center)
    .split(",")
    .map(Number) as [number, number];
}

function domainFromUrl(value?: string) {
  if (!value) return "";
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

export default function GeoReportPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token || "";
  const [report, setReport] = useState<GeoReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const canonicalUrl = `${siteOrigin}/geo-report/${token}/`;
    setCanonical(canonicalUrl);
    setPageMeta("官网 GEO 详细分析报告 | 坚果猫 JGMAO", "内部查看用的官网 GEO 详细分析报告。");
    setNamedMeta("robots", "noindex, nofollow, noarchive");
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function fetchReport() {
      if (!token) {
        setError("报告链接无效。");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/lead/submit", {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({ type: "geo-report-fetch", token }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false || !payload?.report) {
          throw new Error(payload?.error || "报告不存在或已过期。");
        }
        if (!cancelled) {
          setReport(payload.report as GeoReport);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "报告读取失败。");
          setReport(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchReport();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const dimensionList = useMemo(() => report?.result.dimensions || [], [report]);
  const deepAdvice = useMemo(() => report?.result.deepAdvice || [], [report]);
  const weakestDimension = useMemo(
    () => [...dimensionList].sort((a, b) => a.score - b.score)[0] || null,
    [dimensionList],
  );
  const strongestDimension = useMemo(
    () => [...dimensionList].sort((a, b) => b.score - a.score)[0] || null,
    [dimensionList],
  );
  const adviceBuckets = useMemo(() => {
    const source = deepAdvice.length
      ? deepAdvice
      : report?.result.priorities.map((item, index) => ({
          priority: index === 0 ? 1 : index === 1 ? 2 : 3,
          title: item,
          summary: item,
        })) || [];

    return {
      immediate: source.filter((item) => item.priority <= 1),
      near: source.filter((item) => item.priority === 2),
      later: source.filter((item) => item.priority >= 3),
    };
  }, [deepAdvice, report?.result.priorities]);
  const managementSummary = useMemo(() => {
    if (!report) return null;
    const score = report.result.score;
    const currentState =
      score >= 85
        ? "官网 GEO 基础已经比较完整，适合从“基础合规”进入“内容增长与规模化覆盖”阶段。"
        : score >= 65
          ? "官网 GEO 基础可用，但主题结构、AI 信号与承接路径仍有明显优化空间。"
          : "官网 GEO 基础仍不稳定，建议先完成关键基础项补齐，再推进内容增长。";

    const coreGap = weakestDimension
      ? `${weakestDimension.title} 是当前最明显的短板，建议优先处理相关基础项与结构问题。`
      : "建议优先处理当前评分中的未通过项。";

    const firstMove = adviceBuckets.immediate[0]?.title
      || report.result.priorities[0]
      || "先完成基础结构、FAQ 与承接路径的关键补齐。";

    return {
      currentState,
      coreGap,
      firstMove: `顾问切入建议：优先从“${firstMove}”开始沟通，更容易形成客户共识。`,
    };
  }, [adviceBuckets.immediate, report, weakestDimension]);
  const radarRings = [0.25, 0.5, 0.75, 1];
  const radarViewBox = 264;
  const radarCenter = 132;
  const radarRadius = 64;
  const radarLabelRatio = 1.18;
  const radarPolygon = useMemo(() => {
    if (!dimensionList.length) return "";
    return dimensionList
      .map((dimension, index) =>
        radarPoint(index, dimensionList.length, Math.max(0.12, Math.min(1, dimension.score / 100)), radarRadius, radarCenter),
      )
      .join(" ");
  }, [dimensionList]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(82,230,255,0.14),transparent_24%),radial-gradient(circle_at_90%_18%,rgba(245,197,92,0.12),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(181,146,255,0.12),transparent_28%),linear-gradient(180deg,#050816_0%,#091222_38%,#050816_100%)]" />
      <div className="pointer-events-none absolute inset-0 ops-grid opacity-20" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-5 pb-12 pt-8 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/geo-score/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/8">
            <ArrowLeft className="h-4 w-4" />
            返回评分器
          </Link>
          {report?.result?.checkedUrl ? (
            <a
              href={report.result.checkedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-300/15"
            >
              查看官网
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <article className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">官网 GEO 详细分析报告</p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-[2.45rem]">基础分 + 分维度诊断 + 深度建议</h1>
            <p className="mt-4 text-base leading-8 text-slate-300">
              这份报告用于内部沟通与跟进，帮助快速判断官网在抓取基础、主题结构、AI 信号与转化承接上的现状，并明确下一步优先改进方向。
            </p>

            {isLoading ? (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">正在读取详细分析报告...</div>
            ) : null}

            {error ? (
              <div className="mt-6 rounded-[1.5rem] border border-rose-300/20 bg-rose-300/10 p-5 text-sm leading-7 text-rose-100">
                {error}
              </div>
            ) : null}

            {report ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">基础评分</p>
                  <div className="mt-3 flex items-end gap-3">
                    <span className={`text-5xl font-semibold tracking-tight ${scoreTone(report.result.score)}`}>{report.result.score}</span>
                    <span className="pb-1 text-sm text-slate-400">/ 100</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{report.result.level}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">检测域名</p>
                    <p className="mt-3 text-sm font-medium text-white break-all">{domainFromUrl(report.result.checkedUrl)}</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">诊断维度</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{dimensionList.length || 6}</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">建议优先项</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{deepAdvice.length || report.result.priorities.length}</p>
                  </div>
                </div>

                {managementSummary ? (
                  <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">管理层摘要</p>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-slate-100">
                      <p>• {managementSummary.currentState}</p>
                      <p>• {managementSummary.coreGap}</p>
                      <p>• {managementSummary.firstMove}</p>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">提交信息</p>
                  <div className="mt-4 space-y-2 text-sm leading-7 text-slate-300">
                    <p>官网网址：{report.input.websiteUrl || "未填写"}</p>
                    <p>公司 / 品牌：{report.input.company || "未填写"}</p>
                    <p>姓名 / 称呼：{report.input.name || "未填写"}</p>
                    <p>联系方式：{report.input.contact || "未填写"}</p>
                    <p>提交时间：{formatBeijingTime(report.createdAt)}（北京时间）</p>
                  </div>
                </div>
              </div>
            ) : null}
          </article>

          <div className="space-y-5">
            {report ? (
              <>
                <motion.article
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-[1.8rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                    <ShieldCheck className="h-4 w-4" />
                    评分维度总览
                  </div>
                  <div className="mt-5 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-semibold text-white">维度雷达图</p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">用 6 个关键维度快速判断官网 GEO 的基础完整度，越接近外圈说明该维度越完整。</p>
                      {dimensionList.length ? (
                        <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-slate-950/45 p-3">
                          <svg viewBox={`0 0 ${radarViewBox} ${radarViewBox}`} className="mx-auto h-[264px] w-full max-w-[280px] overflow-visible">
                            {radarRings.map((ring) => (
                              <polygon
                                key={ring}
                                points={dimensionList.map((_, index) => radarPoint(index, dimensionList.length, ring, radarRadius, radarCenter)).join(" ")}
                                fill="none"
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="1"
                              />
                            ))}
                            {dimensionList.map((dimension, index) => (
                              <g key={dimension.key}>
                                {(() => {
                                  const [axisX, axisY] = pointTuple(index, dimensionList.length, 1, radarRadius, radarCenter);
                                  const [labelX, labelY] = pointTuple(index, dimensionList.length, radarLabelRatio, radarRadius, radarCenter);
                                  return (
                                    <>
                                <line
                                  x1={radarCenter}
                                  y1={radarCenter}
                                  x2={axisX}
                                  y2={axisY}
                                  stroke="rgba(255,255,255,0.08)"
                                  strokeWidth="1"
                                />
                                <text
                                  x={labelX}
                                  y={labelY}
                                  fill="rgba(226,232,240,0.92)"
                                  fontSize="8.5"
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  {dimensionLabelMap[dimension.key] || dimension.title}
                                </text>
                                    </>
                                  );
                                })()}
                              </g>
                            ))}
                            <polygon
                              points={radarPolygon}
                              fill="rgba(82,230,255,0.22)"
                              stroke="rgba(125,211,252,0.95)"
                              strokeWidth="2"
                            />
                            {dimensionList.map((dimension, index) => {
                              const point = radarPoint(
                                index,
                                dimensionList.length,
                                Math.max(0.12, Math.min(1, dimension.score / 100)),
                                radarRadius,
                                radarCenter,
                              ).split(",");
                              return (
                                <circle
                                  key={`${dimension.key}-point`}
                                  cx={Number(point[0])}
                                  cy={Number(point[1])}
                                  r="3.5"
                                  fill="rgb(103 232 249)"
                                />
                              );
                            })}
                          </svg>
                        </div>
                      ) : null}
                      {strongestDimension || weakestDimension ? (
                        <div className="mt-4 grid gap-3">
                          {strongestDimension ? (
                            <div className={`rounded-2xl border px-4 py-3 ${scoreSurface(strongestDimension.score)}`}>
                              <p className="text-xs uppercase tracking-[0.18em] opacity-70">当前强项</p>
                              <p className="mt-2 text-sm font-medium">{strongestDimension.title}</p>
                            </div>
                          ) : null}
                          {weakestDimension ? (
                            <div className={`rounded-2xl border px-4 py-3 ${scoreSurface(weakestDimension.score)}`}>
                              <p className="text-xs uppercase tracking-[0.18em] opacity-70">当前短板</p>
                              <p className="mt-2 text-sm font-medium">{weakestDimension.title}</p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="grid gap-4">
                    {dimensionList.map((dimension) => (
                      <div key={dimension.key} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-white">{dimension.title}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                              {dimension.rawScore} / {dimension.maxScore}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-semibold ${scoreTone(dimension.score)}`}>{dimension.score}</span>
                            <div className="mt-1">
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] ${dimensionRisk(dimension.score).chip} ${dimensionRisk(dimension.score).tone}`}>
                                {dimensionRisk(dimension.score).label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300" style={{ width: `${dimension.score}%` }} />
                        </div>
                        <div className="mt-4 space-y-2">
                          {dimension.items.map((item) => (
                            <div key={item.key} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-3">
                              {item.ok ? (
                                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                              ) : (
                                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-white">{item.label}</p>
                                <p className="mt-1 text-sm leading-7 text-slate-300">{item.ok ? item.positive : item.negative}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                </motion.article>

                <motion.article
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="rounded-[1.8rem] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                    <Globe2 className="h-4 w-4" />
                    深度建议
                  </div>
                  <div className="mt-5 grid gap-4">
                    <div className="rounded-[1.4rem] border border-emerald-300/20 bg-emerald-300/10 p-4">
                      <p className="text-sm font-semibold text-emerald-100">当前亮点</p>
                      <div className="mt-3 space-y-2">
                        {report.result.strengths.map((item) => (
                          <p key={item} className="text-sm leading-7 text-slate-100">
                            • {item}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.4rem] border border-amber-300/20 bg-amber-300/10 p-4">
                      <p className="text-sm font-semibold text-amber-100">优先改进</p>
                      <div className="mt-3 space-y-2">
                        {report.result.priorities.map((item) => (
                          <p key={item} className="text-sm leading-7 text-slate-100">
                            • {item}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-semibold text-white">建议行动顺序</p>
                      <div className="mt-3 space-y-4">
                        {[
                          { title: "立即改", items: adviceBuckets.immediate, tone: "border-rose-300/20 bg-rose-300/10 text-rose-100" },
                          { title: "近期改", items: adviceBuckets.near, tone: "border-amber-300/20 bg-amber-300/10 text-amber-100" },
                          { title: "后续扩展", items: adviceBuckets.later, tone: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100" },
                        ].map((bucket) => (
                          <div key={bucket.title} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-white">{bucket.title}</p>
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] ${bucket.tone}`}>
                                {bucket.items.length || 0} 项
                              </span>
                            </div>
                            <div className="mt-3 space-y-3">
                              {bucket.items.length ? bucket.items.map((item) => (
                                <div key={`${bucket.title}-${item.priority}-${item.title}`} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                  <p className="text-sm font-medium text-white">{item.title}</p>
                                  <p className="mt-2 text-sm leading-7 text-slate-300">{item.summary}</p>
                                </div>
                              )) : (
                                <p className="text-sm leading-7 text-slate-400">当前没有需要重点处理的事项。</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>

                <motion.article
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 }}
                  className="rounded-[1.8rem] border border-cyan-300/15 bg-cyan-300/[0.07] p-5 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-100/70">
                    <Globe2 className="h-4 w-4" />
                    产品分层
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-white">这份报告属于详细版基础报告</h3>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
                    <p>你当前看到的是 <span className="font-medium text-white">留资后解锁的详细版基础报告</span>，包含 6 维诊断、风险等级、优先改进项与高层深度建议。</p>
                    <p>如果需要进一步查看 <span className="font-medium text-white">全站 GEO 体检、改造机会清单与优先级路线图</span>，可升级到专业版。</p>
                    <p><span className="font-medium text-white">网站系统会员</span> 可免费获得专业版诊断能力，用于持续跟踪官网 GEO 升级进展。</p>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">免费版</p>
                      <p className="mt-2 text-sm leading-7 text-slate-200">基础分、简短结论与 2-3 条高层问题。</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-cyan-300/20 bg-cyan-300/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">详细版基础报告</p>
                      <p className="mt-2 text-sm leading-7 text-slate-100">6 维诊断、雷达图、风险等级、优先改进项与高层建议。</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">专业版 / 会员权益</p>
                      <p className="mt-2 text-sm leading-7 text-slate-200">全站体检、改造机会清单、优先级路线图，会员可免费获取。</p>
                    </div>
                  </div>
                </motion.article>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
