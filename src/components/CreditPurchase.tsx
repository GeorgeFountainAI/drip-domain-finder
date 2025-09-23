/**
 * Enhanced Credit Purchase Component
 * 
 * Features:
 * - Stripe integration for secure payment processing
 * - Demo mode toggle for investor presentations  
 * - Single pack: $5 for 10 credits
 * - Real-time authentication and session management
 * - Comprehensive error handling and user feedback
 * - Responsive design with modern UI components
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard } from 'lucide-react';
import { CREDIT_PACKS } from '@/config/credits';

const CreditPurchase = () => {
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const { toast } = useToast();

  // Use single credit pack from config
  const creditPack = CREDIT_PACKS[0]; // Single pack only

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
        body: { packId: packageId },
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

      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">{creditPack.name}</CardTitle>
            <div className="text-3xl font-bold text-primary">${creditPack.priceUsd.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">${(creditPack.priceUsd / creditPack.credits).toFixed(2)} per credit</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{creditPack.description}</p>
            <div className="text-lg font-semibold">
              {creditPack.credits} Credits
            </div>
            <Button
              onClick={() => handlePurchase(creditPack.id)}
              disabled={loadingPackage === creditPack.id}
              className="w-full"
            >
              {loadingPackage === creditPack.id ? (
                "Processing..."
              ) : (
                `Purchase Credits`
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreditPurchase;