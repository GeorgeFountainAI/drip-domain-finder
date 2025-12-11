import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, ExternalLink, TrendingUp, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ModernHeader } from "@/components/ModernHeader";
import { supabase } from "@/integrations/supabase/client";
import domainDripLogo from "/lovable-uploads/54151200-6cf6-4c1b-b88a-bc150fc097c8.png";
import { getNamecheapLink } from "@/utils/getNamecheapLink";

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
  flipScore?: number;
  trendStrength?: number;
}

const PremiumDomains = () => {
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
    fetchPremiumDomains();
  }, []);

  const fetchPremiumDomains = async () => {
    try {
      setLoading(true);
      
      // Fetch premium domains using Spaceship API with premium keywords
      const response = await supabase.functions.invoke('spaceship-domain-search', {
        body: { keyword: 'premium' }
      });

      if (response.error) {
        throw response.error;
      }

      // Filter for premium domains (.com, .ai, .io with high flip scores)
      const premiumDomains = response.data.domains
        ?.filter((domain: Domain) => 
          (domain.tld === '.com' || domain.tld === '.ai' || domain.tld === '.io') &&
          domain.available &&
          (domain.flipScore || 0) > 70
        )
        ?.slice(0, 12) || [];

      setDomains(premiumDomains);
    } catch (error) {
      console.error('Error fetching premium domains:', error);
      toast({
        title: "Error loading domains",
        description: "Please try again later.",
        variant: "destructive"
      });
      
      // Fallback premium domains
      setDomains([
        { name: "AIPowerhouse", tld: ".com", available: true, price: 2500, flipScore: 95 },
        { name: "DataVault", tld: ".ai", available: true, price: 1800, flipScore: 88 },
        { name: "TechFlow", tld: ".io", available: true, price: 1200, flipScore: 82 },
        { name: "FinanceHub", tld: ".com", available: true, price: 3200, flipScore: 91 },
        { name: "CryptoForge", tld: ".ai", available: true, price: 2100, flipScore: 87 },
        { name: "CloudStream", tld: ".io", available: true, price: 1500, flipScore: 85 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyDomain = (domain: Domain) => {
    const domainName = `${domain.name}${domain.tld}`;
    const affiliateUrl = getNamecheapLink(domainName);
    window.open(affiliateUrl, '_blank', 'noopener noreferrer');
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
          <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-background shadow-sm">
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
            <Badge variant="outline" className="mb-4 bg-primary/15 border-primary/30 text-primary">
              <Crown className="h-3 w-3 mr-1" />
              Premium Collection
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Premium Domain Drops
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hand-curated premium domains with high flip potential. Perfect for startups, investors, and entrepreneurs looking for brandable assets.
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
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
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
                      High-value domain with strong brandability and flip potential
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-primary">
                        ${domain.price?.toLocaleString() || '2,500'}
                      </div>
                      <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                        <Star className="h-3 w-3 mr-1" />
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
              Want more premium options? Sign in to access our full catalog.
            </p>
            {!user && (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/auth">
                  Sign In for Full Access
                  <Crown className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumDomains;