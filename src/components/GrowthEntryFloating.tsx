import {
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  FileText,
  Globe2,
  LayoutTemplate,
  Radar,
  Sparkles,
} from "lucide-react";
import { type MouseEvent, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

const recentReportStorageKey = "jgmao.geoScore.recentReportToken";

function readRecentReportToken() {
  if (typeof window === "undefined") return "";

  const reportPathMatch = window.location.pathname.match(/^\/geo-report\/([^/]+)\/?$/);
  if (reportPathMatch?.[1]) {
    return decodeURIComponent(reportPathMatch[1]);
  }

  try {
    return window.localStorage.getItem(recentReportStorageKey)?.trim() || "";
  } catch {
    return "";
  }
}

type GrowthEntryItem = {
  title: string;
  desc: string;
  href: string;
  icon: typeof Sparkles;
  requiresReport?: boolean;
};

const baseGrowthEntryItems: GrowthEntryItem[] = [
  {
    title: "AI 增长引擎介绍",
    desc: "了解整体增长系统",
    href: "/ai-growth-new/",
    icon: Sparkles,
  },
  {
    title: "免费 GEO 评分",
    desc: "先看官网基础得分",
    href: "/geo-score/",
    icon: Radar,
  },
  {
    title: "官网生成介绍",
    desc: "没有官网先生成框架",
    href: "/website-create/",
    icon: Globe2,
  },
  {
    title: "官网 GEO 详细报告",
    desc: "评分后免费解锁报告",
    href: "/geo-report/",
    icon: BadgeCheck,
    requiresReport: true,
  },
  {
    title: "官网 GEO 优化方案",
    desc: "获得具体改造路线图",
    href: "/geo-upgrade/",
    icon: FileText,
  },
  {
    title: "官网首页",
    desc: "查看坚果猫官网",
    href: "/",
    icon: LayoutTemplate,
  },
];

type GrowthEntryFloatingProps = {
  className?: string;
};

export default function GrowthEntryFloating({ className = "bottom-5 right-5" }: GrowthEntryFloatingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentReportToken, setRecentReportToken] = useState("");
  const [reportTip, setReportTip] = useState("");

  useEffect(() => {
    setRecentReportToken(readRecentReportToken());

    function handleStorageChange(event: StorageEvent) {
      if (event.key === recentReportStorageKey) {
        setRecentReportToken(readRecentReportToken());
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const growthEntryItems = useMemo(() => {
    return baseGrowthEntryItems.map((item) => {
      if (!item.requiresReport || !recentReportToken) {
        return item;
      }

      return {
        ...item,
        desc: "打开最近一次详细报告",
        href: `/geo-report/${encodeURIComponent(recentReportToken)}/`,
      };
    });
  }, [recentReportToken]);

  function scrollToTop() {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReportEntryClick(event: MouseEvent<HTMLAnchorElement>, item: GrowthEntryItem) {
    if (!item.requiresReport || recentReportToken) {
      setIsOpen(false);
      return;
    }

    event.preventDefault();
    setReportTip("请先进行免费 GEO 评分，评分后可添加企微免费获得详细报告。");
  }

  return (
    <div className={`fixed z-40 flex flex-col items-end gap-3 ${className}`}>
      {isOpen ? (
        <div className="w-[min(22rem,calc(100vw-2.5rem))] rounded-[1.6rem] border border-white/10 bg-slate-950/90 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-2 py-2">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 transition hover:bg-cyan-300/15"
              aria-label="回到页面顶部"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
            >
              收起
            </button>
          </div>
          {reportTip ? (
            <div className="mx-2 mt-2 rounded-2xl border border-amber-200/25 bg-amber-200/10 px-3 py-2 text-xs leading-6 text-amber-50">
              {reportTip}
              <Link
                href="/geo-score/"
                onClick={() => setIsOpen(false)}
                className="ml-2 inline-flex font-semibold text-cyan-100 underline decoration-cyan-100/40 underline-offset-4"
              >
                去免费 GEO 评分
              </Link>
            </div>
          ) : null}
          <div className="mt-2 grid gap-2">
            {growthEntryItems.map((item) => {
              const Icon = item.icon;
              const itemClassName =
                "group flex items-center gap-3 rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-3 py-3 transition hover:border-cyan-200/35 hover:bg-white/[0.08]";
              const content = (
                <>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{item.title}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">{item.desc}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-100" />
                </>
              );

              return item.href.includes("#") ? (
                <a key={item.title} href={item.href} onClick={() => setIsOpen(false)} className={itemClassName}>
                  {content}
                </a>
              ) : (
                <Link key={item.title} href={item.href} onClick={(event) => handleReportEntryClick(event, item)} className={itemClassName}>
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-200 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_48px_rgba(34,211,238,0.22)] transition hover:bg-cyan-100"
      >
        <LayoutTemplate className="h-4 w-4" />
        增长入口
      </button>
    </div>
  );
}
