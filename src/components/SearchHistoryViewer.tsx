import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, History, Search, Check, X, AlertCircle, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchHistoryItem {
  id: string;
  keyword: string;
  created_at: string;
}

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

export const SearchHistoryViewer = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchingKeyword, setSearchingKeyword] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{ [keyword: string]: Domain[] }>({});
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseResults, setPurchaseResults] = useState<PurchaseResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('search_history')
        .select('id, keyword, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching search history:', error);
        return;
      }

      setSearchHistory(data || []);
    } catch (error) {
      console.error('Error fetching search history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' – ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSearchAgain = async (keyword: string) => {
    setSearchingKeyword(keyword);
    
    try {
      const response = await fetch(`/api/domainSearch?keyword=${encodeURIComponent(keyword)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setSearchResults(prev => ({ ...prev, [keyword]: data }));
      
      toast({
        title: "Search completed",
        description: `Found ${data.length} domains for "${keyword}"`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search domains";
      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSearchingKeyword(null);
    }
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
      toast({
        title: "Purchase failed",
        description: err instanceof Error ? err.message : "Failed to purchase domains",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const getAllAvailableDomains = () => {
    const allDomains: Domain[] = [];
    Object.values(searchResults).forEach(domains => {
      allDomains.push(...domains.filter(d => d.available));
    });
    return allDomains;
  };

  const totalPrice = Array.from(selectedDomains).reduce((sum, domainName) => {
    const allDomains = getAllAvailableDomains();
    const domain = allDomains.find(d => d.name === domainName);
    return sum + (domain?.price || 0);
  }, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-muted-foreground">Loading search history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (searchHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Search History
          </CardTitle>
          <CardDescription>
            Your recent domain searches will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No search history yet. Start searching for domains to see your history here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Search History
              </CardTitle>
              <CardDescription>
                Your {searchHistory.length} most recent domain searches
              </CardDescription>
            </div>
            
            {selectedDomains.size > 0 && (
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing}
                variant="default"
                size="sm"
                className="w-full sm:w-auto"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Purchasing...</span>
                    <span className="sm:hidden">Buying...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Buy Selected ({selectedDomains.size}) - ${totalPrice.toFixed(2)}</span>
                    <span className="sm:hidden">Buy ({selectedDomains.size}) ${totalPrice.toFixed(2)}</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {searchHistory.map((item) => (
              <div key={item.id} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-md border gap-3">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className="font-medium break-all">{item.keyword}</span>
                      <Badge variant="outline" className="self-start">{formatDate(item.created_at)}</Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSearchAgain(item.keyword)}
                    disabled={searchingKeyword === item.keyword}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {searchingKeyword === item.keyword ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Searching...</span>
                        <span className="sm:hidden">Search</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Search Again</span>
                        <span className="sm:hidden">Search</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Show search results if available */}
                {searchResults[item.keyword] && (
                  <div className="ml-3 sm:ml-6 p-4 bg-accent/30 rounded-md">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                      <h4 className="font-medium">
                        Results ({searchResults[item.keyword].length} domains)
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {searchResults[item.keyword].map((domain) => (
                        <div
                          key={domain.name}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 rounded border bg-background gap-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
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
                              <span className="font-medium text-sm">{domain.name}</span>
                            </div>
                            <Badge variant={domain.available ? "default" : "secondary"} className="text-xs">
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
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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