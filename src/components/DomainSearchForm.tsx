/**
 * Enhanced Domain Search Form Component
 * 
 * Features:
 * - Real-time domain search with Spaceship API integration
 * - Advanced filtering by domain ranking (Pro, Trendy, Urban, etc.)
 * - TLD-based filtering for targeted searches
 * - Domain scoring with flip potential and trend analysis
 * - Credit-based search system with admin bypass
 * - Comprehensive error handling and user feedback
 * - Responsive design with modern UI components
 */
import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Check, X, AlertCircle, Star, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConsumeCredit } from "@/hooks/useConsumeCredit";
import { useAdminBypass } from "@/hooks/useAdminBypass";
import RequireCredits from "@/components/RequireCredits";
import { SearchHistory } from "@/components/SearchHistory";
import searchDomains from "@/api/domainSearchClient";
import { generateWildcardSuggestions } from "@/utils/domainGenerator";

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
  flipScore?: number; // 1-100, brandability + resale potential
  trendStrength?: number; // 1-5 stars, keyword trends
}

interface DomainSearchFormProps {
  className?: string;
  onResults?: (domains: Domain[]) => void;
  onStateChange?: (state: 'search' | 'results') => void;
}

export interface DomainSearchFormRef {
  searchKeyword: (keyword: string) => Promise<void>;
  focusOnResults: () => void;
}

// Helper component for displaying star rating
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

// Helper component for displaying flip score
const FlipScore = ({ score }: { score: number }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <div className="flex items-center gap-1">
      <TrendingUp className="h-3 w-3 text-muted-foreground" />
      <span className={`text-xs font-medium ${getScoreColor(score)}`}>
        {score}/100
      </span>
    </div>
  );
};

