import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Search, 
  TrendingUp, 
  Shield, 
  Gem, 
  Brain,
  Target,
  Mail,
  FileText,
  Users,
  Star,
  Zap,
  DollarSign,
  Calendar,
  Award,
  Droplets,
  Globe,
  ChevronRight,
  Play,
  BarChart3,
  Handshake
} from "lucide-react";
import { Link } from "react-router-dom";
import appPreviewImage from "@/assets/app-preview.jpg";
import demoFrame1 from "@/assets/demo-frame-1-signin.jpg";
import demoFrame2 from "@/assets/demo-frame-2-credits.jpg";
import demoFrame3 from "@/assets/demo-frame-3-search.jpg";

const LandingPage = () => {
  const features = [
    {
      icon: Crown,
      title: "Curated Premium Domains",
      description: "Hand-picked, brandable domains perfect for Black-owned businesses in beauty, tech, finance, and creative industries."
    },
    {
      icon: Brain,
      title: "Cultural AI Intelligence",
      description: "AI-powered suggestions trained to understand cultural nuances and generate authentic, resonant domain names."
    },
    {
      icon: BarChart3,
      title: "Flip Score & Valuation",
      description: "Get instant domain valuations and flip potential scores to maximize your digital investment returns."
    },
    {
      icon: Target,
      title: "Niche Category Focus",
      description: "Specialized search filters for beauty brands, tech startups, financial services, and creative portfolios."
    },
    {
      icon: Shield,
      title: "Verified Marketplace",
      description: "Secure purchasing through trusted registrars with additional verification for premium domain authenticity."
    },
    {
      icon: Globe,
      title: "Strategic Extensions",
      description: "Access to .black, .beauty, .tech, .money domains plus traditional extensions perfect for your brand."
    }
  ];

  const featuredDrops = [
    {
      category: "Beauty",
      domains: ["MelaninGlow.com", "CrownBeauty.co", "GoldenMane.io"],
      color: "from-primary to-primary-glow"
    },
    {
      category: "Tech",
      domains: ["CodeNoir.ai", "BlackTech.ventures", "InnovateMelanin.dev"],
      color: "from-secondary to-primary"
    },
    {
      category: "Finance",
      domains: ["WealthBuilders.black", "MoneyMoves.co", "CapitalNoir.finance"],
      color: "from-accent to-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-noir">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-primary" />
            <span className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              NoirDrip
            </span>
            <Badge variant="outline" className="hidden sm:inline-flex bg-primary/10 text-xs">
              Black Edition
            </Badge>
          </div>
          
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link to="/dripapps" className="text-sm font-medium hover:text-primary transition-colors">
              DripApps
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/auth">
                <span className="hidden sm:inline">Start Building</span>
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
              <Crown className="h-3 w-3 mr-1" />
              Premium Domain Marketplace for Black Excellence
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-8 leading-tight">
              Build Your
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Digital Empire
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto px-4 leading-relaxed">
              Curated premium domain bundles and AI-powered search tools designed for Black entrepreneurs, 
              creatives, and digital investors ready to dominate their markets.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary">
                <Link to="/auth">
                  Explore Premium Drops
                  <Crown className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10">
                <Link to="#featured-drops">
                  See Featured Domains
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* App Preview with NoirDrip branding */}
          <div className="relative mx-auto max-w-5xl">
            <div className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-r from-primary/25 via-secondary/25 to-primary/25 rounded-3xl blur-3xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative rounded-2xl border border-primary/20 bg-card/90 backdrop-blur p-6 sm:p-10 shadow-elevated">
                <div className="relative rounded-xl overflow-hidden bg-gradient-card">
                  {/* Demo Slideshow */}
                  <div className="relative w-full h-auto">
                    <img 
                      src={demoFrame1}
                      alt="NoirDrip Premium Access Demo" 
                      className="w-full h-auto object-cover rounded-lg transition-opacity duration-500 group-hover:opacity-0"
                    />
                    <img 
                      src={demoFrame2}
                      alt="NoirDrip Credit System Demo" 
                      className="absolute inset-0 w-full h-auto object-cover rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-1000"
                    />
                    <img 
                      src={demoFrame3}
                      alt="NoirDrip Cultural AI Search Demo" 
                      className="absolute inset-0 w-full h-auto object-cover rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-2000"
                    />
                  </div>
                  
                  {/* Enhanced indicators with gold accents */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-3 h-3 rounded-full bg-primary group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="w-3 h-3 rounded-full bg-primary/50 group-hover:bg-primary group-hover:scale-110 transition-all duration-500 delay-1000"></div>
                    <div className="w-3 h-3 rounded-full bg-primary/50 group-hover:bg-primary group-hover:scale-110 transition-all duration-500 delay-2000"></div>
                  </div>
                  
                  {/* Premium badge */}
                  <div className="absolute top-6 right-6 bg-primary/90 backdrop-blur rounded-lg px-4 py-2 text-primary-foreground text-sm font-medium">
                    <span className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Premium
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cultural stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-center">
              <div className="bg-card/70 rounded-xl p-6 border border-primary/20 shadow-card">
                <div className="text-3xl font-bold text-primary">$2.5M+</div>
                <div className="text-sm text-muted-foreground">Domain Value Curated</div>
              </div>
              <div className="bg-card/70 rounded-xl p-6 border border-primary/20 shadow-card">
                <div className="text-3xl font-bold text-primary">15K+</div>
                <div className="text-sm text-muted-foreground">Black Entrepreneurs Served</div>
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
      <section id="featured-drops" className="py-20 px-4 bg-background/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Latest Premium Drops
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Handpicked domains across key industries where Black entrepreneurs are making their mark.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {featuredDrops.map((drop, index) => (
              <Card key={index} className="border border-primary/20 bg-card/80 backdrop-blur hover:shadow-elevated transition-all duration-300 group">
                <CardHeader>
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${drop.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Gem className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-primary">{drop.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {drop.domains.map((domain, domainIndex) => (
                      <div key={domainIndex} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-primary/10">
                        <span className="font-mono text-sm">{domain}</span>
                        <Badge variant="outline" className="text-xs bg-primary/10">Available</Badge>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30">
                    View All {drop.category} Domains
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6">
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
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Built for Black Excellence
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature designed with cultural intelligence and business success in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border border-primary/20 bg-card/80 backdrop-blur hover:bg-card/90 transition-all duration-300 group">
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
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
          <Badge variant="outline" className="mb-6 bg-secondary/15 border-secondary/30 text-secondary">
            <BarChart3 className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
          
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Flip Score & Valuation Tool
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get instant ROI projections and market analysis for any domain. Know exactly what you're buying 
            and its potential before you invest.
          </p>
          
          <div className="bg-card/60 rounded-2xl border border-primary/20 p-8 mb-8">
            <div className="text-4xl font-bold text-primary mb-2">FlipScore: 94/100</div>
            <div className="text-lg text-muted-foreground mb-4">Projected 6-month value: $12,500 - $25,000</div>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <span>• High brandability</span>
              <span>• Growing market trend</span>
              <span>• Premium extension</span>
            </div>
          </div>

          <Button size="lg" variant="outline" className="border-secondary/30 hover:bg-secondary/10 text-secondary">
            Join Early Access Waitlist
            <Star className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Strategy Session CTA */}
      <section className="py-20 px-4 bg-background/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Build Your Empire?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Book a 1-on-1 strategy session with our domain experts to plan your digital expansion.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/auth">
                Start Searching Domains
                <Search className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10">
              Book Strategy Session
              <Calendar className="ml-2 h-5 w-5" />
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

      {/* Affiliate Partner CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Become a NoirDrip Partner
          </h3>
          <p className="text-lg text-muted-foreground mb-6">
            Earn 30% commission promoting premium domains to your network of entrepreneurs.
          </p>
          <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10">
            <Handshake className="mr-2 h-5 w-5" />
            Join Partner Program
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 bg-background/80 backdrop-blur py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  NoirDrip
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">About NoirDrip</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The premier domain marketplace for Black entrepreneurs and creatives. We curate premium domains 
                  and provide AI-powered tools to help you build your digital empire with cultural intelligence and business acumen.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="font-semibold">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="mailto:support@noirdrip.com" className="hover:text-primary transition-colors flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Support & Partnerships
                  </a>
                </li>
                <li>
                  <Link to="/strategy" className="hover:text-primary transition-colors">
                    Strategy Sessions
                  </Link>
                </li>
                <li>
                  <Link to="/partner" className="hover:text-primary transition-colors">
                    Partner Program
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
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
                  <Link to="/cookies" className="hover:text-primary transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary/20 mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 NoirDrip. Empowering Black excellence in digital spaces.</p>
            <p className="mt-2 text-xs">Part of the Drip Editions • LatinoDrip • FaithDrip • Coming Soon</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;