import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Search, TrendingUp, Shield, Gem, Brain, Target, Mail, FileText, Users, Star, Zap, DollarSign, Calendar, Award, Droplets, Globe, ChevronRight, Play, BarChart3, HelpCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import appPreviewImage from "@/assets/app-preview.jpg";
import demoFrame1 from "@/assets/demo-frame-1-signin.jpg";
import demoFrame2 from "@/assets/demo-frame-2-credits.jpg";
import demoFrame3 from "@/assets/demo-frame-3-search.jpg";
import domainDripLogo from "/lovable-uploads/54151200-6cf6-4c1b-b88a-bc150fc097c8.png";
import FAQPreview from "@/components/FAQPreview";
import CreditBalance from "@/components/CreditBalance";
const LandingPage = () => {
  const [user, setUser] = useState(null);

  // FlipScore utility functions
  const normalizeFlipScore = (rawScore: number): number => {
    if (rawScore <= 10) return rawScore; // Already on 1-10 scale
    return Math.round(rawScore / 10); // Normalize from 1-100 to 1-10
  };
  const getFlipScoreBadge = (score: number) => {
    const normalizedScore = normalizeFlipScore(score);
    if (normalizedScore >= 1 && normalizedScore <= 3) {
      return {
        score: normalizedScore,
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        tooltip: "This domain has limited resale or branding value. Best for personal use only.",
        label: "Low Potential",
        emoji: "🔴"
      };
    } else if (normalizedScore >= 4 && normalizedScore <= 6) {
      return {
        score: normalizedScore,
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
        tooltip: "Some value in niche markets. Could grow with the right brand or audience.",
        label: "Moderate",
        emoji: "🟠"
      };
    } else if (normalizedScore >= 7 && normalizedScore <= 8) {
      return {
        score: normalizedScore,
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        tooltip: "Strong brandability and market appeal. Good flip or investment candidate.",
        label: "High Potential",
        emoji: "🟢"
      };
    } else if (normalizedScore >= 9 && normalizedScore <= 10) {
      return {
        score: normalizedScore,
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        tooltip: "Top-tier potential. Ideal for resale, premium branding, or long-term value.",
        label: "Premium",
        emoji: "🔵"
      };
    }
    return null;
  };

  // Check auth state
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const features = [{
    icon: Crown,
    title: "Premium Domain Curation",
    description: "Hand-picked, brandable domains perfect for startups, entrepreneurs, and businesses across all industries."
  }, {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Advanced AI suggestions that understand market trends and generate high-value, brandable domain names."
  }, {
    icon: BarChart3,
    title: "Flip Score & Valuation",
    description: "Get instant domain valuations and flip potential scores to maximize your digital investment returns."
  }, {
    icon: Target,
    title: "Smart Category Filters",
    description: "Specialized search filters for tech startups, e-commerce, finance, creative agencies, and more."
  }, {
    icon: Shield,
    title: "Verified Marketplace",
    description: "Secure purchasing through trusted registrars with verification for premium domain authenticity."
  }, {
    icon: Globe,
    title: "Strategic Extensions",
    description: "Access to .com, .io, .ai, .tech domains plus emerging extensions perfect for your brand."
  }];
  const featuredDrops = [{
    category: "Tech",
    domains: ["CodeForge.ai", "TechVault.io", "DataStream.dev"],
    color: "from-primary to-primary-glow"
  }, {
    category: "Finance",
    domains: ["WealthBuilder.com", "FinanceFlow.co", "InvestSmart.io"],
    color: "from-secondary to-primary"
  }, {
    category: "Creative",
    domains: ["StudioCraft.com", "DesignVault.io", "BrandForge.co"],
    color: "from-accent to-primary"
  }];
  return <div className="min-h-screen bg-gradient-noir relative overflow-hidden">
      {/* Subtle background for watermark visibility */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-background via-muted/30 to-background" />
      
      {/* Background Logo Watermark - Now clearly visible */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <img src={domainDripLogo} alt="" className="w-[70vw] h-[70vh] object-contain opacity-[0.25] rotate-12 scale-150 mix-blend-overlay" />
      </div>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src={domainDripLogo} alt="DomainDrip Logo" className="h-8 w-8" />
            <span className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DomainDrip
            </span>
          </div>
          
          <nav className="flex items-center gap-2 sm:gap-4">
            {user && <CreditBalance />}
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/auth">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 relative overflow-hidden">
        {/* Subtle drip accent */}
        <div className="absolute top-0 right-1/4 w-1 h-32 bg-gradient-drip opacity-30 rounded-full"></div>
        <div className="absolute top-20 left-1/3 w-0.5 h-24 bg-gradient-drip opacity-20 rounded-full"></div>
        
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 sm:mb-20">
            <Badge variant="outline" className="mb-6 bg-primary/15 border-primary/30 text-primary">
              <Search className="h-3 w-3 mr-1" />
              Discover, Buy & Flip Domain Names Powered by AI
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-8 leading-tight">
              Find Your
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Perfect Domain
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto px-4 leading-relaxed font-bold">Tired of dead-end domain searches?
We only show what’s buyable. Get FlipScores, smart suggestions, and bulk-buy options—all in one place.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary">
                <Link to="/premium-domains">
                  Explore Premium Drops
                  <Crown className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10">
                <Link to="/featured-domains">
                  See Featured Domains
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* App Preview with DomainDrip branding */}
          <div className="relative mx-auto max-w-5xl">
            <div className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-r from-primary/25 via-secondary/25 to-primary/25 rounded-3xl blur-3xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
              
            </div>
            
            {/* Platform stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-center">
              <div className="bg-card/70 rounded-xl p-6 border border-primary/20 shadow-card">
                <div className="text-3xl font-bold text-primary">$2.5M+</div>
                <div className="text-sm text-muted-foreground">Domain Value Curated</div>
              </div>
              <div className="bg-card/70 rounded-xl p-6 border border-primary/20 shadow-card">
                <div className="text-3xl font-bold text-primary">15K+</div>
                <div className="text-sm text-muted-foreground">Entrepreneurs Served</div>
              </div>
              <div className="bg-card/70 rounded-xl p-6 border border-primary/20 shadow-card">
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Drops Section */}
      <section id="featured-drops" className="py-20 px-4 bg-background/30 relative">
        {/* Semi-transparent overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/60 to-background/80 z-0"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-foreground" style={{
            color: '#222'
          }}>
              Latest Premium Drops
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{
            color: '#333'
          }}>
              Handpicked domains across key industries where entrepreneurs are building their digital empires.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {featuredDrops.map((drop, index) => <Card key={index} className="border border-primary/30 bg-card/95 backdrop-blur hover:shadow-xl transition-all duration-300 group shadow-md">
                <CardHeader>
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${drop.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Gem className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-primary" style={{
                color: '#222'
              }}>{drop.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {drop.domains.map((domain, domainIndex) => <div key={domainIndex} className="flex items-center justify-between p-3 rounded-lg bg-background/80 border border-primary/20 shadow-sm">
                        <span className="font-mono text-sm" style={{
                    color: '#333'
                  }}>{domain}</span>
                        <Badge variant="outline" className="text-xs bg-primary/20 border-primary/40" style={{
                    color: '#222'
                  }}>Available</Badge>
                      </div>)}
                  </div>
                  <Button className="w-full mt-4 bg-primary/20 hover:bg-primary/30 border border-primary/40 shadow-md" style={{
                color: '#222'
              }}>
                    View All {drop.category} Domains
                  </Button>
                </CardContent>
              </Card>)}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 shadow-lg">
              <Link to="/auth">
                Access Full Premium Catalog
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
  <section id="features" className="py-20 px-4 bg-background/50">
  <div className="container mx-auto max-w-6xl">
    <div className="text-center mb-8">
      <h2 className="text-4xl sm:text-3xl font-bold mb-6 text-slate-900">
        Built for Success
      </h2>
      <p className="text-lg text-slate-800 max-w-3xl mx-auto">
        Every feature designed with intelligence and business success in mind.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <Card
          key={index}
          className="border border-primary/20 bg-card/80 backdrop-blur hover:bg-card/90 transition-all duration-300 group"
        >
          <CardHeader>
            <div className="h-14 w-14 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
          </CardHeader>

          <CardContent>
            <CardDescription className="leading-relaxed text-slate-800">
              {feature.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>

      {/* Flip Score Preview */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <TooltipProvider>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{
            color: '#222'
          }}>
              Flip Score & Valuation Tool
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto" style={{
            color: '#333'
          }}>
              Get instant ROI projections and market analysis for any domain. Know exactly what you're buying 
              and its potential before you invest.
            </p>
            
            <div className="bg-card/60 rounded-2xl border border-primary/20 p-8 mb-8">
              {(() => {
              const flipScoreBadge = getFlipScoreBadge(94); // Using example score of 94 (which normalizes to 9)
              return <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-4xl font-bold" style={{
                    color: '#222'
                  }}>FlipScore:</div>
                      {flipScoreBadge && <div className="flex items-center gap-2">
                          <Badge className={`text-lg px-4 py-2 ${flipScoreBadge.className}`}>
                            {flipScoreBadge.emoji} {flipScoreBadge.score}/10 - {flipScoreBadge.label}
                          </Badge>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-5 w-5 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{flipScoreBadge.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>}
                    </div>
                    <div className="text-lg mb-4" style={{
                  color: '#333'
                }}>Projected 6-month value: $12,500 - $25,000</div>
                    <div className="flex justify-center gap-4 text-sm" style={{
                  color: '#444'
                }}>
                      <span>• High brandability</span>
                      <span>• Growing market trend</span>
                      <span>• Premium extension</span>
                    </div>
                  </div>;
            })()}
            </div>
          </TooltipProvider>
        </div>
      </section>

      {/* Strategy Session CTA */}
      <section className="py-20 px-4 bg-background/30">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/auth">
                Start Searching Domains
                <Search className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <span>Premium quality guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Secure & verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>Instant access</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview Section */}
      <FAQPreview />

      {/* Footer */}
      <footer className="border-t border-primary/20 bg-background/80 backdrop-blur py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  DomainDrip
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">About DomainDrip</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The premier AI-powered domain marketplace for entrepreneurs and creatives. We curate premium domains 
                  and provide intelligent tools to help you discover, buy, and flip domain names with precision and insight.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Us</h3>
              
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/faq" className="hover:text-primary transition-colors flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary transition-colors flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookie" className="hover:text-primary transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary/20 mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 DomainDrip. Discover, Buy & Flip Domain Names Powered by AI.</p>
            <p className="mt-2 text-xs">Built with intelligence for digital entrepreneurs worldwide.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default LandingPage;