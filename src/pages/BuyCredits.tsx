import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreditPurchase from '@/components/CreditPurchase';
import { Button } from '@/components/ui/button';

const BuyCredits = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link to="/app">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-center mb-2">Buy Credits</h1>
            <p className="text-muted-foreground text-center">
              Purchase credits to continue searching for domains
            </p>
          </div>
          
          <CreditPurchase />
        </div>
      </div>
    </div>
  );
};

export default BuyCredits;