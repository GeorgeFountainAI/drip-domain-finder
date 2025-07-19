import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Check, Globe, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RequireCredits from "@/components/RequireCredits";

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
}

interface DomainResultsProps {
  domains: Domain[];
  onAddToCart: (domains: Domain[]) => void;
  onBack: () => void;
  isLoading: boolean;
  totalResults?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export const DomainResults = ({ 
  domains, 
  onAddToCart, 
  onBack, 
  isLoading, 
  totalResults, 
  hasMore = false, 
  onLoadMore, 
  isLoadingMore = false 
}: DomainResultsProps) => {
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDomainToggle = (domainName: string) => {
    const newSelected = new Set(selectedDomains);
    if (newSelected.has(domainName)) {
      newSelected.delete(domainName);
    } else {
      newSelected.add(domainName);
    }
    setSelectedDomains(newSelected);
  };

  const handleDomainSelect = (domain: Domain) => {
    setSelectedDomain(selectedDomain?.name === domain.name ? null : domain);
  };

  const handleAddToCart = () => {
    const domainsToAdd = domains.filter(d => selectedDomains.has(d.name));
    if (domainsToAdd.length > 0) {
      onAddToCart(domainsToAdd);
      toast({
        title: "Added to Cart",
        description: `${domainsToAdd.length} domain${domainsToAdd.length > 1 ? 's' : ''} added to cart`,
      });
      setSelectedDomains(new Set());
    }
  };

  const handleContinueToCheckout = () => {
    if (selectedDomain) {
      const searchParams = new URLSearchParams({
        domain: selectedDomain.name,
        price: selectedDomain.price.toString(),
        tld: selectedDomain.tld
      });
      
      navigate(`/checkout?${searchParams.toString()}`);
    }
  };

  const availableDomains = domains.filter(d => d.available);
  const totalPrice = availableDomains
    .filter(d => selectedDomains.has(d.name))
    .reduce((sum, d) => sum + d.price, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Checking domain availability...</p>
        </div>
      </div>
    );
  }

  return (
    <RequireCredits credits={1} blockRender={false}>
      <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
            <h1 className="text-3xl font-bold mb-2">Domain Results</h1>
            <p className="text-muted-foreground">
              Found {availableDomains.length} available domains
            </p>
          </div>
          
          {selectedDomains.size > 0 && (
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold">
                      {selectedDomains.size} domain{selectedDomains.size > 1 ? 's' : ''} selected
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total: ${totalPrice.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="hero"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {availableDomains.map((domain) => {
            const domainParts = domain.name.split('.');
            const domainBase = domainParts[0];
            const tldExtension = domainParts.slice(1).join('.');
            const isSelected = selectedDomain?.name === domain.name;
            
            return (
              <Card 
                key={domain.name} 
                onClick={() => handleDomainSelect(domain)}
                className={`
                  backdrop-blur-sm border shadow-sm hover:shadow-md transition-all duration-200 rounded-xl p-6 cursor-pointer
                  ${isSelected 
                    ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20 shadow-lg' 
                    : 'bg-card/50 hover:bg-card/70'
                  }
                `}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Domain Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Globe className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-primary'}`} />
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className={`font-bold text-lg truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {domainBase}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-2 py-1 ${
                            isSelected 
                              ? 'bg-primary/20 text-primary border-primary/30' 
                              : 'bg-primary/10 text-primary border-primary/20'
                          }`}
                        >
                          .{tldExtension}
                        </Badge>
                      </div>
                    </div>
                    <Badge 
                      variant="default" 
                      className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 flex-shrink-0"
                    >
                      Available
                    </Badge>
                  </div>

                  {/* Price and Selection Indicator */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className={`text-xl font-bold ${isSelected ? 'text-primary' : 'text-primary'}`}>
                        ${domain.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        per year
                      </p>
                    </div>
                    
                    {isSelected && (
                      <div className="flex items-center text-primary">
                        <Check className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Checkout Button */}
        {selectedDomain && (
          <div className="mt-8 flex justify-center">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Ready to proceed?</h3>
                  <p className="text-muted-foreground mb-4">
                    Continue with <span className="font-semibold text-foreground">{selectedDomain.name}</span> for ${selectedDomain.price.toFixed(2)}/year
                  </p>
                  <Button 
                    onClick={handleContinueToCheckout}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                  >
                    Continue to Simulated Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pagination Indicators and Load More */}
        {availableDomains.length > 0 && (
          <div className="mt-8 space-y-4">
            {/* Results Status */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
                <span className="text-sm text-muted-foreground">
                  {totalResults ? (
                    `Showing ${availableDomains.length} of ${totalResults} results`
                  ) : hasMore ? (
                    `Showing ${availableDomains.length} results`
                  ) : (
                    `${availableDomains.length} results • End of list`
                  )}
                </span>
              </div>
            </div>

            {/* Load More Button */}
            {hasMore && onLoadMore && (
              <div className="flex justify-center">
                <Button
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Loading more domains...
                    </>
                  ) : (
                    'Load More Results'
                  )}
                </Button>
              </div>
            )}

            {/* End of Results Message */}
            {!hasMore && totalResults && availableDomains.length < totalResults && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Some domains may not be shown due to filtering or availability
                </p>
              </div>
            )}
          </div>
        )}
        {availableDomains.length === 0 && (
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardContent className="p-8 text-center">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Available Domains</h3>
              <p className="text-muted-foreground">
                Try a different keyword or pattern to find available domains.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </RequireCredits>
  );
};