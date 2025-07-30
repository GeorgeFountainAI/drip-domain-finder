import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Globe, Check, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import domainDripLogo from "/lovable-uploads/54151200-6cf6-4c1b-b88a-bc150fc097c8.png";

interface Domain {
  name: string;
  price: number;
  tld: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [domain, setDomain] = useState<Domain | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Mock credit balance
  const mockCreditBalance = 8;

  useEffect(() => {
    // Parse domain data from URL params
    const domainName = searchParams.get('domain');
    const domainPrice = searchParams.get('price');
    const domainTld = searchParams.get('tld');
    
    if (domainName && domainPrice && domainTld) {
      setDomain({
        name: domainName,
        price: parseFloat(domainPrice),
        tld: domainTld
      });
    } else {
      // Redirect back if no domain data
      navigate('/app');
    }
  }, [searchParams, navigate]);

  const handlePlaceOrder = async () => {
    if (!domain) return;
    
    setIsPlacingOrder(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsPlacingOrder(false);
    setOrderPlaced(true);
    
    toast({
      title: "Success! 🎉",
      description: `You've successfully reserved ${domain.name}`,
      duration: 5000,
    });
  };

  const handleBackToSearch = () => {
    navigate('/app');
  };

  if (!domain) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative">
        {/* Subtle background for watermark visibility */}
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-background via-muted/30 to-background" />
        
        {/* Background Logo Watermark - Now clearly visible */}
        <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
          <img 
            src={domainDripLogo} 
            alt="" 
            className="w-[60vw] h-[60vh] object-contain opacity-[0.25] rotate-12 scale-150 mix-blend-overlay"
          />
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background p-4 relative">
        {/* Background Logo Watermark */}
        <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
          <img 
            src={domainDripLogo} 
            alt="" 
            className="w-[60vw] h-[60vh] object-contain opacity-[0.06] rotate-12 scale-150"
          />
        </div>
        <div className="max-w-2xl mx-auto pt-12 relative z-10">
          <Card className="text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-4">
                Order Successful!
              </h1>
              <p className="text-lg text-green-700 dark:text-green-300 mb-2">
                You've successfully reserved
              </p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200 mb-6">
                {domain.name}
              </p>
              <div className="space-y-3 mb-8">
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ Domain reserved for 1 year
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ DNS management included
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ Free SSL certificate
                </p>
              </div>
              <Button onClick={handleBackToSearch} size="lg">
                Back to Search
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const domainParts = domain.name.split('.');
  const domainBase = domainParts[0];
  const tldExtension = domainParts.slice(1).join('.');

  return (
    <div className="min-h-screen bg-background p-4 relative">
      {/* Background Logo Watermark */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <img 
          src={domainDripLogo} 
          alt="" 
          className="w-[60vw] h-[60vh] object-contain opacity-[0.06] rotate-12 scale-150"
        />
      </div>
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToSearch}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your domain registration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Domain Registration
                </CardTitle>
                <CardDescription>
                  Your selected domain for registration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xl">{domainBase}</span>
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        .{tldExtension}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      ${domain.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">per year</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Included */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
                <CardDescription>
                  Your domain registration includes these features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Domain privacy protection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Free SSL certificate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">DNS management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">24/7 support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            {/* Credit Balance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Credit Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary mb-2">
                    {mockCreditBalance}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    credits remaining
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Order Total */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Domain registration</span>
                  <span>${domain.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Privacy protection</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>SSL certificate</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${domain.price.toFixed(2)}</span>
                </div>
                
                <Button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full"
                  size="lg"
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  This is a simulated checkout. No actual payment will be processed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}