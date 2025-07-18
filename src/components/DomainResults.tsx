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

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableDomains.map((domain) => (
            <Card key={domain.name} className="bg-gradient-card border-border/50 shadow-card hover:shadow-elevated transition-smooth">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{domain.name}</CardTitle>
                  </div>
                  <Badge variant={domain.available ? "default" : "secondary"}>
                    {domain.available ? "Available" : "Taken"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      ${domain.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      .{domain.tld} domain
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={domain.name}
                      checked={selectedDomains.has(domain.name)}
                      onCheckedChange={() => handleDomainToggle(domain.name)}
                    />
                    <label
                      htmlFor={domain.name}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Select
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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