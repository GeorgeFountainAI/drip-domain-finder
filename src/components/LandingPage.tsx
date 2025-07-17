import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Search, 
  Zap, 
  Shield, 
  TrendingUp, 
  Brain,
  Globe,
  Mail,
  FileText,
  Users,
  Play
} from "lucide-react";
import { Link } from "react-router-dom";
import appPreviewImage from "@/assets/app-preview.jpg";

const LandingPage = () => {
  const features = [
    {
      icon: Search,
      title: "Smart Domain Search",
      description: "Search for available domains with wildcards and patterns to find the perfect match for your project."
    },
    {
      icon: Brain,
      title: "AI-Powered Suggestions",
      description: "Get creative domain name suggestions powered by OpenAI to discover unique and brandable options."
    },
    {
      icon: Zap,
      title: "Real-Time Pricing",
      description: "See current registration prices from Namecheap instantly to make informed decisions."
    },
    {
      icon: TrendingUp,
      title: "Search History",
      description: "Track your domain searches and easily revisit previous queries to compare options."
    },
    {
      icon: Shield,
      title: "Secure Purchasing",
      description: "Buy domains directly through our secure integration with trusted domain registrars."
    },
    {
      icon: Globe,
      title: "Multi-TLD Support",
      description: "Search across popular extensions like .com, .ai, .app, .io, and many more."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DomainDrip.AI
            </span>
          </div>
          
          <nav className="flex items-center gap-2 sm:gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="outline" className="mb-4 bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Domain Discovery
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6">
              Find the Perfect
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Domain Name
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto px-4">
              Discover available domains with AI-powered suggestions, real-time pricing, 
              and smart search patterns. Build your brand with the perfect domain name.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6">
                <Link to="/auth">
                  Get Started Free
                  <Sparkles className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6">
                <Link to="#features">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>

          {/* App Preview */}
          <div className="relative mx-auto max-w-5xl">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative rounded-2xl border bg-background/80 backdrop-blur p-4 sm:p-8 shadow-2xl">
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-background to-muted/20">
                  <img 
                    src="/lovable-uploads/dcc00cc2-12db-4c74-80bc-2507e25e78cd.png" 
                    alt="DomainDrip.AI App Interface Preview showing domain search results" 
                    className="w-full h-auto object-cover rounded-lg"
                  />
                  
                  {/* Clean overlay with single demo button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                      <Link to="/auth">
                        <Play className="h-5 w-5 mr-2" />
                        Try Live Demo
                      </Link>
                    </Button>
                  </div>
                </div>
                
                {/* Feature callouts */}
                <div className="absolute top-8 left-8 hidden lg:block">
                  <div className="bg-background/90 backdrop-blur rounded-lg p-3 shadow-lg border">
                    <div className="flex items-center gap-2 text-sm">
                      <Search className="h-4 w-4 text-primary" />
                      <span className="font-medium">Smart Search</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-8 right-8 hidden lg:block">
                  <div className="bg-background/90 backdrop-blur rounded-lg p-3 shadow-lg border">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="font-medium">Real-time Pricing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats below preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-center">
              <div className="bg-background/50 rounded-lg p-4 border">
                <div className="text-2xl font-bold text-primary">10M+</div>
                <div className="text-sm text-muted-foreground">Domains Searched</div>
              </div>
              <div className="bg-background/50 rounded-lg p-4 border">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Happy Users</div>
              </div>
              <div className="bg-background/50 rounded-lg p-4 border">
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-background/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to Find Domains
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools and AI assistance to help you discover, evaluate, and secure the perfect domain name for your project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-background/80 backdrop-blur hover:bg-background/90 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Find Your Perfect Domain?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of entrepreneurs and developers who trust DomainDrip.AI to find their ideal domain names.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/auth">
                Start Searching Now
                <Search className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Free to get started</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure & trusted</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Instant results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  DomainDrip.AI
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">About</h3>
                <p className="text-sm text-muted-foreground">
                  DomainDrip helps entrepreneurs, creators, and startups discover premium, brandable domains powered by AI. We combine smart search with real-time availability to bring your next big idea to life—one domain at a time.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="font-semibold">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="mailto:support@domaindrip.ai" className="hover:text-foreground transition-colors flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link to="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/api-docs" className="hover:text-foreground transition-colors">
                    API Docs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Privacy */}
            <div className="space-y-4">
              <h3 className="font-semibold">Privacy</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/privacy" className="hover:text-foreground transition-colors flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="hover:text-foreground transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 DomainDrip.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;