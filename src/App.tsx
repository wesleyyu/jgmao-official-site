import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FaqIndexPage } from "@/pages/Faq";
import Home from "@/pages/Home";
import { InsightDetailPage, InsightsIndexPage } from "@/pages/Insights";
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
            <Route path="/insights/:slug">
              <InsightDetailPage locale="zh" />
            </Route>
            <Route path="/faq">
              <FaqIndexPage locale="zh" />
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
