
import React, { useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe,
  ChevronRight,
  Star,
  Users,
  Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/supabase-js';

export const LandingPage = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 gap-2">
              <Sparkles className="h-4 w-4" />
              AI-Powered Domain Discovery
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent sm:text-7xl mb-6">
              Find Your Perfect Domain with AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover available domains with our intelligent FlipScore system. 
              Get trend analysis, availability checks, and direct purchase links instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {user ? (
                <Button asChild size="lg" className="gap-2">
                  <Link to="/app">
                    <Search className="h-5 w-5" />
                    Start AI Domain Search
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/auth">
                      <Sparkles className="h-5 w-5" />
                      Get Started Free
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="gap-2">
                    <Link to="/featured-domains">
                      <Globe className="h-5 w-5" />
                      Browse Featured Domains
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Free Credits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">1M+</div>
                <div className="text-sm text-muted-foreground">Domains Searched</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">99%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose DomainDrip?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform makes domain discovery simple, fast, and accurate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI FlipScore</CardTitle>
                <CardDescription>
                  Our proprietary algorithm analyzes domain potential based on length, keywords, trends, and market data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-time Validation</CardTitle>
                <CardDescription>
                  Instant availability checks with RDAP validation and direct purchase links to trusted registrars
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Market Intelligence</CardTitle>
                <CardDescription>
                  Get insights on domain trends, pricing data, and investment potential to make informed decisions
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-primary text-primary-foreground">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Find Your Perfect Domain?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of entrepreneurs and investors who trust DomainDrip for their domain discovery needs
              </p>
              
              {user ? (
                <Button asChild size="lg" variant="secondary" className="gap-2">
                  <Link to="/app">
                    <Search className="h-5 w-5" />
                    Start Searching Now
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" variant="secondary" className="gap-2">
                  <Link to="/auth">
                    <Sparkles className="h-5 w-5" />
                    Get Started Free - 50 Credits
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
