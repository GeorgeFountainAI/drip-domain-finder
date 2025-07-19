import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, Check, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConsumeCredit } from "@/hooks/useConsumeCredit";
import { useAdminBypass } from "@/hooks/useAdminBypass";
import RequireCredits from "@/components/RequireCredits";
import searchDomains from "@/api/domainSearchClient";

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
}

interface DomainSearchFormProps {
  className?: string;
}

export interface DomainSearchFormRef {
  searchKeyword: (keyword: string) => Promise<void>;
  focusOnResults: () => void;
}

export const DomainSearchForm = forwardRef<DomainSearchFormRef, DomainSearchFormProps>(({ className = "" }, ref) => {
  const [keyword, setKeyword] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { toast } = useToast();
  const { consumeCredit, loading: creditLoading } = useConsumeCredit();
  const { isAdmin } = useAdminBypass();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      setError("Please enter a keyword");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    // Admin users bypass credit checks
    if (!isAdmin) {
      const creditResult = await consumeCredit(1);
      if (!creditResult.success) {
        setIsLoading(false);
        setError("Unable to deduct credit for search");
        return;
      }
    } else {
      console.log('Admin bypass: Skipping credit deduction for search');
    }

    try {
      const searchResult = await searchDomains(keyword.trim());
      
      if (searchResult.error) {
        toast({
          title: "Search Notice",
          description: searchResult.error,
          variant: "default",
        });
      }

      setDomains(searchResult.domains);
      
      if (searchResult.isDemo) {
        toast({
          title: "Demo Mode",
          description: "Showing sample domain results for demonstration.",
          variant: "default",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search domains";
      setError(errorMessage);
      setDomains([]);
      
      console.error('Domain search failed:', err);
      
      toast({
        title: "Search Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    if (error) setError(null);
  };

  const handleDomainSelect = (domainName: string, checked: boolean) => {
    setSelectedDomains(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(domainName);
      } else {
        newSet.delete(domainName);
      }
      return newSet;
    });
  };

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    searchKeyword: async (searchKeyword: string) => {
      setKeyword(searchKeyword);
      setIsLoading(true);
      setError(null);
      setHasSearched(true);
      setDomains([]);
      setSelectedDomains(new Set());

      try {
        const searchResult = await searchDomains(searchKeyword.trim());
        setDomains(searchResult.domains);
        
        if (searchResult.isDemo) {
          toast({
            title: "Demo Mode",
            description: "Showing sample domain results for demonstration.",
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search domains");
        setDomains([]);
      } finally {
        setIsLoading(false);
      }
    },
    focusOnResults: () => {
      // Implement focus logic if needed
    }
  }), [toast]);

  return (
    <RequireCredits credits={isAdmin ? 0 : 1} action="search domains" showAlert={hasSearched && !isAdmin}>
      <div className={`max-w-6xl mx-auto space-y-8 ${className}`} data-testid="domain-search-form">
        {/* Search Form */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Find Your Perfect Domain</CardTitle>
            <CardDescription className="text-base">
              Generate perfect domain names for your next project. Enter a keyword to discover available domains instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter keyword to search domains..."
                  value={keyword}
                  onChange={handleKeywordChange}
                  className="text-lg py-6"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                disabled={isLoading || !keyword.trim()}
                className="px-8 py-6 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" data-testid="loading-spinner" /> 
                    Searching...
                  </>
                ) : (
                  <><Search className="mr-2 h-5 w-5" /> Search Domains</>
                )}
              </Button>
            </form>

            {error && (
              <div className="flex items-center gap-2 text-destructive mt-4">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {hasSearched && (
          <div className="space-y-6" data-testid="domain-results">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Searching for domains...</span>
                  </div>
                </CardContent>
              </Card>
            ) : domains.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results ({domains.length} domains)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {domains.map((domain) => (
                      <div
                        key={domain.name}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        data-testid="domain-result-item"
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={selectedDomains.has(domain.name)}
                            onCheckedChange={(checked) => handleDomainSelect(domain.name, checked as boolean)}
                            disabled={!domain.available}
                          />
                          <div>
                            <div className="font-semibold text-lg">{domain.name}</div>
                            <div className="flex items-center gap-2">
                              {domain.available ? (
                                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                                  <Check className="mr-1 h-3 w-3" />
                                  Available
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-red-100 text-red-800">
                                  <X className="mr-1 h-3 w-3" />
                                  Unavailable
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {domain.available && (
                          <div className="text-right">
                            <div className="text-xl font-bold">${domain.price.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">/year</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No domains found for "{keyword}". Try a different keyword.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </RequireCredits>
  );
});

DomainSearchForm.displayName = "DomainSearchForm";