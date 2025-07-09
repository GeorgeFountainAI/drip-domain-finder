import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, Check, X, AlertCircle, ShoppingCart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
}

interface PurchaseResult {
  domain: string;
  success: boolean;
  message: string;
}

interface DomainSearchFormProps {
  className?: string;
}

export const DomainSearchForm = ({ className = "" }: DomainSearchFormProps) => {
  const [keyword, setKeyword] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [purchaseResults, setPurchaseResults] = useState<PurchaseResult[]>([]);
  
  // AI Suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<Domain[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isCheckingAiDomains, setIsCheckingAiDomains] = useState(false);
  const [hasGeneratedSuggestions, setHasGeneratedSuggestions] = useState(false);
  
  const { toast } = useToast();

  const storeSearchHistory = async (searchKeyword: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('search_history')
          .insert({
            user_id: user.id,
            keyword: searchKeyword
          });
      }
    } catch (error) {
      // Silently fail - search history is not critical for the main functionality
      console.error('Failed to store search history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      setError("Please enter a keyword");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/domainSearch?keyword=${encodeURIComponent(keyword.trim())}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setDomains(data);
      
      // Store search history for logged-in users
      await storeSearchHistory(keyword.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search domains");
      setDomains([]);
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const availableDomains = domains.filter(d => d.available).map(d => d.name);
      setSelectedDomains(new Set(availableDomains));
    } else {
      setSelectedDomains(new Set());
    }
  };

  const handlePurchase = async () => {
    if (selectedDomains.size === 0) {
      toast({
        title: "No domains selected",
        description: "Please select at least one domain to purchase.",
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);
    setPurchaseResults([]);

    try {
      const response = await fetch('/api/purchaseDomains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domains: Array.from(selectedDomains)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const results = await response.json();
      setPurchaseResults(results);
      
      // Clear selected domains after purchase attempt
      setSelectedDomains(new Set());
      
      // Show success toast
      const successfulPurchases = results.filter((r: PurchaseResult) => r.success);
      if (successfulPurchases.length > 0) {
        toast({
          title: "Purchase completed",
          description: `Successfully purchased ${successfulPurchases.length} domain(s).`,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to purchase domains");
      toast({
        title: "Purchase failed",
        description: err instanceof Error ? err.message : "Failed to purchase domains",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleSuggestDomains = async () => {
    if (!keyword.trim()) {
      setError("Please enter a keyword first");
      return;
    }

    setIsGeneratingSuggestions(true);
    setError(null);
    setHasGeneratedSuggestions(true);

    try {
      // Call the edge function to generate AI suggestions
      const { data, error } = await supabase.functions.invoke('suggest-domains', {
        body: { keyword: keyword.trim() }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate suggestions');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const suggestions = data.suggestions;
      
      if (!suggestions || suggestions.length === 0) {
        throw new Error('No suggestions generated');
      }

      // Check availability for each AI suggestion
      setIsCheckingAiDomains(true);
      const aiDomainResults: Domain[] = [];

      for (const suggestion of suggestions) {
        try {
          const response = await fetch(`/api/domainSearch?keyword=${encodeURIComponent(suggestion)}`);
          
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              // Find the exact domain or the closest match
              const exactMatch = data.find(d => d.name.toLowerCase() === suggestion.toLowerCase());
              if (exactMatch) {
                aiDomainResults.push(exactMatch);
              } else {
                // Create a domain entry even if not found in API results
                aiDomainResults.push({
                  name: suggestion,
                  available: false,
                  price: 0,
                  tld: suggestion.split('.').pop() || 'com'
                });
              }
            } else {
              // Create a domain entry for suggestions that couldn't be checked
              aiDomainResults.push({
                name: suggestion,
                available: false,
                price: 0,
                tld: suggestion.split('.').pop() || 'com'
              });
            }
          }
        } catch (apiError) {
          console.error(`Failed to check availability for ${suggestion}:`, apiError);
          // Add as unavailable if check fails
          aiDomainResults.push({
            name: suggestion,
            available: false,
            price: 0,
            tld: suggestion.split('.').pop() || 'com'
          });
        }
      }

      setAiSuggestions(aiDomainResults);
      
      toast({
        title: "AI Suggestions Generated",
        description: `Generated ${aiDomainResults.length} domain suggestions.`,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate AI suggestions");
      setAiSuggestions([]);
    } finally {
      setIsGeneratingSuggestions(false);
      setIsCheckingAiDomains(false);
    }
  };

  const availableDomains = domains.filter(d => d.available);
  const availableAiDomains = aiSuggestions.filter(d => d.available);
  const allAvailableDomains = [...availableDomains, ...availableAiDomains];
  
  const totalPrice = Array.from(selectedDomains).reduce((sum, domainName) => {
    const domain = [...domains, ...aiSuggestions].find(d => d.name === domainName);
    return sum + (domain?.price || 0);
  }, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Domain Search
          </CardTitle>
          <CardDescription>
            Enter a wildcard keyword (e.g., "curl*", "get*", "*app") to find available domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter keyword (e.g., curl*, get*, *app)"
                value={keyword}
                onChange={handleKeywordChange}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !keyword.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSuggestDomains}
                disabled={isGeneratingSuggestions || isCheckingAiDomains || !keyword.trim()}
              >
                {isGeneratingSuggestions ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : isCheckingAiDomains ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Suggest
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {hasSearched && !isLoading && !error && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Search Results {domains.length > 0 && `(${domains.length} domains)`}
              </CardTitle>
              
              {availableDomains.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={availableDomains.length > 0 && selectedDomains.size === availableDomains.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                      Select All Available
                    </label>
                  </div>
                  
                  {selectedDomains.size > 0 && (
                    <Button
                      onClick={handlePurchase}
                      disabled={isPurchasing}
                      variant="default"
                      className="ml-2"
                    >
                      {isPurchasing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Purchasing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy Selected ({selectedDomains.size}) - ${totalPrice.toFixed(2)}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {domains.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No domains found for "{keyword}". Try a different keyword.
              </p>
            ) : (
              <div className="space-y-2">
                {domains.map((domain) => (
                  <div
                    key={domain.name}
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {domain.available && (
                        <Checkbox
                          id={`domain-${domain.name}`}
                          checked={selectedDomains.has(domain.name)}
                          onCheckedChange={(checked) => handleDomainSelect(domain.name, checked as boolean)}
                        />
                      )}
                      <div className="flex items-center gap-2">
                        {domain.available ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{domain.name}</span>
                      </div>
                      <Badge variant={domain.available ? "default" : "secondary"}>
                        {domain.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    
                    {domain.available && (
                      <div className="text-sm font-medium">
                        ${domain.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-muted-foreground">Searching for domains...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions Section */}
      {hasGeneratedSuggestions && !isGeneratingSuggestions && !isCheckingAiDomains && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Suggestions
                  {aiSuggestions.length > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {aiSuggestions.length} suggestions
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  AI-generated domain suggestions based on "{keyword}"
                </CardDescription>
              </div>
              
              {availableAiDomains.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all-ai"
                      checked={availableAiDomains.length > 0 && availableAiDomains.every(d => selectedDomains.has(d.name))}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const newSelected = new Set(selectedDomains);
                          availableAiDomains.forEach(d => newSelected.add(d.name));
                          setSelectedDomains(newSelected);
                        } else {
                          const newSelected = new Set(selectedDomains);
                          availableAiDomains.forEach(d => newSelected.delete(d.name));
                          setSelectedDomains(newSelected);
                        }
                      }}
                    />
                    <label htmlFor="select-all-ai" className="text-sm font-medium">
                      Select All AI Suggestions
                    </label>
                  </div>
                  
                  {selectedDomains.size > 0 && (
                    <Button
                      onClick={handlePurchase}
                      disabled={isPurchasing}
                      variant="default"
                      className="ml-2"
                    >
                      {isPurchasing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Purchasing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy Selected ({selectedDomains.size}) - ${totalPrice.toFixed(2)}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {aiSuggestions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No AI suggestions could be generated for "{keyword}". Try a different keyword.
              </p>
            ) : (
              <div className="space-y-2">
                {aiSuggestions.map((domain) => (
                  <div
                    key={`ai-${domain.name}`}
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors bg-gradient-to-r from-primary/5 to-transparent"
                  >
                    <div className="flex items-center gap-3">
                      {domain.available && (
                        <Checkbox
                          id={`ai-domain-${domain.name}`}
                          checked={selectedDomains.has(domain.name)}
                          onCheckedChange={(checked) => handleDomainSelect(domain.name, checked as boolean)}
                        />
                      )}
                      <div className="flex items-center gap-2">
                        {domain.available ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{domain.name}</span>
                      </div>
                      <Badge variant={domain.available ? "default" : "secondary"}>
                        {domain.available ? "Available" : "Unavailable"}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-primary/10">
                        AI Generated
                      </Badge>
                    </div>
                    
                    {domain.available && (
                      <div className="text-sm font-medium">
                        ${domain.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions Loading State */}
      {(isGeneratingSuggestions || isCheckingAiDomains) && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-muted-foreground">
                {isGeneratingSuggestions ? "Generating AI suggestions..." : "Checking domain availability..."}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Results */}
      {purchaseResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Purchase Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {purchaseResults.map((result) => (
                <div
                  key={result.domain}
                  className="flex items-center justify-between p-3 rounded-md border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{result.domain}</span>
                    </div>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Purchased" : "Failed"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.message}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};