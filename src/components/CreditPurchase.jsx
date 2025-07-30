import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Zap, Star, Crown } from 'lucide-react';

const CreditPurchase = () => {
  const [loading, setLoading] = useState(null);
  const { toast } = useToast();

  const creditPackages = [
    {
      id: 'starter',
      name: '100 Credits',
      credits: 100,
      price: '$5.00',
      description: 'Perfect for getting started',
      icon: Zap,
      popular: false,
    },
    {
      id: 'popular',
      name: '250 Credits',
      credits: 250,
      price: '$10.00',
      description: 'Most popular choice',
      icon: Star,
      popular: true,
    },
    {
      id: 'premium',
      name: '500 Credits',
      credits: 500,
      price: '$18.00',
      description: 'Best value for power users',
      icon: Crown,
      popular: false,
    },
  ];

  const handlePurchase = async (packageId) => {
    try {
      setLoading(packageId);

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to purchase credits",
          variant: "destructive",
        });
        return;
      }

      // Call the edge function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-credit-checkout', {
        body: { creditPackage: packageId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase failed",
        description: error.message || "Failed to initiate purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {creditPackages.map((pkg) => {
        const IconComponent = pkg.icon;
        return (
          <Card key={pkg.id} className={`relative ${pkg.popular ? 'border-primary shadow-lg' : ''}`}>
            {pkg.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                <IconComponent className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
              <div className="text-3xl font-bold text-primary">{pkg.price}</div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-center mb-6">
                <span className="text-2xl font-semibold">{pkg.credits}</span>
                <span className="text-muted-foreground ml-1">credits</span>
              </div>
              <Button
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading === pkg.id}
                className="w-full"
                variant={pkg.popular ? "default" : "outline"}
              >
                {loading === pkg.id ? 'Processing...' : 'Purchase Credits'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CreditPurchase;