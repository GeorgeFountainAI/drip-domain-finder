 import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AppPage from "./pages/AppPage";
import Checkout from "./pages/Checkout";
import PremiumDomains from "./pages/PremiumDomains";
import FeaturedDomains from "./pages/FeaturedDomains";
import FAQ from "./pages/FAQ";

import Admin from "./pages/Admin";
import AdminCredits from "./pages/AdminCredits";
import AdminDeploy from "./pages/AdminDeploy";
import AdminLogs from "./pages/AdminLogs";
import AdminSetup from "./pages/AdminSetup";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookie from "./pages/Cookie";
import ServerError from "./pages/ServerError";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { Helmet } from "react-helmet";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <Helmet>
          <title>DomainDrip - Premium Domain Finder</title>
        </Helmet>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/app" element={<AppPage />} />
            <Route path="/search" element={<AppPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/premium-domains" element={<PremiumDomains />} />
            <Route path="/featured-domains" element={<FeaturedDomains />} />
            <Route path="/faq" element={<FAQ />} />
            {/* <Route path="/dripapps" element={<DripApps />} /> */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/credits" element={<AdminCredits />} />
            <Route path="/admin/deploy" element={<AdminDeploy />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/admin/setup" element={<AdminSetup />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookie" element={<Cookie />} />
            <Route path="/error" element={<ServerError />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
