import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Lock, CheckCircle, Globe, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
}

interface DomainCheckoutProps {
  cartItems: Domain[];
  onBack: () => void;
  onOrderComplete: () => void;
}

export const DomainCheckout = ({ cartItems, onBack, onOrderComplete }: DomainCheckoutProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const { toast } = useToast();

  const totalPrice = cartItems.reduce((sum, domain) => sum + domain.price, 0);
  const icannFee = cartItems.length * 0.18;
  const finalTotal = totalPrice + icannFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    setOrderComplete(true);
    
    toast({
      title: "Order Successful!",
      description: `Successfully purchased ${cartItems.length} domain${cartItems.length > 1 ? 's' : ''}`,
    });
    
    // Complete order after showing success
    setTimeout(() => {
      onOrderComplete();
    }, 2000);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gradient-card border-border/50 shadow-elevated">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Order Complete!</h2>
            <p className="text-muted-foreground mb-4">
              Your domains have been successfully purchased and are being set up.
            </p>
            <div className="space-y-2 mb-6">
              {cartItems.map((domain) => (
                <div key={domain.name} className="flex items-center justify-between p-2 bg-background/50 rounded">
                  <span className="font-medium">{domain.name}</span>
                  <Badge variant="default">Purchased</Badge>
                </div>
              ))}
            </div>
            <Button variant="hero" onClick={onOrderComplete} className="w-full">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Secure Checkout</h1>
          </div>
          <p className="text-muted-foreground">
            Complete your domain purchase
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border-border/50 shadow-card">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  We'll use this information for domain registration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 shadow-card">
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  Your payment is secure and encrypted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <Input id="billingAddress" placeholder="123 Main St, City, State 12345" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="bg-gradient-card border-border/50 shadow-elevated sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {cartItems.length} domain{cartItems.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Domain List */}
                <div className="space-y-3">
                  {cartItems.map((domain) => (
                    <div key={domain.name} className="flex items-center justify-between p-3 bg-background/50 rounded">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <span className="font-medium">{domain.name}</span>
                      </div>
                      <span className="font-semibold">${domain.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ICANN Fee</span>
                    <span>${icannFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processing..." : `Pay $${finalTotal.toFixed(2)}`}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  <Lock className="h-3 w-3 inline mr-1" />
                  Secure 256-bit SSL encryption
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};