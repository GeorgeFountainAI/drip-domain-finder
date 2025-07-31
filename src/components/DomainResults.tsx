import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShoppingCart, Check, Globe, ArrowLeft, Star, TrendingUp, ExternalLink, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
  flipScore?: number;
  trendStrength?: number;
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

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'fill-muted text-muted-foreground'
          }`}
        />
      ))}
    </div>
  );
};

const FlipScore = ({ score, domainName }: { score: number; domainName: string }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent flip potential';
    if (score >= 60) return 'Good flip potential';
    return 'Moderate flip potential';
  };

  const domainLength = domainName.split('.')[0].length;
  const tld = domainName.split('.')[1];
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span className={`text-xs font-medium ${getScoreColor(score)}`}>
              {score}/100
            </span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{getScoreDescription(score)}</p>
            <div className="text-xs space-y-1">
              <p>• Domain length: {domainLength} characters</p>
              <p>• TLD: .{tld} {tld === 'com' ? '(Premium)' : tld === 'io' || tld === 'ai' ? '(High value)' : '(Standard)'}</p>
              <p>• Brandability and resale potential</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

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
  const [selectedDomainsForCart, setSelectedDomainsForCart] = useState<Set<string>>(new Set());
  const [selectedDomainsForBulk, setSelectedDomainsForBulk] = useState<Set<string>>(new Set());
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDomainSelect = (domain: Domain) => {
    setSelectedDomain(selectedDomain?.name === domain.name ? null : domain);
  };

  const handleAddToCart = () => {
    const domainsToAdd = domains.filter(d => selectedDomainsForCart.has(d.name));
    if (domainsToAdd.length > 0) {
      onAddToCart(domainsToAdd);
      toast({
        title: "Added to Cart",
        description: `${domainsToAdd.length} domain${domainsToAdd.length > 1 ? 's' : ''} added to cart`,
      });
      setSelectedDomainsForCart(new Set());
    }
  };

  const handleBuyNow = (domainName: string) => {
    const url = `https://www.spaceship.com/search?query=${domainName}&aff=MY_AFFILIATE_ID`;
    window.open(url, '_blank');
  };

  const handleBuySelectedDomains = () => {
    if (selectedDomainsForBulk.size === 0) return;
    
    const selectedDomainNames = Array.from(selectedDomainsForBulk);
    const bulkUrl = `https://www.spaceship.com/domains/search?query=${selectedDomainNames.join(',')}&aff_id=MY_AFFILIATE_ID`;
    
    window.open(bulkUrl, '_blank');
    
    toast({
      title: "Redirecting to Spaceship",
      description: `Opening bulk purchase for ${selectedDomainsForBulk.size} domains`,
    });
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
  const totalPriceForCart = availableDomains
    .filter(d => selectedDomainsForCart.has(d.name))
    .reduce((sum, d) => sum + d.price, 0);
  const totalPriceForBulk = availableDomains
    .filter(d => selectedDomainsForBulk.has(d.name))
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
          
          {selectedDomainsForCart.size > 0 && (
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold">
                      {selectedDomainsForCart.size} domain{selectedDomainsForCart.size > 1 ? 's' : ''} selected for cart
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total: ${totalPriceForCart.toFixed(2)}
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
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedDomainsForBulk.has(domain.name)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedDomainsForBulk);
                            if (checked) {
                              newSelected.add(domain.name);
                            } else {
                              newSelected.delete(domain.name);
                            }
                            setSelectedDomainsForBulk(newSelected);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0"
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Globe className="h-5 w-5 flex-shrink-0 text-primary" />
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-bold text-lg truncate text-foreground">
                            {domainBase}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
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
                    
                    {/* Domain Scores */}
                    {(domain.flipScore || domain.trendStrength) && (
                      <div className="flex items-center gap-4 ml-7">
                        {domain.flipScore && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Flip Score:</span>
                            <FlipScore score={domain.flipScore} domainName={domain.name} />
                          </div>
                        )}
                        {domain.trendStrength && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Trend:</span>
                            <StarRating rating={domain.trendStrength} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price and Buy Button */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        ${domain.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        per year
                      </p>
                    </div>
                    
                    <Button
                      variant="default"
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyNow(domain.name);
                      }}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-primary"
                    >
                      Buy Now
                    </Button>
                    
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

        {/* Bulk Purchase Button */}
        {selectedDomainsForBulk.size > 0 && (
          <div className="mt-8 flex justify-center">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Buy Selected Domains</h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedDomainsForBulk.size} domain{selectedDomainsForBulk.size > 1 ? 's' : ''} selected • Total: ${totalPriceForBulk.toFixed(2)}
                  </p>
                  <Button 
                    onClick={handleBuySelectedDomains}
                    size="lg"
                    variant="hero"
                    className="px-8"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Buy Selected Domains
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
  );
};