import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Zap, Star } from 'lucide-react';

const CreditPurchase = () => {
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const { toast } = useToast();

  const creditPackages = [
    {
      id: 'basic',
      name: '10 Credits',
      price: '$5.00',
      credits: 10,
      icon: CreditCard,
      description: 'Perfect for getting started',
      pricePerCredit: '$0.50'
    },
    {
      id: 'value',
      name: '25 Credits',
      price: '$12.50',
      credits: 25,
      icon: Zap,
      description: 'Best value for regular users',
      popular: true,
      pricePerCredit: '$0.50'
    },
    {
      id: 'premium',
      name: '50 Credits',
      price: '$25.00',
      credits: 50,
      icon: Star,
      description: 'For power users',
      pricePerCredit: '$0.50'
    }
  ];

  const handlePurchase = async (packageId: string) => {
    try {
      setLoadingPackage(packageId);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to purchase credits.",
          variant: "destructive"
        });
        return;
      }

      if (demoMode) {
        // Demo mode - simulate successful purchase
        toast({
          title: "Demo Mode",
          description: "This is a demo. In production, this would open Stripe checkout.",
        });
        return;
      }

      // Get the session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No valid session found");
      }

      // Call the create-credit-checkout function
      const { data, error } = await supabase.functions.invoke('create-credit-checkout', {
        body: { creditPackage: packageId },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');

      toast({
        title: "Redirecting to Checkout",
        description: "Opening Stripe checkout in a new tab...",
      });

    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to initiate purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingPackage(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="demo-mode"
          checked={demoMode}
          onCheckedChange={setDemoMode}
        />
        <Label htmlFor="demo-mode" className="text-sm text-muted-foreground">
          Demo Mode (for investor presentations)
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {creditPackages.map((pkg) => {
          const IconComponent = pkg.icon;
          const isLoading = loadingPackage === pkg.id;
          
          return (
            <Card key={pkg.id} className={`relative ${pkg.popular ? 'border-primary' : ''}`}>
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">{pkg.price}</div>
                <p className="text-sm text-muted-foreground">{pkg.pricePerCredit} per credit</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">{pkg.description}</p>
                <div className="text-lg font-semibold">
                  {pkg.credits} Credits
                </div>
                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isLoading}
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                >
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    `Purchase Credits`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CreditPurchase;