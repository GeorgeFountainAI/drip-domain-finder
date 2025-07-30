import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, HelpCircle, Sparkles, TrendingUp, Crown, CreditCard, Star, Users, Rocket, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { ModernHeader } from "@/components/ModernHeader";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import domainDripLogo from "/lovable-uploads/54151200-6cf6-4c1b-b88a-bc150fc097c8.png";

const FAQ = () => {
  const [user, setUser] = useState<any>(null);

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

  const faqData = [
    {
      id: "what-is-domaindrip",
      question: "What is DomainDrip?",
      answer: "DomainDrip is an AI-powered domain marketplace designed for entrepreneurs, investors, and creatives. We curate premium domains, provide intelligent search tools, and offer unique features like Flip Score analysis to help you discover, buy, and flip domain names with precision and insight.",
      icon: <Sparkles className="h-4 w-4" />
    },
    {
      id: "flip-score",
      question: "How does the Flip Score work?",
      answer: "Our proprietary Flip Score algorithm analyzes multiple factors including domain length, TLD popularity, brandability, pronounceability, trending keywords, and market trends. Scores range from 0-100, with higher scores indicating better flip potential and investment value. The score helps you make informed decisions about domain purchases.",
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      id: "purchase-domain",
      question: "How do I purchase a domain I like?",
      answer: "When you find a domain you want, click the 'Buy Domain' button. This will redirect you to our trusted partner Spaceship.com where you can complete the purchase securely. We earn a small affiliate commission to keep DomainDrip running, but this doesn't affect your purchase price.",
      icon: <CreditCard className="h-4 w-4" />
    },
    {
      id: "credits-search",
      question: "Do I need credits to search for domains?",
      answer: "Yes, domain searches consume credits to cover API costs and AI processing. New users receive free trial credits to get started. You can purchase additional credits through our secure Stripe-powered checkout system when needed.",
      icon: <Globe className="h-4 w-4" />
    },
    {
      id: "add-credits",
      question: "How do I add credits?",
      answer: "Click on your credit balance in the header or the 'Purchase Credits' button to access our credit store. We offer various credit packages at different price points. All payments are processed securely through Stripe for your protection.",
      icon: <CreditCard className="h-4 w-4" />
    },
    {
      id: "premium-featured",
      question: "What are Premium Drops and Featured Domains?",
      answer: "Premium Drops are hand-curated high-value domains (.com, .ai, .io) with exceptional flip potential and strong Flip Scores. Featured Domains are carefully selected across trending categories like tech, AI, digital, and apps. Both collections are accessible before and after login.",
      icon: <Crown className="h-4 w-4" />
    },
    {
      id: "no-account",
      question: "Can I use DomainDrip without creating an account?",
      answer: "You can browse our Premium Drops and Featured Domains without an account, but you'll need to sign up to access AI-powered search, view search history, and use credits. Creating an account is free and comes with trial credits.",
      icon: <Users className="h-4 w-4" />
    },
    {
      id: "domain-ownership",
      question: "Do I own the domain after purchase?",
      answer: "Yes! When you purchase a domain through our partner Spaceship.com, you become the full legal owner of that domain. DomainDrip simply helps you discover and evaluate domains - we don't hold or manage your purchased domains.",
      icon: <Star className="h-4 w-4" />
    },
    {
      id: "only-buyers",
      question: "Is DomainDrip only for domain buyers?",
      answer: "While our primary focus is helping people find and buy great domains, our tools are valuable for domain investors, entrepreneurs launching businesses, agencies serving clients, and anyone interested in the domain market and brandable names.",
      icon: <Rocket className="h-4 w-4" />
    },
    {
      id: "whats-next",
      question: "What's next for DomainDrip?",
      answer: "We're constantly improving our AI algorithms, expanding our domain partner network, and building new features. Upcoming enhancements include advanced filtering, market trend analysis, portfolio management tools, and enhanced Flip Score insights to make domain investing even smarter.",
      icon: <HelpCircle className="h-4 w-4" />
    }
  ];

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
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq, index) => (
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