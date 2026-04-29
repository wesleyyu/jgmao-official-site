import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AiGrowthNewPage from "@/pages/AiGrowthNew";
import { FaqIndexPage } from "@/pages/Faq";
import GeoReportPage from "@/pages/GeoReport";
import GeoScorePage from "@/pages/GeoScore";
import GeoPlanPage from "@/pages/GeoPlan";
import GeoPayCallbackPage from "@/pages/GeoPayCallback";
import GeoUpgradePage from "@/pages/GeoUpgrade";
import H5LandingPage from "@/pages/H5";
import HealthConsumerDemoPage from "@/pages/HealthConsumerDemo";
import Home from "@/pages/Home";
import { InsightDetailPage, InsightsIndexPage } from "@/pages/Insights";
import IndustryDemoPage from "@/pages/IndustryDemo";
import WebsiteCreatePage from "@/pages/WebsiteCreate";
import { Route, Switch } from "wouter";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
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
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
