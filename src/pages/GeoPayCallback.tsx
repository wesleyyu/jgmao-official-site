import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

declare global {
  interface Window {
    WeixinJSBridge?: {
      invoke: (
        name: string,
        payload: Record<string, unknown>,
        callback: (result: { err_msg?: string }) => void,
      ) => void;
    };
  }
}

type PayParams = {
  appId: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
};

type OrderPayload = {
  orderNo: string;
  planTitle: string;
  amountLabel: string;
};

type PrepareResponse = {
  ok: boolean;
  order?: OrderPayload;
  payParams?: PayParams;
  returnUrl?: string;
  error?: string;
};

function setPageMeta(title: string) {
  document.title = title;
}

export default function GeoPayCallbackPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const orderNo = params.get("orderNo")?.trim() || "";
  const returnUrl = params.get("returnUrl")?.trim() || `${window.location.origin}/geo-upgrade/?paid=1`;
  const code = params.get("code")?.trim() || "";

  const [order, setOrder] = useState<OrderPayload | null>(null);
  const [statusText, setStatusText] = useState("正在准备微信支付，请稍候。");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    setPageMeta("微信支付回调 | 坚果猫 JGMAO");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function prepareAndPay() {
      if (!orderNo || !code) {
        setErrorText("支付回调参数不完整，请返回上一页重新发起支付。");
        setStatusText("无法继续拉起微信支付。");
        return;
      }

      try {
        const response = await fetch(
          `/api/lead/submit?payment=prepare&orderNo=${encodeURIComponent(orderNo)}&returnUrl=${encodeURIComponent(returnUrl)}&code=${encodeURIComponent(code)}`,
          { cache: "no-store" },
        );
        const payload = (await response.json().catch(() => ({}))) as PrepareResponse;
        if (!response.ok || payload.ok === false || !payload.payParams || !payload.order) {
          throw new Error(payload.error || "支付初始化失败，请稍后重试。");
        }
        if (cancelled) {
          return;
        }
        setOrder(payload.order);
        setStatusText("微信支付已准备就绪，正在尝试拉起支付。");

        const invokePay = () => {
          if (!window.WeixinJSBridge) {
            setStatusText("正在等待微信支付环境加载完成。");
            document.addEventListener("WeixinJSBridgeReady", invokePay, { once: true });
            return;
          }
          window.WeixinJSBridge.invoke(
            "getBrandWCPayRequest",
            {
              appId: payload.payParams?.appId,
              timeStamp: payload.payParams?.timeStamp,
              nonceStr: payload.payParams?.nonceStr,
              package: payload.payParams?.package,
              signType: payload.payParams?.signType,
              paySign: payload.payParams?.paySign,
            },
            (result) => {
              const errMsg = result?.err_msg || "";
              if (errMsg === "get_brand_wcpay_request:ok") {
                window.location.href = payload.returnUrl || returnUrl;
                return;
              }
              setErrorText(`支付未完成：${errMsg || "unknown"}`);
              setStatusText("支付未完成，可再次发起。");
            },
          );
        };

        invokePay();
      } catch (error) {
        if (cancelled) {
          return;
        }
        setErrorText(error instanceof Error ? error.message : "支付初始化失败，请稍后再试。");
        setStatusText("暂时无法继续拉起微信支付。");
      }
    }

    void prepareAndPay();
    return () => {
      cancelled = true;
    };
  }, [code, orderNo, returnUrl]);

  return (
    <main className="min-h-screen bg-[#071224] px-5 py-10 text-slate-100">
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_24px_80px_rgba(2,8,23,0.55)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">微信支付获取</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">{order?.planTitle || "官网 GEO 优化方案"}</h1>
        <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">订单编号</span>
            <span className="text-sm font-semibold text-white">{order?.orderNo || orderNo || "--"}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">支付金额</span>
            <span className="text-sm font-semibold text-cyan-100">{order?.amountLabel || "--"}</span>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-[1.2rem] border border-cyan-300/15 bg-cyan-300/10 p-4">
          <LoaderCircle className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-cyan-200" />
          <div>
            <p className="text-sm leading-7 text-slate-100">{statusText}</p>
            <p className="mt-1 text-xs leading-6 text-slate-400">如果支付弹窗没有自动出现，请稍等片刻或重新发起支付。</p>
          </div>
        </div>

        {errorText ? (
          <div className="mt-4 rounded-[1.2rem] border border-rose-300/20 bg-rose-300/10 p-4 text-sm leading-7 text-rose-100">
            {errorText}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/geo-upgrade/"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
          >
            返回方案页
          </Link>
          <a
            href={returnUrl}
            className="inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/15 px-4 py-2.5 text-sm text-cyan-50 transition hover:bg-cyan-300/20"
          >
            支付完成后返回
          </a>
        </div>
      </div>
    </main>
  );
}
