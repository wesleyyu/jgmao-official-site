import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/Home";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";

const AiGrowthNewPage = lazy(() => import("@/pages/AiGrowthNew"));
const FaqIndexPage = lazy(() => import("@/pages/Faq").then((module) => ({ default: module.FaqIndexPage })));
const GeoReportPage = lazy(() => import("@/pages/GeoReport"));
const GeoScorePage = lazy(() => import("@/pages/GeoScore"));
const GeoPlanPage = lazy(() => import("@/pages/GeoPlan"));
const GeoPayCallbackPage = lazy(() => import("@/pages/GeoPayCallback"));
const GeoUpgradePage = lazy(() => import("@/pages/GeoUpgrade"));
const H5LandingPage = lazy(() => import("@/pages/H5"));
const HealthConsumerDemoPage = lazy(() => import("@/pages/HealthConsumerDemo"));
const InsightDetailPage = lazy(() => import("@/pages/Insights").then((module) => ({ default: module.InsightDetailPage })));
const InsightsIndexPage = lazy(() => import("@/pages/Insights").then((module) => ({ default: module.InsightsIndexPage })));
const IndustryDemoPage = lazy(() => import("@/pages/IndustryDemo"));
const WebsiteCreatePage = lazy(() => import("@/pages/WebsiteCreate"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-sm text-slate-300">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_18px_70px_rgba(15,23,42,0.35)]">
        页面加载中...
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Suspense fallback={<RouteFallback />}>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/insights">
                <InsightsIndexPage locale="zh" />
              </Route>
              <Route path="/insights/">
                <InsightsIndexPage locale="zh" />
              </Route>
              <Route path="/insights/:slug">
                <InsightDetailPage locale="zh" />
              </Route>
              <Route path="/insights/:slug/">
                <InsightDetailPage locale="zh" />
              </Route>
              <Route path="/faq">
                <FaqIndexPage locale="zh" />
              </Route>
              <Route path="/faq/">
                <FaqIndexPage locale="zh" />
              </Route>
              <Route path="/h5">
                <H5LandingPage />
              </Route>
              <Route path="/h5/">
                <H5LandingPage />
              </Route>
              <Route path="/ai-growth">
                <H5LandingPage />
              </Route>
              <Route path="/ai-growth/">
                <H5LandingPage />
              </Route>
              <Route path="/ai-growth-new">
                <AiGrowthNewPage />
              </Route>
              <Route path="/ai-growth-new/">
                <AiGrowthNewPage />
              </Route>
              <Route path="/geo-score">
                <GeoScorePage />
              </Route>
              <Route path="/geo-score/">
                <GeoScorePage />
              </Route>
              <Route path="/geo-upgrade">
                <GeoUpgradePage />
              </Route>
              <Route path="/geo-upgrade/">
                <GeoUpgradePage />
              </Route>
              <Route path="/website-create">
                <WebsiteCreatePage />
              </Route>
              <Route path="/website-create/">
                <WebsiteCreatePage />
              </Route>
              <Route path="/website-create/health-consumer-demo">
                <HealthConsumerDemoPage />
              </Route>
              <Route path="/website-create/health-consumer-demo/">
                <HealthConsumerDemoPage />
              </Route>
              <Route path="/website-create/manufacturing-demo">
                <IndustryDemoPage demoId="manufacturing" />
              </Route>
              <Route path="/website-create/manufacturing-demo/">
                <IndustryDemoPage demoId="manufacturing" />
              </Route>
              <Route path="/website-create/design-service-demo">
                <IndustryDemoPage demoId="design-service" />
              </Route>
              <Route path="/website-create/design-service-demo/">
                <IndustryDemoPage demoId="design-service" />
              </Route>
              <Route path="/website-create/local-service-demo">
                <IndustryDemoPage demoId="local-service" />
              </Route>
              <Route path="/website-create/local-service-demo/">
                <IndustryDemoPage demoId="local-service" />
              </Route>
              <Route path="/website-create/b2b-demo">
                <IndustryDemoPage demoId="b2b" />
              </Route>
              <Route path="/website-create/b2b-demo/">
                <IndustryDemoPage demoId="b2b" />
              </Route>
              <Route path="/website-create/education-demo">
                <IndustryDemoPage demoId="education" />
              </Route>
              <Route path="/website-create/education-demo/">
                <IndustryDemoPage demoId="education" />
              </Route>
              <Route path="/website-create/ai-tech-demo">
                <IndustryDemoPage demoId="ai-tech" />
              </Route>
              <Route path="/website-create/ai-tech-demo/">
                <IndustryDemoPage demoId="ai-tech" />
              </Route>
              <Route path="/website-create/pet-medical-demo">
                <IndustryDemoPage demoId="pet-medical" />
              </Route>
              <Route path="/website-create/pet-medical-demo/">
                <IndustryDemoPage demoId="pet-medical" />
              </Route>
              <Route path="/pay/wechat/callback">
                <GeoPayCallbackPage />
              </Route>
              <Route path="/pay/wechat/callback/">
                <GeoPayCallbackPage />
              </Route>
              <Route path="/geo-pay/callback">
                <GeoPayCallbackPage />
              </Route>
              <Route path="/geo-pay/callback/">
                <GeoPayCallbackPage />
              </Route>
              <Route path="/geo-plan">
                <GeoPlanPage />
              </Route>
              <Route path="/geo-plan/">
                <GeoPlanPage />
              </Route>
              <Route path="/geo-plan/:token">
                <GeoPlanPage />
              </Route>
              <Route path="/geo-plan/:token/">
                <GeoPlanPage />
              </Route>
              <Route path="/geo-report/:token">
                <GeoReportPage />
              </Route>
              <Route path="/geo-report/:token/">
                <GeoReportPage />
              </Route>
              <Route>
                <Home />
              </Route>
            </Switch>
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
