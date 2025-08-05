import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, ExternalLink, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ModernHeader } from "@/components/ModernHeader";
import { supabase } from "@/integrations/supabase/client";
import domainDripLogo from "/lovable-uploads/54151200-6cf6-4c1b-b88a-bc150fc097c8.png";

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
  flipScore?: number;
  trendStrength?: number;
  category?: string;
}

const FeaturedDomains = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication status
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchFeaturedDomains();
  }, []);

  const fetchFeaturedDomains = async () => {
    try {
      setLoading(true);
      
      // Fetch featured domains using multiple popular keywords
      const keywords = ['tech', 'ai', 'digital', 'app'];
      const allDomains: Domain[] = [];

      for (const keyword of keywords) {
        const response = await supabase.functions.invoke('spaceship-domain-search', {
          body: { keyword }
        });

        if (response.data?.domains) {
          // Add category to domains and filter for best ones
          const categorizedDomains = response.data.domains
            .filter((domain: Domain) => domain.available && (domain.flipScore || 0) > 60)
            .slice(0, 3)
            .map((domain: Domain) => ({ ...domain, category: keyword }));
          
          allDomains.push(...categorizedDomains);
        }
      }

      setDomains(allDomains.slice(0, 12));
    } catch (error) {
      console.error('Error fetching featured domains:', error);
      toast({
        title: "Error loading domains",
        description: "Please try again later.",
        variant: "destructive"
      });
      
      // Fallback featured domains
      setDomains([
        { name: "TechBoost", tld: ".com", available: true, price: 890, flipScore: 75, category: "tech" },
        { name: "AppFlow", tld: ".io", available: true, price: 650, flipScore: 82, category: "app" },
        { name: "DigitalCraft", tld: ".com", available: true, price: 1200, flipScore: 78, category: "digital" },
        { name: "AIHelper", tld: ".ai", available: true, price: 950, flipScore: 84, category: "ai" },
        { name: "CodeStream", tld: ".dev", available: true, price: 750, flipScore: 76, category: "tech" },
        { name: "SmartApp", tld: ".io", available: true, price: 580, flipScore: 71, category: "app" },
        { name: "PixelForge", tld: ".com", available: true, price: 1100, flipScore: 79, category: "digital" },
        { name: "BotMaker", tld: ".ai", available: true, price: 850, flipScore: 83, category: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyDomain = (domain: Domain) => {
    const domainName = `${domain.name}${domain.tld}`;
    const affiliateUrl = `https://spaceship.pxf.io/c/5885493/1234567/16015?u=https://www.spaceship.com/domains/search?q=${encodeURIComponent(domainName)}`;
    window.open(affiliateUrl, '_blank');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      tech: "from-blue-500 to-cyan-500",
      ai: "from-purple-500 to-pink-500",
      digital: "from-green-500 to-emerald-500",
      app: "from-orange-500 to-red-500",
    };
    return colors[category as keyof typeof colors] || "from-primary to-secondary";
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      tech: "⚡",
      ai: "🤖",
      digital: "💻",
      app: "📱",
    };
    return icons[category as keyof typeof icons] || "✨";
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle background for watermark visibility */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-background via-muted/30 to-background" />
      
      {/* Background Logo Watermark */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <img 
          src={domainDripLogo} 
          alt="" 
          className="w-[60vw] h-[60vh] object-contain opacity-[0.25] rotate-12 scale-150 mix-blend-overlay"
        />
      </div>

      <div className="relative z-10">
        {user && <ModernHeader user={user} />}
        
        {!user && (
          <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <img 
                  src={domainDripLogo} 
                  alt="DomainDrip Logo" 
                  className="h-8 w-8"
                />
                <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                  DomainDrip
                </span>
              </div>
            </div>
          </header>
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-secondary/15 border-secondary/30 text-secondary">
              <Star className="h-3 w-3 mr-1" />
              Editor's Choice
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Featured Domains
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hand-picked domains across trending categories. Perfect for startups, projects, and businesses looking for brandable names.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-10 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {domains.map((domain, index) => (
                <Card key={index} className="border border-primary/20 bg-card/80 backdrop-blur hover:shadow-elevated transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={`bg-gradient-to-r ${getCategoryColor(domain.category || 'tech')} text-white border-0`}
                      >
                        <span className="mr-1">{getCategoryIcon(domain.category || 'tech')}</span>
                        {domain.category || 'featured'}
                      </Badge>
                      {domain.flipScore && (
                        <div className="flex items-center gap-1 text-sm text-secondary">
                          <TrendingUp className="h-3 w-3" />
                          {domain.flipScore}/100
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl font-mono text-primary">
                      {domain.name}{domain.tld}
                    </CardTitle>
                    <CardDescription>
                      Carefully selected for brandability and market potential
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-primary">
                        ${domain.price?.toLocaleString() || '850'}
                      </div>
                      <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                        <Zap className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    </div>
                    <Button 
                      onClick={() => handleBuyDomain(domain)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Buy Domain
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Looking for something specific? Use our AI-powered search to find the perfect domain.
            </p>
            {!user && (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/auth">
                  Access AI Search
                  <Star className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            {user && (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/app">
                  Start AI Search
                  <Star className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedDomains;