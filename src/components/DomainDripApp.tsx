import { useState, useEffect, useRef } from "react";
import { DomainSearchForm, DomainSearchFormRef } from "./DomainSearchForm";
import { SearchHistoryViewer } from "./SearchHistoryViewer";
import { AuthForm } from "./AuthForm";
import { ModernHeader } from "./ModernHeader";
import DomainResults from "./DomainResults";
import SelectedDomainsSummary from "./SelectedDomainsSummary";
import BulkActionsFooter from "./BulkActionsFooter";
import { DomainCart } from "./DomainCart";
import { DomainCheckout } from "./DomainCheckout";
import FAQPreview from "./FAQPreview";
import Footer from "./Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Sparkles, Wand2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import domainDripLogo from "/lovable-uploads/54151200-6cf6-4c1b-b88a-bc150fc097c8.png";

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
  
  const navigate = useNavigate();

  const handleCreditPurchase = () => {
    // Navigate to credit purchase page or open credit modal
    navigate('/');
  };
  
  // Ref for the DomainSearchForm
  const domainSearchFormRef = useRef<DomainSearchFormRef>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        // Redirect to auth if not authenticated
        navigate('/auth');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          // Redirect to auth if logged out
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);


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

  // Handle search again from SearchHistoryViewer
  const handleSearchAgain = async (keyword: string) => {
    if (domainSearchFormRef.current) {
      await domainSearchFormRef.current.searchKeyword(keyword);
    }
  };

  // Mock fetcher for DomainResults - this matches the expected interface
  const mockFetcher = async (query: string) => {
    return {
      results: domains.map(d => ({
        domain: d.name,
        available: d.available,
        price: d.price,
        flipScore: 85
      })),
      suggestions: []
    };
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

  // Return null or loading state while checking auth
  if (!user) {
    return null; // This will only show briefly before redirect
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${currentState === 'results' ? 'bg-white' : ''}`}>
      {/* Subtle background for watermark visibility - hide on results page */}
      {currentState !== 'results' && <div className="fixed inset-0 z-0 bg-gradient-to-br from-background via-muted/30 to-background" />}
      
      {/* Background Logo Watermark - hide on results page */}
      {currentState !== 'results' && (
        <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
          <img 
            src={domainDripLogo} 
            alt="" 
            className="w-[60vw] h-[60vh] object-contain opacity-[0.08] rotate-12 scale-150 mix-blend-overlay"
          />
        </div>
      )}
      <div className="relative z-10">
        <ModernHeader user={user} onCreditPurchase={handleCreditPurchase} />
      
      {currentState === 'search' && (
        <div className="bg-gradient-hero">
          {/* Main Content */}
          <div className="flex items-center justify-center p-4 pt-16">
            <div className="max-w-3xl w-full">
              <div className="text-center mb-16">
                <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                  Find Your Perfect Domain
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Discover available domains with our AI-powered search. Get flip scores, trend analysis, and instant availability checks.
                </p>
              </div>
              
              {/* Unified Search Form */}
              <DomainSearchForm 
                ref={domainSearchFormRef} 
                onResults={(domains) => {
                  console.log('🎯 Received domains from search:', domains.length);
                  setDomains(domains);
                }}
                onStateChange={(state) => {
                  console.log('🔄 State change requested:', state);
                  setCurrentState(state);
                }}
              />
              
              
              {/* Search History Viewer - Always visible when logged in */}
              {user && (
                <div className="mt-8">
                  <SearchHistoryViewer onSearchAgain={handleSearchAgain} />
                </div>
              )}
            </div>
          </div>
          
          {/* FAQ Section */}
          <FAQPreview />
          
          {/* Footer */}
          <Footer />
        </div>
      )}
      
      {currentState === 'results' && (
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <DomainResults />
            </div>
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-4">
                <SelectedDomainsSummary />
              </div>
            </div>
          </div>
        </div>
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
        {currentState === 'results' && <BulkActionsFooter />}
      </div>
    </div>
  );
};
