import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, CreditCard, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
}

interface DomainCartProps {
  cartItems: Domain[];
  onRemoveFromCart: (domainName: string) => void;
  onProceedToCheckout: () => void;
  onClearCart: () => void;
}

export const DomainCart = ({ cartItems, onRemoveFromCart, onProceedToCheckout, onClearCart }: DomainCartProps) => {
  const { toast } = useToast();

  const totalPrice = cartItems.reduce((sum, domain) => sum + domain.price, 0);

  const handleRemoveItem = (domainName: string) => {
    onRemoveFromCart(domainName);
    toast({
      title: "Removed from Cart",
      description: `${domainName} removed from cart`,
    });
  };

  const handleClearCart = () => {
    onClearCart();
    toast({
      title: "Cart Cleared",
      description: "All domains removed from cart",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Your Cart</h1>
            </div>
            <p className="text-muted-foreground">
              {cartItems.length} domain{cartItems.length !== 1 ? 's' : ''} in cart
            </p>
          </div>
          
          {cartItems.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearCart}
              className="text-destructive hover:text-destructive"
            >
              Clear Cart
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Search for domains and add them to your cart to get started.
              </p>
              <Button variant="hero" onClick={() => window.location.reload()}>
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((domain) => (
                <Card key={domain.name} className="bg-gradient-card border-border/50 shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="h-6 w-6 text-primary" />
                        <div>
                          <h3 className="font-semibold text-lg">{domain.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            .{domain.tld} domain registration
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            ${domain.price.toFixed(2)}
                          </p>
                          <Badge variant="default">Available</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(domain.name)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-gradient-card border-border/50 shadow-elevated sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>
                    {cartItems.length} domain{cartItems.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ICANN Fee</span>
                      <span>${(cartItems.length * 0.18).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-primary">
                          ${(totalPrice + cartItems.length * 0.18).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={onProceedToCheckout}
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Secure checkout powered by DomainDrip.AI
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};