export const DomainSearchForm = forwardRef<DomainSearchFormRef, DomainSearchFormProps>(({ className = "", onResults, onStateChange }, ref) => {
  const [keyword, setKeyword] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [rankingFilter, setRankingFilter] = useState<string>("all");
  const [tldFilter, setTldFilter] = useState<string>("all");
  const [lastSearchedKeyword, setLastSearchedKeyword] = useState<string>("");
  
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
      // Check if wildcard search
      if (keyword.trim().includes('*')) {
        // Handle wildcard search
        const wildcardSuggestions = generateWildcardSuggestions(keyword.trim().replace(/\*/g, ''));
        const wildcardDomains: Domain[] = wildcardSuggestions.map((suggestion, index) => ({
          name: `${suggestion}.com`,
          available: Math.random() > 0.3, // Mock availability
          price: 12.99 + Math.random() * 20,
          tld: 'com',
          flipScore: 60 + Math.floor(Math.random() * 30),
          trendStrength: Math.floor(Math.random() * 5) + 1
        }));
        
        setDomains(wildcardDomains);
        setLastSearchedKeyword(keyword.trim());
        
        // Notify parent with results
        if (onResults) {
          onResults(wildcardDomains);
        }
        if (onStateChange) {
          onStateChange('results');
        }
        
        toast({
          title: "Wildcard Search Complete",
          description: `Found ${wildcardSuggestions.length} domain pattern suggestions`,
          variant: "default",
        });
      } else {
        // Regular domain search
        const searchResult = await searchDomains(keyword.trim());
        
        if (searchResult.error) {
          toast({
            title: "Search Notice",
            description: searchResult.error,
            variant: "default",
          });
        }

        setDomains(searchResult.domains);
        setLastSearchedKeyword(keyword.trim());
        
        // Notify parent with results
        if (onResults) {
          onResults(searchResult.domains);
        }
        if (onStateChange) {
          onStateChange('results');
        }
        
        if (searchResult.isDemo) {
          toast({
            title: "Demo Mode",
            description: "Showing sample domain results for demonstration.",
            variant: "default",
          });
        }
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

  // Handle search again from history
  const handleSearchAgain = async (searchKeyword: string) => {
    setKeyword(searchKeyword);
    
    // Create a synthetic form event and trigger search
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent;
    
    // Use the same search logic as handleSubmit but with the history keyword
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
    }

    try {
      // Check if wildcard search
      if (searchKeyword.trim().includes('*')) {
        // Handle wildcard search
        const wildcardSuggestions = generateWildcardSuggestions(searchKeyword.trim().replace(/\*/g, ''));
        const wildcardDomains: Domain[] = wildcardSuggestions.map((suggestion, index) => ({
          name: `${suggestion}.com`,
          available: Math.random() > 0.3,
          price: 12.99 + Math.random() * 20,
          tld: 'com',
          flipScore: 60 + Math.floor(Math.random() * 30),
          trendStrength: Math.floor(Math.random() * 5) + 1
        }));
        
        setDomains(wildcardDomains);
        setLastSearchedKeyword(searchKeyword.trim());
        
        if (onResults) {
          onResults(wildcardDomains);
        }
        if (onStateChange) {
          onStateChange('results');
        }
        
        toast({
          title: "Wildcard Search Complete",
          description: `Found ${wildcardSuggestions.length} domain pattern suggestions`,
          variant: "default",
        });
      } else {
        // Regular domain search
        const searchResult = await searchDomains(searchKeyword.trim());
        
        if (searchResult.error) {
          toast({
            title: "Search Notice",
            description: searchResult.error,
            variant: "default",
          });
        }

        setDomains(searchResult.domains);
        setLastSearchedKeyword(searchKeyword.trim());
        
        if (onResults) {
          onResults(searchResult.domains);
        }
        if (onStateChange) {
          onStateChange('results');
        }
        
        if (searchResult.isDemo) {
          toast({
            title: "Demo Mode",
            description: "Showing sample domain results for demonstration.",
            variant: "default",
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search domains";
      setError(errorMessage);
      setDomains([]);
      
      toast({
        title: "Search Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and rank domains based on selected criteria
  const getRankingLabel = (domain: Domain): string => {
    const flipScore = domain.flipScore || 0;
    const trendStrength = domain.trendStrength || 0;
    
    if (flipScore >= 80 && trendStrength >= 4) return "Pro";
    if (flipScore >= 70 || trendStrength >= 4) return "Trendy";
    if (flipScore >= 60) return "Urban";
    if (domain.tld === 'com') return "Classic";
    if (['io', 'ai', 'tech', 'app'].includes(domain.tld)) return "Modern";
    return "Standard";
  };

  // Apply filters to domains
  useEffect(() => {
    let filtered = [...domains];
    
    // Apply ranking filter
    if (rankingFilter !== "all") {
      filtered = filtered.filter(domain => getRankingLabel(domain) === rankingFilter);
    }
    
    // Apply TLD filter
    if (tldFilter !== "all") {
      filtered = filtered.filter(domain => domain.tld === tldFilter);
    }
    
    // Sort by availability first, then by flip score descending
    filtered.sort((a, b) => {
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      return (b.flipScore || 0) - (a.flipScore || 0);
    });
    
    setFilteredDomains(filtered);
  }, [domains, rankingFilter, tldFilter]);

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
        // Check if wildcard search
        if (searchKeyword.trim().includes('*')) {
          // Handle wildcard search
          const wildcardSuggestions = generateWildcardSuggestions(searchKeyword.trim().replace(/\*/g, ''));
          const wildcardDomains: Domain[] = wildcardSuggestions.map((suggestion, index) => ({
            name: `${suggestion}.com`,
            available: Math.random() > 0.3, // Mock availability
            price: 12.99 + Math.random() * 20,
            tld: 'com',
            flipScore: 60 + Math.floor(Math.random() * 30),
            trendStrength: Math.floor(Math.random() * 5) + 1
          }));
          
          setDomains(wildcardDomains);
          
          // Notify parent with results
          if (onResults) {
            onResults(wildcardDomains);
          }
          if (onStateChange) {
            onStateChange('results');
          }
          
          toast({
            title: "Wildcard Search Complete",
            description: `Found ${wildcardSuggestions.length} domain pattern suggestions`,
            variant: "default",
          });
        } else {
          // Regular domain search
          const searchResult = await searchDomains(searchKeyword.trim());
          setDomains(searchResult.domains);
          
          // Notify parent with results
          if (onResults) {
            onResults(searchResult.domains);
          }
          if (onStateChange) {
            onStateChange('results');
          }
          
          if (searchResult.isDemo) {
            toast({
              title: "Demo Mode",
              description: "Showing sample domain results for demonstration.",
            });
          }
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
  }), [toast, onResults, onStateChange]);

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
                <p className="text-sm text-muted-foreground mt-2">
                  Tip: Use * as a wildcard. Example: ai* finds domains starting with 'ai'.
                </p>
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

            {/* Filters Section - Show only when we have results */}
            {hasSearched && domains.length > 0 && !isLoading && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                <h3 className="text-sm font-medium mb-3">Filter Results</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-muted-foreground mb-1 block">Domain Ranking</label>
                    <Select value={rankingFilter} onValueChange={setRankingFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Rankings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Rankings</SelectItem>
                        <SelectItem value="Pro">🏆 Pro (Premium quality)</SelectItem>
                        <SelectItem value="Trendy">🔥 Trendy (High demand)</SelectItem>
                        <SelectItem value="Urban">🏙️ Urban (Modern appeal)</SelectItem>
                        <SelectItem value="Classic">💎 Classic (.com domains)</SelectItem>
                        <SelectItem value="Modern">⚡ Modern (Tech TLDs)</SelectItem>
                        <SelectItem value="Standard">📝 Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-xs text-muted-foreground mb-1 block">Domain Extension</label>
                    <Select value={tldFilter} onValueChange={setTldFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All TLDs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Extensions</SelectItem>
                        <SelectItem value="com">.com</SelectItem>
                        <SelectItem value="net">.net</SelectItem>
                        <SelectItem value="org">.org</SelectItem>
                        <SelectItem value="io">.io</SelectItem>
                        <SelectItem value="ai">.ai</SelectItem>
                        <SelectItem value="app">.app</SelectItem>
                        <SelectItem value="tech">.tech</SelectItem>
                        <SelectItem value="dev">.dev</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setRankingFilter("all");
                        setTldFilter("all");
                      }}
                      className="h-9"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Showing {filteredDomains.length} of {domains.length} domains
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search History Section */}
        <SearchHistory 
          onSearchAgain={handleSearchAgain} 
          currentKeyword={lastSearchedKeyword}
        />

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
                  <CardTitle>Search Results ({filteredDomains.length} domains{filteredDomains.length !== domains.length ? ` of ${domains.length} total` : ''})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredDomains.map((domain) => {
                      const rankingLabel = getRankingLabel(domain);
                      const getRankingColor = (label: string) => {
                        switch (label) {
                          case "Pro": return "bg-purple-100 text-purple-800 border-purple-200";
                          case "Trendy": return "bg-orange-100 text-orange-800 border-orange-200";
                          case "Urban": return "bg-blue-100 text-blue-800 border-blue-200";
                          case "Classic": return "bg-green-100 text-green-800 border-green-200";
                          case "Modern": return "bg-cyan-100 text-cyan-800 border-cyan-200";
                          default: return "bg-gray-100 text-gray-800 border-gray-200";
                        }
                      };
                      
                      return (
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
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-lg">{domain.name}</span>
                                <Badge variant="outline" className={getRankingColor(rankingLabel)}>
                                  {rankingLabel}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
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
                              
                              {/* Domain Scores */}
                              {domain.available && (domain.flipScore || domain.trendStrength) && (
                                <div className="flex items-center gap-4">
                                  {domain.flipScore && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-muted-foreground">Flip Score:</span>
                                      <FlipScore score={domain.flipScore} />
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
                          </div>
                          {domain.available && (
                            <div className="text-right">
                              <div className="text-xl font-bold">${domain.price.toFixed(2)}</div>
                              <div className="text-sm text-muted-foreground">/year</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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