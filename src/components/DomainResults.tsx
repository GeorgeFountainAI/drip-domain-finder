import { useState } from "react";
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
}

export const DomainResults = ({ domains, onAddToCart, onBack, isLoading }: DomainResultsProps) => {
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleDomainToggle = (domainName: string) => {
    const newSelected = new Set(selectedDomains);
    if (newSelected.has(domainName)) {
      newSelected.delete(domainName);
    } else {
      newSelected.add(domainName);
    }
    setSelectedDomains(newSelected);
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
            
            return (
              <Card 
                key={domain.name} 
                className="bg-card/50 backdrop-blur-sm border shadow-sm hover:shadow-md transition-all duration-200 rounded-xl p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Domain Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-bold text-lg text-foreground truncate">
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

                  {/* Price and Actions */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        ${domain.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        per year
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={domain.name}
                        checked={selectedDomains.has(domain.name)}
                        onCheckedChange={() => handleDomainToggle(domain.name)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor={domain.name}
                        className="text-sm font-medium leading-none cursor-pointer select-none"
                      >
                        Select
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

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