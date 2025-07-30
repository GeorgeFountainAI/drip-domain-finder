import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AppPage from "./pages/AppPage";
import Checkout from "./pages/Checkout";

import Admin from "./pages/Admin";
import AdminDeploy from "./pages/AdminDeploy";
import AdminLogs from "./pages/AdminLogs";
import AdminSetup from "./pages/AdminSetup";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookie from "./pages/Cookie";
import ServerError from "./pages/ServerError";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/app" element={<AppPage />} />
            <Route path="/search" element={<AppPage />} />
            <Route path="/checkout" element={<Checkout />} />
            
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/deploy" element={<AdminDeploy />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/admin/setup" element={<AdminSetup />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookie" element={<Cookie />} />
            <Route path="/error" element={<ServerError />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
