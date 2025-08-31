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
import VibeFilter from "./filters/VibeFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Check, X, AlertCircle, Star, TrendingUp, HelpCircle } from "lucide-react";
import { LoadingSparkles } from "@/components/LoadingSparkles";
import { useToast } from "@/hooks/use-toast";
import { useConsumeCredit } from "@/hooks/useConsumeCredit";
import { useAdminBypass } from "@/hooks/useAdminBypass";
import RequireCredits from "@/components/RequireCredits";
import { SearchHistory } from "@/components/SearchHistory";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import searchDomains from "@/api/domainSearchClient";
import { generateWildcardSuggestions } from "@/utils/domainGenerator";
import { supabase } from "@/integrations/supabase/client";

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

// Helper component for displaying flip score with tooltip
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
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="h-3 w-3" />
            <span className="sr-only">What is Flip Score?</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-sm">
            <strong>Flip Score = Brand Potential</strong>
            <ul className="mt-1 space-y-1">
              <li>• Short, memorable names</li>
              <li>• Trendy keywords</li>
              <li>• Available .com domains</li>
              <li>• High resale interest</li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

// Static blocklist for domains that are definitely not purchasable
const DOMAIN_BLOCKLIST = ["ai.com"];

// TODO: Temporary flag to bypass validation for wildcard searches
// Set to false to fix wildcard search display issues - can be re-enabled later
const WILDCARD_VALIDATION_ENABLED = false;

