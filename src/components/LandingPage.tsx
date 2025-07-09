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
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

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

          {/* Preview Image Placeholder */}
          <div className="relative mx-auto max-w-4xl">
            <div className="rounded-xl border bg-background/50 backdrop-blur p-8 shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Search className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">App Preview Coming Soon</p>
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  DomainDrip.AI
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered domain discovery platform for modern entrepreneurs and developers.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/auth" className="hover:text-foreground transition-colors">
                    Domain Search
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="hover:text-foreground transition-colors">
                    AI Suggestions
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="hover:text-foreground transition-colors">
                    Price Comparison
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="font-semibold">Support</h3>
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

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-semibold">Legal</h3>
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