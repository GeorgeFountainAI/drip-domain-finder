
import React from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Search, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import type { User } from '@supabase/supabase-js';

const FeaturedDomains = () => {
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

  const featuredDomains = [
    {
      domain: "aitech.com",
      price: "$12,500",
      category: "AI & Technology",
      flipScore: 95,
      trending: true
    },
    {
      domain: "cryptoflow.io",
      price: "$8,900",
      category: "Cryptocurrency",
      flipScore: 88,
      trending: true
    },
    {
      domain: "greentech.app",
      price: "$6,200",
      category: "Clean Energy",
      flipScore: 82,
      trending: false
    },
    {
      domain: "webapp.dev",
      price: "$4,800",
      category: "Development",
      flipScore: 85,
      trending: false
    },
    {
      domain: "fintech.plus",
      price: "$15,000",
      category: "Financial Tech",
      flipScore: 92,
      trending: true
    },
    {
      domain: "healthai.co",
      price: "$9,500",
      category: "Health Tech",
      flipScore: 89,
      trending: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Featured Premium Domains
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Hand-picked premium domains with high flip scores and market potential. 
            Perfect for startups, brands, and investors.
          </p>
          
          {user && (
            <Button asChild size="lg" className="gap-2">
              <Link to="/app">
                <Search className="h-5 w-5" />
                Start AI Domain Search
              </Link>
            </Button>
          )}
          
          {!user && (
            <Button asChild size="lg" className="gap-2">
              <Link to="/auth">
                <Sparkles className="h-5 w-5" />
                Sign Up to Search Domains
              </Link>
            </Button>
          )}
        </div>

        {/* Featured Domains Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredDomains.map((domain, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-bold text-primary">
                    {domain.domain}
                  </CardTitle>
                  {domain.trending && (
                    <Badge variant="secondary" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Trending
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{domain.price}</span>
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Score: {domain.flipScore}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Category</span>
                    <p className="font-medium">{domain.category}</p>
                  </div>
                  <Button className="w-full" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Find Your Perfect Domain?
          </h2>
          <p className="text-muted-foreground mb-6">
            Use our AI-powered search to discover available domains with high flip scores
          </p>
          
          {user ? (
            <Button asChild size="lg">
              <Link to="/app">
                <Search className="h-5 w-5 mr-2" />
                Start Searching Now
              </Link>
            </Button>
          ) : (
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link to="/auth">
                  Get Started Free
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/">
                  Learn More
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedDomains;
