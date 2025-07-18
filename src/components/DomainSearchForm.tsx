import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Search, Check, X, AlertCircle, ShoppingCart, Sparkles, Lock, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useConsumeCredit } from "@/hooks/useConsumeCredit";
import RequireCredits from "@/components/RequireCredits";

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

export interface DomainSearchFormRef {
  searchKeyword: (keyword: string) => Promise<void>;
  focusOnResults: () => void;
}

export const DomainSearchForm = forwardRef<DomainSearchFormRef, DomainSearchFormProps>(({ className = "" }, ref) => {
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
  
  // Usage limits state
  const [canSearch, setCanSearch] = useState(true);
  const [usageLimitMessage, setUsageLimitMessage] = useState<string | null>(null);
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);
  
  // Refs for focusing
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { consumeCredit, loading: creditLoading } = useConsumeCredit();

  // Check if user can perform search based on usage limits
  const checkUsageLimits = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUsageLimitMessage("Please log in to search domains.");
        return false;
      }

      setIsCheckingUsage(true);

      // First, ensure user has a subscriber record - create one if not exists
      const { data: subscriber, error: subscriberError } = await (supabase as any)
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subscriberError) {
        console.error('Error checking subscriber:', subscriberError);
        setUsageLimitMessage("Unable to check usage limits. Please try again.");
        return false;
      }

      // Create subscriber record if it doesn't exist
      if (!subscriber) {
        const { error: insertError } = await (supabase as any)
          .from('subscribers')
          .insert({
            user_id: user.id,
            email: user.email,
            tier: 'free'
          });

        if (insertError) {
          console.error('Error creating subscriber record:', insertError);
          setUsageLimitMessage("Unable to create user record. Please try again.");
          return false;
        }
      }

      // Check if user can search using the database function
      const { data: canUserSearch, error: usageError } = await (supabase as any)
        .rpc('can_user_search', { user_id: user.id });

      if (usageError) {
        console.error('Error checking usage limits:', usageError);
        setUsageLimitMessage("Unable to check usage limits. Please try again.");
        return false;
      }

      if (!canUserSearch) {
        setUsageLimitMessage("You've reached your daily limit. Upgrade to Pro for unlimited searches.");
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in checkUsageLimits:', error);
      setUsageLimitMessage("Unable to check usage limits. Please try again.");
      return false;
    } finally {
      setIsCheckingUsage(false);
    }
  };

  // Log search usage after successful search
  const logSearchUsage = async (searchKeyword: string, searchType: 'manual' | 'ai' = 'manual') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await (supabase as any)
          .from('usage_logs')
          .insert({
            user_id: user.id,
            action: searchType === 'ai' ? 'ai_search' : 'search',
            details: { keyword: searchKeyword }
          });
      }
    } catch (error) {
      console.error('Failed to log search usage:', error);
      // Don't throw - usage logging is not critical for the main functionality
    }
  };

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

    // Check usage limits before proceeding
    setUsageLimitMessage(null);
    const canProceed = await checkUsageLimits();
    if (!canProceed) {
      setCanSearch(false);
      return;
    }

    setCanSearch(true);
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    // Consume 1 credit for domain search
    const creditResult = await consumeCredit(1);
    if (!creditResult.success) {
      setIsLoading(false);
      setError("Unable to deduct credit for search");
      return;
    }

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
      
      // Log the search usage
      await logSearchUsage(keyword.trim(), 'manual');
      
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

    // Check usage limits before proceeding with AI suggestions
    setUsageLimitMessage(null);
    const canProceed = await checkUsageLimits();
    if (!canProceed) {
      setCanSearch(false);
      return;
    }

    setCanSearch(true);
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
      
      // Log the AI search usage
      await logSearchUsage(keyword.trim(), 'ai');
      
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

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    searchKeyword: async (searchKeyword: string) => {
      setKeyword(searchKeyword);
      
      // Check usage limits before proceeding
      setUsageLimitMessage(null);
      const canProceed = await checkUsageLimits();
      if (!canProceed) {
        setCanSearch(false);
        return;
      }

      setCanSearch(true);
      setIsLoading(true);
      setError(null);
      setHasSearched(true);
      
      // Reset previous results
      setDomains([]);
      setAiSuggestions([]);
      setHasGeneratedSuggestions(false);
      setSelectedDomains(new Set());

      // Consume 1 credit for domain search
      const creditResult = await consumeCredit(1);
      if (!creditResult.success) {
        setIsLoading(false);
        setError("Unable to deduct credit for search");
        return;
      }

      try {
        const response = await fetch(`/api/domainSearch?keyword=${encodeURIComponent(searchKeyword.trim())}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setDomains(data);
        
        // Log the search usage
        await logSearchUsage(searchKeyword.trim(), 'manual');
        
        // Store search history for logged-in users
        await storeSearchHistory(searchKeyword.trim());
        
        // Focus on results after search
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search domains");
        setDomains([]);
      } finally {
        setIsLoading(false);
      }
    },
    focusOnResults: () => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }), [checkUsageLimits, logSearchUsage, storeSearchHistory]);

  return (
    <RequireCredits credits={1} blockRender={false}>
      <TooltipProvider>
        <div className={`space-y-6 ${className}`}>
        {/* Unified Search Section */}
        <Card className="bg-gradient-card border-border/50 shadow-elevated backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Find Your Perfect Domain</CardTitle>
            <CardDescription className="text-base">
              Generate perfect domain names for your next project. Enter a keyword or pattern and discover available domains instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter keyword or pattern (e.g., curl*, get*, *app)"
                    value={keyword}
                    onChange={handleKeywordChange}
                    className="text-lg h-14 bg-background/50 border-border/50 focus:border-primary pr-12"
                    disabled={isLoading}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-background/50"
                      >
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-medium">Search Tips:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Use * as wildcard: "curl*" finds curly, curler, etc.</li>
                          <li>• Try patterns: "my*app", "*hub", "get*"</li>
                          <li>• Simple keywords work too: "myapp", "startup"</li>
                          <li>• Use AI suggestions for creative alternatives</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading || !keyword.trim() || !canSearch || isCheckingUsage} 
                    className="flex-1 h-12 text-base"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Searching Domains...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        Search Domains
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSuggestDomains}
                    disabled={isGeneratingSuggestions || isCheckingAiDomains || !keyword.trim() || !canSearch || isCheckingUsage}
                    className="flex-1 sm:flex-none h-12 text-base"
                    size="lg"
                  >
                    {isGeneratingSuggestions ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : isCheckingAiDomains ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        AI Suggest
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Example Patterns */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">Try these patterns:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["curl*", "my*app", "*hub", "get*", "super*"].map((pattern) => (
                    <Button
                      key={pattern}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setKeyword(pattern)}
                      className="bg-background/50 hover:bg-background/70 text-xs"
                    >
                      {pattern}
                    </Button>
                  ))}
                </div>
              </div>
            
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {usageLimitMessage && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">{usageLimitMessage}</span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

      {/* Results Section */}
      {hasSearched && !isLoading && !error && (
        <Card ref={resultsRef}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>
                Search Results {domains.length > 0 && `(${domains.length} domains)`}
              </CardTitle>
              
              {availableDomains.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={availableDomains.length > 0 && selectedDomains.size === availableDomains.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                      <span className="hidden sm:inline">Select All Available</span>
                      <span className="sm:hidden">Select All</span>
                    </label>
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
                     className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors gap-3"
                   >
                     <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
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
                           <span className="font-medium break-all">{domain.name}</span>
                         </div>
                       </div>
                       <div className="flex flex-wrap items-center gap-2">
                         <Badge variant={domain.available ? "default" : "secondary"}>
                           {domain.available ? "Available" : "Unavailable"}
                         </Badge>
                         {domain.available && domain.price > 0 && (
                           <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                             ${domain.price.toFixed(2)}/year
                           </Badge>
                         )}
                       </div>
                     </div>
                     
                     {domain.available && domain.price > 0 && (
                       <div className="text-right sm:text-right text-left">
                         <div className="text-lg font-bold text-green-600">
                           ${domain.price.toFixed(2)}
                         </div>
                         <div className="text-xs text-muted-foreground">
                           per year
                         </div>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Suggestions
                  </div>
                  {aiSuggestions.length > 0 && (
                    <Badge variant="outline">
                      {aiSuggestions.length} suggestions
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  AI-generated domain suggestions based on "{keyword}"
                </CardDescription>
              </div>
              
              {availableAiDomains.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
                      <span className="hidden sm:inline">Select All AI Suggestions</span>
                      <span className="sm:hidden">Select All AI</span>
                    </label>
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
                     className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors bg-gradient-to-r from-primary/5 to-transparent gap-3"
                   >
                     <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
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
                           <span className="font-medium break-all">{domain.name}</span>
                         </div>
                       </div>
                       <div className="flex flex-wrap items-center gap-2">
                         <Badge variant={domain.available ? "default" : "secondary"}>
                           {domain.available ? "Available" : "Unavailable"}
                         </Badge>
                         <Badge variant="outline" className="text-xs bg-primary/10">
                           AI Generated
                         </Badge>
                         {domain.available && domain.price > 0 && (
                           <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                             ${domain.price.toFixed(2)}/year
                           </Badge>
                         )}
                       </div>
                     </div>
                     
                     {domain.available && domain.price > 0 && (
                       <div className="text-right sm:text-right text-left">
                         <div className="text-lg font-bold text-green-600">
                           ${domain.price.toFixed(2)}
                         </div>
                         <div className="text-xs text-muted-foreground">
                           per year
                         </div>
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
    </TooltipProvider>
    </RequireCredits>
  );
});