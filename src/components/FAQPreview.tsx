import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Sparkles, TrendingUp, CreditCard, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const FAQPreview = () => {
  const previewFaqs = [
    {
      id: "signup-credits",
      question: "How many credits do I get when I sign up?",
      answer: "Every new user gets 20 free credits when signing up. After that, credits can be purchased via Stripe.",
      icon: <Sparkles className="h-4 w-4" />
    },
    {
      id: "flip-score",
      question: "What is a Flip Score?",
      answer: "Our proprietary Flip Score algorithm analyzes multiple factors including domain length, TLD popularity, brandability, pronounceability, trending keywords, and market trends. Scores range from 0-100, with higher scores indicating better flip potential and investment value.",
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      id: "purchase-domain",
      question: "How do I purchase a domain?",
      answer: "When you find a domain you want, click the 'Buy Domain' button. This will redirect you to our trusted partner Spaceship.com where you can complete the purchase securely. We earn a small affiliate commission to keep DomainDrip running, but this doesn't affect your purchase price.",
      icon: <CreditCard className="h-4 w-4" />
    }
  ];

  return (
    <section className="py-16 px-4 bg-background/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 bg-primary/15 border-primary/30 text-primary">
            <HelpCircle className="h-3 w-3 mr-1" />
            Quick Answers
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get answers to the most common questions about DomainDrip and domain investing.
          </p>
        </div>

        <Card className="border border-primary/20 bg-card/80 backdrop-blur shadow-elevated mb-8">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {previewFaqs.map((faq) => (
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

        <div className="text-center">
          <Button asChild size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10">
            <Link to="/faq">
              See Full FAQ
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQPreview;