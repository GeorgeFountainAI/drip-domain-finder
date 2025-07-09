import { useState } from "react";
import { DomainSearch } from "./DomainSearch";
import { DomainResults } from "./DomainResults";
import { DomainCart } from "./DomainCart";
import { DomainCheckout } from "./DomainCheckout";
import { searchDomains } from "../utils/domainGenerator";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

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
        <DomainSearch 
          onSearch={handleSearch} 
          isLoading={isLoading}
        />
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