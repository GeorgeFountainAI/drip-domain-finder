import { useState, useEffect } from "react";
import { DomainSearch } from "./DomainSearch";
import { DomainSearchForm } from "./DomainSearchForm";
import { SearchHistoryViewer } from "./SearchHistoryViewer";
import { DomainResults } from "./DomainResults";
import { DomainCart } from "./DomainCart";
import { DomainCheckout } from "./DomainCheckout";
import { searchDomains } from "../utils/domainGenerator";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
}

type AppState = 'search' | 'results' | 'cart' | 'checkout';

export const DomainDripApp = () => {
  const [currentState, setCurrentState] = useState<AppState>('search');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [cartItems, setCartItems] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = async (keyword: string) => {
    setIsLoading(true);
    setCurrentKeyword(keyword);
    
    try {
      const results = await searchDomains(keyword);
      setDomains(results);
      setCurrentState('results');
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (newDomains: Domain[]) => {
    setCartItems(prev => {
      const existingNames = new Set(prev.map(d => d.name));
      const uniqueNewDomains = newDomains.filter(d => !existingNames.has(d.name));
      return [...prev, ...uniqueNewDomains];
    });
  };

  const handleRemoveFromCart = (domainName: string) => {
    setCartItems(prev => prev.filter(d => d.name !== domainName));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleBackToSearch = () => {
    setCurrentState('search');
    setDomains([]);
  };

  const handleViewCart = () => {
    setCurrentState('cart');
  };

  const handleBackToResults = () => {
    setCurrentState('results');
  };

  const handleProceedToCheckout = () => {
    setCurrentState('checkout');
  };

  const handleBackToCart = () => {
    setCurrentState('cart');
  };

  const handleOrderComplete = () => {
    setCartItems([]);
    setCurrentState('search');
    setDomains([]);
  };

  // Cart button for results page
  const CartButton = () => {
    if (currentState !== 'results' || cartItems.length === 0) return null;
    
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="hero"
          size="lg"
          onClick={handleViewCart}
          className="shadow-elevated"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Cart ({cartItems.length})
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {currentState === 'search' && (
        <div className="bg-gradient-hero">
          {/* Hero Section */}
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    DomainDrip.AI
                  </h1>
                </div>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Generate perfect domain names for your next project. Enter a keyword or pattern and discover available domains instantly.
                </p>
              </div>
              
              {/* Original Search Component */}
              <DomainSearch 
                onSearch={handleSearch} 
                isLoading={isLoading}
              />
              
              {/* New API-Connected Search Form */}
              <div className="mt-16">
                <DomainSearchForm />
              </div>
              
              {/* Search History Viewer - Only show if user is logged in */}
              {user && (
                <div className="mt-16">
                  <SearchHistoryViewer />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {currentState === 'results' && (
        <DomainResults
          domains={domains}
          onAddToCart={handleAddToCart}
          onBack={handleBackToSearch}
          isLoading={isLoading}
        />
      )}
      
      {currentState === 'cart' && (
        <DomainCart
          cartItems={cartItems}
          onRemoveFromCart={handleRemoveFromCart}
          onProceedToCheckout={handleProceedToCheckout}
          onClearCart={handleClearCart}
        />
      )}
      
      {currentState === 'checkout' && (
        <DomainCheckout
          cartItems={cartItems}
          onBack={handleBackToCart}
          onOrderComplete={handleOrderComplete}
        />
      )}
      
      <CartButton />
    </div>
  );
};