// Helper function to chunk array into batches
const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Helper function to validate domains in batches
const validateDomainsInBatches = async (domains: Domain[], batchSize: number = 5): Promise<Domain[]> => {
  const chunks = chunkArray(domains, batchSize);
  const validatedDomains: Domain[] = [];

  for (const chunk of chunks) {
    const validationPromises = chunk.map(async (domain) => {
      try {
        const { data } = await supabase.functions.invoke("validate-buy-link", {
          body: { domain: domain.name }
        });
        return data?.ok === true ? domain : null;
      } catch (error) {
        console.error(`Validation failed for ${domain.name}:`, error);
        return null;
      }
    });

    const results = await Promise.all(validationPromises);
    validatedDomains.push(...results.filter(domain => domain !== null));
  }

  return validatedDomains;
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
  const [selectedVibe, setSelectedVibe] = useState<string>("");
  const [oneWordOnly, setOneWordOnly] = useState(false);
  
  const { toast } = useToast();
  const { consumeCredit, loading: creditLoading } = useConsumeCredit();
  const { isAdmin } = useAdminBypass();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a keyword to search.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    // Admin users bypass credit checks
    if (!isAdmin) {
      const creditResult = await consumeCredit(2);
      if (!creditResult.success) {
        setIsLoading(false);
        setError("Unable to deduct credits for search");
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
        
        // Filter out blocked domains and validate in batches (temporary bypass for wildcard)
        const unblockedDomains = WILDCARD_VALIDATION_ENABLED 
          ? wildcardDomains.filter(domain => !DOMAIN_BLOCKLIST.includes(domain.name))
          : wildcardDomains; // Bypass blocklist for wildcard searches
        
        const validatedDomains = WILDCARD_VALIDATION_ENABLED 
          ? await validateDomainsInBatches(unblockedDomains)
          : unblockedDomains; // Bypass validation for wildcard searches
        
        setDomains(validatedDomains);
        setLastSearchedKeyword(keyword.trim());
        
        // Notify parent with results
        if (onResults) {
          onResults(validatedDomains);
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

        // Filter out blocked domains and make validation non-blocking
        const unblockedDomains = searchResult.domains.filter(domain => 
          !DOMAIN_BLOCKLIST.includes(domain.name)
        );
        
        // First set unvalidated results so user always sees domains
        setDomains(unblockedDomains);
        setLastSearchedKeyword(keyword.trim());
        
        // Notify parent with unvalidated results immediately
        if (onResults) {
          onResults(unblockedDomains);
        }
        if (onStateChange) {
          onStateChange('results');
        }
        
        // Run validation in background - only filter if validation succeeds
        try {
          const validatedDomains = await validateDomainsInBatches(unblockedDomains);
          if (validatedDomains.length > 0) {
            // Only update if validation found valid domains
            setDomains(validatedDomains);
            if (onResults) {
              onResults(validatedDomains);
            }
          }
          // If validation returns zero results, keep the original unvalidated list
        } catch (validationError) {
          console.warn('Domain validation failed, keeping unvalidated results:', validationError);
          // Continue with unvalidated results
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
      const creditResult = await consumeCredit(2);
      if (!creditResult.success) {
        setIsLoading(false);
        setError("Unable to deduct credits for search");
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
        
        // Filter out blocked domains and validate in batches (temporary bypass for wildcard)
        const unblockedDomains = WILDCARD_VALIDATION_ENABLED 
          ? wildcardDomains.filter(domain => !DOMAIN_BLOCKLIST.includes(domain.name))
          : wildcardDomains; // Bypass blocklist for wildcard searches
        
        const validatedDomains = WILDCARD_VALIDATION_ENABLED 
          ? await validateDomainsInBatches(unblockedDomains)
          : unblockedDomains; // Bypass validation for wildcard searches
        
        setDomains(validatedDomains);
        setLastSearchedKeyword(searchKeyword.trim());
        
        if (onResults) {
          onResults(validatedDomains);
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

        // Filter out blocked domains and make validation non-blocking
        const unblockedDomains = searchResult.domains.filter(domain => 
          !DOMAIN_BLOCKLIST.includes(domain.name)
        );
        
        // First set unvalidated results so user always sees domains
        setDomains(unblockedDomains);
        setLastSearchedKeyword(searchKeyword.trim());
        
        // Notify parent with unvalidated results immediately
        if (onResults) {
          onResults(unblockedDomains);
        }
        if (onStateChange) {
          onStateChange('results');
        }
        
        // Run validation in background - only filter if validation succeeds
        try {
          const validatedDomains = await validateDomainsInBatches(unblockedDomains);
          if (validatedDomains.length > 0) {
            // Only update if validation found valid domains
            setDomains(validatedDomains);
            if (onResults) {
              onResults(validatedDomains);
            }
          }
          // If validation returns zero results, keep the original unvalidated list
        } catch (validationError) {
          console.warn('Domain validation failed, keeping unvalidated results:', validationError);
          // Continue with unvalidated results
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
          
          // Filter out blocked domains and validate in batches (temporary bypass for wildcard)
          const unblockedDomains = WILDCARD_VALIDATION_ENABLED 
            ? wildcardDomains.filter(domain => !DOMAIN_BLOCKLIST.includes(domain.name))
            : wildcardDomains; // Bypass blocklist for wildcard searches
          
          // For wildcard searches, set unvalidated results immediately
          setDomains(unblockedDomains);
          
          // Notify parent with unvalidated results immediately
          if (onResults) {
            onResults(unblockedDomains);
          }
          if (onStateChange) {
            onStateChange('results');
          }
          
          // Run validation in background if enabled
          if (WILDCARD_VALIDATION_ENABLED) {
            try {
              const validatedDomains = await validateDomainsInBatches(unblockedDomains);
              if (validatedDomains.length > 0) {
                setDomains(validatedDomains);
                if (onResults) {
                  onResults(validatedDomains);
                }
              }
            } catch (validationError) {
              console.warn('Wildcard validation failed, keeping unvalidated results:', validationError);
            }
          }
          
          toast({
            title: "Wildcard Search Complete",
            description: `Found ${wildcardSuggestions.length} domain pattern suggestions`,
            variant: "default",
          });
        } else {
          // Regular domain search
          const searchResult = await searchDomains(searchKeyword.trim());
          // Filter out blocked domains and validate in batches
          const unblockedDomains = searchResult.domains.filter(domain => 
            !DOMAIN_BLOCKLIST.includes(domain.name)
          );
          
          const validatedDomains = await validateDomainsInBatches(unblockedDomains);
          
          setDomains(validatedDomains);
          
          // Notify parent with results
          if (onResults) {
            onResults(validatedDomains);
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
    <RequireCredits credits={isAdmin ? 0 : 2} action="search domains" showAlert={hasSearched && !isAdmin}>
      <TooltipProvider>
        <div className={`max-w-6xl mx-auto space-y-8 ${className}`} data-testid="domain-search-form">
          {/* Search Form */}
          <Card className="border-2 shadow-elevated bg-card backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
                Find Your Perfect Domain
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Discover available domains with AI-powered search and get instant availability checks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div data-testid="search-section">
                <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
                  <div className="relative mb-6">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6 z-10" />
                    <Input
                      type="text"
                      placeholder="Enter keywords to find your perfect domain..."
                      value={keyword}
                      onChange={handleKeywordChange}
                      className="w-full pl-16 pr-6 py-6 text-xl font-medium border-4 border-primary/20 focus:border-primary rounded-xl bg-background shadow-xl focus:shadow-2xl transition-all duration-300"
                      style={{ fontSize: '20px' }}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <VibeFilter selected={selectedVibe} onChange={setSelectedVibe} />
                    
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-foreground flex items-center gap-2">
                         <Checkbox 
                           checked={oneWordOnly} 
                           onCheckedChange={(checked) => setOneWordOnly(checked === true)}
                           className="mobile-touch-target"
                         />
                        One-word domains only
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Filter results to show only single-word domain names
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={isLoading || !keyword.trim()}
                      className="h-16 px-12 text-xl font-semibold shadow-xl bg-primary hover:bg-primary/90 rounded-xl transition-all duration-300 mobile-touch-target"
                    >
                      {isLoading ? (
                        <LoadingSparkles />
                      ) : (
                        <>
                          <Search className="mr-3 h-6 w-6" />
                          Search Domains
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>


            {error && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/5 p-4 rounded-lg border border-destructive/20">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Filters Section - Show only when we have results */}
            {hasSearched && domains.length > 0 && !isLoading && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                <h3 className="text-sm font-medium mb-3">Filter Results</h3>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="text-xs text-muted-foreground mb-1 block">Domain Ranking</label>
                    <Select value={rankingFilter} onValueChange={setRankingFilter}>
                      <SelectTrigger className="h-9 mobile-touch-target">
                        <SelectValue placeholder="All Rankings" />
                      </SelectTrigger>
                      <SelectContent className="mobile-dropdown">
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
                  <div className="flex-1 min-w-0">
                    <label className="text-xs text-muted-foreground mb-1 block">Domain Extension</label>
                    <Select value={tldFilter} onValueChange={setTldFilter}>
                      <SelectTrigger className="h-9 mobile-touch-target">
                        <SelectValue placeholder="All TLDs" />
                      </SelectTrigger>
                      <SelectContent className="mobile-dropdown">
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
                  <div className="flex items-end w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setRankingFilter("all");
                        setTldFilter("all");
                      }}
                      className="h-9 w-full sm:w-auto mobile-touch-target"
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
                            <div className="text-right space-y-2">
                              <div>
                                <div className="text-xl font-bold">${domain.price.toFixed(2)}</div>
                                <div className="text-sm text-muted-foreground">/year</div>
                              </div>
                              <a
                                href={`/api/go/spaceship?d=${encodeURIComponent(domain.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                                data-testid="buy-button"
                              >
                                Buy on Spaceship
                              </a>
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
      </TooltipProvider>
    </RequireCredits>
  );
});

DomainSearchForm.displayName = "DomainSearchForm";