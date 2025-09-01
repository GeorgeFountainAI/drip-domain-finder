import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Rocket, 
  Code, 
  Palette, 
  Zap, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Star,
  Clock,
  Shield,
  Target,
  Home
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface IntakeFormData {
  name: string;
  email: string;
  businessName: string;
  appIdea: string;
  targetAudience: string;
  industry: string;
  features: string[];
  timeline: string;
  budget: string;
  inspiration: string;
  culturalElements: string;
}

const DripApps = () => {
  const [formData, setFormData] = useState<IntakeFormData>({
    name: "",
    email: "",
    businessName: "",
    appIdea: "",
    targetAudience: "",
    industry: "",
    features: [],
    timeline: "",
    budget: "",
    inspiration: "",
    culturalElements: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call to process intake form
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Application Submitted! 🎉",
        description: "We'll be in touch within 24 hours with your AI-generated roadmap and next steps.",
      });
      
      // Reset form
      setFormData({
        name: "", email: "", businessName: "", appIdea: "", targetAudience: "",
        industry: "", features: [], timeline: "", budget: "", inspiration: "", culturalElements: ""
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonFeatures = [
    "User Authentication", "Payment Processing", "Social Features", "Mobile App",
    "Admin Dashboard", "Email Marketing", "Analytics", "API Integration",
    "Content Management", "Search & Filters", "Real-time Updates", "E-commerce"
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors">
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
          <div className="text-sm text-muted-foreground">
            DripApps
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-hero">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="mb-6 px-4 py-2 bg-primary/20 text-primary border-primary/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by AI • Built for Culture
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              DripApps
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Turn your vision into a fully-functional app. We combine AI-powered development with cultural authenticity to bring Black-owned businesses online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-primary hover:shadow-primary">
                <Rocket className="w-5 h-5 mr-2" />
                Start Building Today
              </Button>
              <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10">
                See Examples
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose DripApps?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We don't just build apps—we craft digital experiences that honor your culture and amplify your voice.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-card border-primary/20 shadow-card">
              <CardHeader>
                <Code className="w-12 h-12 text-primary mb-4" />
                <CardTitle>AI-Powered Development</CardTitle>
                <CardDescription>
                  Our advanced AI agents handle the technical complexity while you focus on your vision.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-gradient-card border-primary/20 shadow-card">
              <CardHeader>
                <Palette className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Culturally Authentic</CardTitle>
                <CardDescription>
                  Every app is designed with cultural sensitivity and authenticity at its core.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-gradient-card border-primary/20 shadow-card">
              <CardHeader>
                <Zap className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Rapid Deployment</CardTitle>
                <CardDescription>
                  From idea to live app in weeks, not months. Get to market faster than ever.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple, transparent, and designed for your success</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Target, title: "Share Your Vision", desc: "Tell us about your app idea, target audience, and cultural elements" },
              { icon: Sparkles, title: "AI Roadmap", desc: "Get a custom roadmap and technical specifications within 24 hours" },
              { icon: Code, title: "Rapid Development", desc: "Our AI agents build your MVP while you provide feedback" },
              { icon: Rocket, title: "Launch & Scale", desc: "Go live with ongoing support and scaling strategies" }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intake Form Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" id="apply">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Ready to Build?</h2>
            <p className="text-xl text-muted-foreground">
              Fill out our intake form and get your AI-generated roadmap within 24 hours.
            </p>
          </div>
          
          <Card className="bg-gradient-card border-primary/20 shadow-elevated">
            <CardHeader>
              <CardTitle className="text-2xl">App Vision Intake</CardTitle>
              <CardDescription>
                Help us understand your vision so we can create the perfect roadmap for your app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessName">Business/Project Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="What's your business or project called?"
                  />
                </div>

                {/* App Idea */}
                <div>
                  <Label htmlFor="appIdea">Describe Your App Idea *</Label>
                  <Textarea
                    id="appIdea"
                    value={formData.appIdea}
                    onChange={(e) => setFormData(prev => ({ ...prev, appIdea: e.target.value }))}
                    placeholder="Paint the picture: What problem does your app solve? Who is it for? What makes it special?"
                    rows={4}
                    required
                  />
                </div>

                {/* Target Audience & Industry */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetAudience">Target Audience *</Label>
                    <Textarea
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      placeholder="Who are your users? Demographics, interests, behaviors..."
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry/Category *</Label>
                    <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                        <SelectItem value="fashion">Fashion & Style</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="education">Education & Learning</SelectItem>
                        <SelectItem value="finance">Finance & Banking</SelectItem>
                        <SelectItem value="health">Health & Fitness</SelectItem>
                        <SelectItem value="music">Music & Entertainment</SelectItem>
                        <SelectItem value="business">Business Services</SelectItem>
                        <SelectItem value="community">Community & Social</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <Label>Key Features (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {commonFeatures.map((feature) => (
                      <Button
                        key={feature}
                        type="button"
                        variant={formData.features.includes(feature) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFeatureToggle(feature)}
                        className={formData.features.includes(feature) ? "bg-primary text-primary-foreground" : ""}
                      >
                        {feature}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Timeline & Budget */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeline">Timeline *</Label>
                    <Select value={formData.timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="When do you need this?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">ASAP (Rush order)</SelectItem>
                        <SelectItem value="1month">Within 1 month</SelectItem>
                        <SelectItem value="3months">Within 3 months</SelectItem>
                        <SelectItem value="6months">Within 6 months</SelectItem>
                        <SelectItem value="flexible">I'm flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget Range *</Label>
                    <Select value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="What's your budget?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under5k">Under $5,000</SelectItem>
                        <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                        <SelectItem value="15k-30k">$15,000 - $30,000</SelectItem>
                        <SelectItem value="30k-50k">$30,000 - $50,000</SelectItem>
                        <SelectItem value="50k+">$50,000+</SelectItem>
                        <SelectItem value="discuss">Let's discuss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Cultural Elements */}
                <div>
                  <Label htmlFor="culturalElements">Cultural Elements & Inspiration</Label>
                  <Textarea
                    id="culturalElements"
                    value={formData.culturalElements}
                    onChange={(e) => setFormData(prev => ({ ...prev, culturalElements: e.target.value }))}
                    placeholder="How do you want your cultural identity reflected in the app? Any specific aesthetic, language, or community elements?"
                    rows={3}
                  />
                </div>

                {/* Inspiration */}
                <div>
                  <Label htmlFor="inspiration">Apps You Admire</Label>
                  <Input
                    id="inspiration"
                    value={formData.inspiration}
                    onChange={(e) => setFormData(prev => ({ ...prev, inspiration: e.target.value }))}
                    placeholder="e.g., Instagram, Shopify, Discord - what do you like about them?"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    * Required fields
                  </div>
                  <Button type="submit" disabled={isSubmitting} size="lg" className="bg-gradient-primary">
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Generating Roadmap...
                      </>
                    ) : (
                      <>
                        Get My Roadmap
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl text-muted-foreground">Real entrepreneurs, real results</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Kendra Washington",
                business: "Natural Hair Care App",
                quote: "DripApps turned my hair care scheduling idea into a thriving platform. The cultural authenticity in the design made all the difference.",
                result: "10k+ users in 6 months"
              },
              {
                name: "Marcus Thompson",
                business: "Community Marketplace",
                quote: "From concept to launch in 8 weeks. The AI roadmap was so detailed, I knew exactly what to expect at every step.",
                result: "$50k revenue in year 1"
              },
              {
                name: "Zoe Adams",
                business: "Wellness Platform",
                quote: "Finally, a development team that understood my vision AND my community. The app feels authentically me.",
                result: "Featured in App Store"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    "{testimonial.quote}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                  <Badge className="mt-2 bg-primary/20 text-primary">{testimonial.result}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            {[
              {
                q: "How long does it take to build my app?",
                a: "Most MVPs are completed within 4-8 weeks. Rush orders (2-3 weeks) are available for an additional fee. Timeline depends on complexity and feature requirements."
              },
              {
                q: "What happens after I submit the intake form?",
                a: "Within 24 hours, you'll receive a detailed AI-generated roadmap including technical specifications, timeline, and pricing. No commitment required until you approve the plan."
              },
              {
                q: "Do I own the code and intellectual property?",
                a: "Absolutely. You own 100% of your app's code, design, and IP. We provide full documentation and can transfer everything to your preferred hosting platform."
              },
              {
                q: "Can you integrate with existing systems?",
                a: "Yes! We specialize in integrations with payment processors, CRMs, social platforms, and custom APIs. Let us know your requirements in the intake form."
              },
              {
                q: "What ongoing support do you provide?",
                a: "We offer maintenance packages, feature additions, and scaling support. Your app comes with 30 days of free support, then optional monthly plans start at $299."
              },
              {
                q: "How do you ensure cultural authenticity?",
                a: "Our team includes Black designers and developers who understand the nuances of cultural representation. We also involve you throughout the design process for feedback."
              }
            ].map((faq, index) => (
              <Card key={index} className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-primary-foreground">
            Ready to Turn Your Vision Into Reality?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join hundreds of Black entrepreneurs who've brought their app ideas to life with DripApps.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              <Users className="w-5 h-5 mr-2" />
              Start Your Application
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              Schedule a Call
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-primary-foreground/60">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">24hr roadmap delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">100% ownership</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DripApps;