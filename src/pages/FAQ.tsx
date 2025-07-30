import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, HelpCircle, Sparkles, TrendingUp, Crown, CreditCard, Star, Users, Rocket, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { ModernHeader } from "@/components/ModernHeader";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useFAQ } from "@/hooks/useFAQ";
import domainDripLogo from "/lovable-uploads/54151200-6cf6-4c1b-b88a-bc150fc097c8.png";

const FAQ = () => {
  const [user, setUser] = useState<any>(null);
  const { faqData, loading: faqLoading } = useFAQ();

  useEffect(() => {
    // Check authentication status
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.warn('Error getting user, continuing with anonymous access:', error);
        setUser(null);
      }
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Enhanced FAQ data with icons
  const enhancedFaqData = faqData.map((faq) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      "what-is-domaindrip": <Sparkles className="h-4 w-4" />,
      "flip-score": <TrendingUp className="h-4 w-4" />,
      "purchase-domain": <CreditCard className="h-4 w-4" />,
      "signup-credits": <Globe className="h-4 w-4" />,
      "credits-search": <Globe className="h-4 w-4" />,
      "add-credits": <CreditCard className="h-4 w-4" />,
      "premium-featured": <Crown className="h-4 w-4" />,
      "no-account": <Users className="h-4 w-4" />,
      "domain-ownership": <Star className="h-4 w-4" />,
      "only-buyers": <Rocket className="h-4 w-4" />,
      "whats-next": <HelpCircle className="h-4 w-4" />
    };
    
    return {
      ...faq,
      icon: iconMap[faq.id] || <HelpCircle className="h-4 w-4" />
    };
  });

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

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-primary/15 border-primary/30 text-primary">
              <HelpCircle className="h-3 w-3 mr-1" />
              Frequently Asked Questions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              DomainDrip FAQ
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about finding, evaluating, and buying premium domains with DomainDrip.
            </p>
          </div>

          <Card className="border border-primary/20 bg-card/80 backdrop-blur shadow-elevated">
            <CardContent className="p-6">
              {faqLoading ? (
                <div className="space-y-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {enhancedFaqData.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border-primary/10">
                      <AccordionTrigger className="text-left hover:text-primary transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                            {faq.icon}
                          </div>
                          <span className="font-medium">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 pb-6 text-muted-foreground leading-relaxed pl-11">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? We're here to help you succeed in the domain market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to={user ? "/app" : "/auth"}>
                  {user ? "Start Searching" : "Get Started"}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary/30 hover:bg-primary/10">
                <Link to="/premium-domains">
                  View Premium Domains
                  <Crown className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;