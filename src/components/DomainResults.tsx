import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, ExternalLink, ThumbsUp, ThumbsDown, ShoppingCart, ChevronDown, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { buildSpaceshipUrl, openInBatches } from "@/utils/spaceship";

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
  query?: string;
  onSearchAgain?: (keyword: string) => void;
}

interface SearchHistoryItem {
  id: string;
  keyword: string;
  created_at: string;
}

type FeedbackType = 'like' | 'dislike' | null;
type SortOption = 'rank' | 'price' | 'name';

export const DomainResults: React.FC<DomainResultsProps> = ({
  domains,
  onAddToCart,
  onBack,
  isLoading,
  query,
  onSearchAgain,
}) => {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Record<string, FeedbackType>>({});
  const [sortBy, setSortBy] = useState<SortOption>('rank');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);

  const handleBuyNow = (domainName: string, isAvailable: boolean) => {
    if (!isAvailable) {
      console.log(`❌ Cannot buy ${domainName} - domain is not available`);
      return;
    }
    
    console.log(`🛒 Buying ${domainName} via affiliate link`);
    if (import.meta.env.DEV) console.log('BUY URL:', buildSpaceshipUrl(domainName));
    const affiliateUrl = buildSpaceshipUrl(domainName);
    window.open(affiliateUrl, "_blank", "noopener");
  };

  const handleDomainSelection = (domainName: string, checked: boolean) => {
    if (checked) {
      setSelectedDomains(prev => [...prev, domainName]);
    } else {
      setSelectedDomains(prev => prev.filter(name => name !== domainName));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select available domains
      setSelectedDomains(sortedDomains.filter(domain => domain.available).map(domain => domain.name));
    } else {
      setSelectedDomains([]);
    }
  };

  // Save feedback to Supabase
  const saveFeedbackToSupabase = async (domainName: string, feedbackType: 'like' | 'dislike') => {
    try {
      const { error } = await supabase
        .from('feedback')
        .upsert({
          domain_name: domainName,
          user_id: user?.id || null,
          feedback_type: feedbackType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log("✅ Feedback saved");
    } catch (error) {
      console.error("❌ Supabase error", error);
    }
  };

  const handleFeedback = (domainName: string, feedbackType: FeedbackType) => {
    setFeedback(prev => ({
      ...prev,
      [domainName]: prev[domainName] === feedbackType ? null : feedbackType
    }));
    
    if (feedbackType === 'like') {
      console.log(`👍 Liked ${domainName}`);
      saveFeedbackToSupabase(domainName, 'like');
    } else if (feedbackType === 'dislike') {
      console.log(`👎 Disliked ${domainName}`);
      saveFeedbackToSupabase(domainName, 'dislike');
    }
  };

  const handleBuySelected = () => {
    if (debounceTimeout) return; // Prevent double-clicks
    
    console.log(`🛒 Bulk buying domains: ${selectedDomains.join(', ')}`);
    
    // Debounce for 300ms
    const timeout = window.setTimeout(() => {
      setDebounceTimeout(null);
    }, 300);
    setDebounceTimeout(timeout);
    
    // Use openInBatches utility
    openInBatches(selectedDomains, 5, 300, (url) => {
      const newWindow = window.open(url, '_blank', 'noopener');
      if (!newWindow) {
        setPopupBlocked(true);
        setTimeout(() => setPopupBlocked(false), 5000);
      }
    });
    
    // Clear selection after purchase
    setSelectedDomains([]);
  };

  const handleCopySelected = async () => {
    if (selectedDomains.length === 0) return;
    
    try {
      await navigator.clipboard.writeText(selectedDomains.join('\n'));
      // Show toast or simple feedback
      console.log(`Copied ${selectedDomains.length} domains`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadCSV = () => {
    if (selectedDomains.length === 0) return;
    
    const csvContent = 'domain\n' + selectedDomains.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'domains.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    console.log('📊 Sort changed to:', value);
  };

  // Save search to history
  const saveSearchToHistory = async (searchQuery: string) => {
    if (!searchQuery?.trim()) return;
    
    try {
      const { error } = await supabase
        .from('search_history')
        .insert({
          keyword: searchQuery,
          user_id: user?.id || null,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error("❌ Supabase error", error);
    }
  };

  // Load search history
  const loadSearchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('id, keyword, created_at')
        .eq('user_id', user?.id || null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSearchHistory(data || []);
    } catch (error) {
      console.error("❌ Supabase error", error);
      setSearchHistory([]);
    }
  };

  const handleSearchAgain = (keyword: string) => {
    if (onSearchAgain) {
      onSearchAgain(keyword);
    }
  };

  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Effects
  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Save search to history when component renders with a query
    if (query && !isLoading) {
      saveSearchToHistory(query);
    }
  }, [query, isLoading, user]);

  useEffect(() => {
    // Load search history when user changes
    if (user !== null) { // Check for both logged in and anonymous users
      loadSearchHistory();
    }
  }, [user]);

  // Normalize flip score to 1-10 scale
  const normalizeFlipScore = (rawScore: number): number => {
    if (rawScore <= 10) return rawScore; // Already on 1-10 scale
    return Math.round(rawScore / 10); // Normalize from 1-100 to 1-10
  };

  // Get availability status badge
  const getAvailabilityBadge = (domain: Domain) => {
    if (domain.available) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        text: "Available",
        className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
        tooltip: "This domain is available for registration"
      };
    } else {
      return {
        icon: <XCircle className="h-4 w-4" />,
        text: "Taken",
        className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
        tooltip: "This domain is already registered"
      };
    }
  };

  // Get flip score badge properties - only for available domains
  const getFlipScoreBadge = (domain: Domain) => {
    if (!domain.available || !domain.flipScore) return null;
    
    const normalizedScore = normalizeFlipScore(domain.flipScore);
    
    if (normalizedScore >= 1 && normalizedScore <= 3) {
      return {
        score: normalizedScore,
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        tooltip: "🚫 Poor Flip Value"
      };
    } else if (normalizedScore >= 4 && normalizedScore <= 6) {
      return {
        score: normalizedScore,
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-300",
        tooltip: "⚠️ Low to Moderate"
      };
    } else if (normalizedScore >= 7 && normalizedScore <= 8) {
      return {
        score: normalizedScore,
        className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
        tooltip: "✅ Solid Value"
      };
    } else if (normalizedScore >= 9 && normalizedScore <= 10) {
      return {
        score: normalizedScore,
        className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
        tooltip: "🔥 High Flip Potential"
      };
    }
    
    return null;
  };

  const getRankingScore = (domain: Domain) => {
    return domain.flipScore || domain.trendStrength || Math.floor(Math.random() * 10) + 1;
  };

  // Memoized sorted domains
  const sortedDomains = useMemo(() => {
    if (!domains) return [];
    
    const sorted = [...domains].sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          const rankA = getRankingScore(a);
          const rankB = getRankingScore(b);
          return rankB - rankA; // Highest to lowest
        case 'price':
          return a.price - b.price; // Low to high
        case 'name':
          return a.name.localeCompare(b.name); // A-Z
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [domains, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-40 mb-6" />
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-10 w-24" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  console.log('🚀 DomainResults rendering with', domains?.length, 'domains');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="outline"
          onClick={onBack}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Button>
        
        {/* Header with Sort and Select All */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Domain Results ({sortedDomains?.length || 0} found)
          </h1>
          
          <div className="flex items-center gap-4">
            {/* Sorting Dropdown */}
            {sortedDomains && sortedDomains.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">Sort by:</label>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border z-50">
                    <SelectItem value="rank">Rank (High to Low)</SelectItem>
                    <SelectItem value="price">Price (Low to High)</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Select All Available */}
            {sortedDomains && sortedDomains.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedDomains.length === sortedDomains.filter(domain => domain.available).length && sortedDomains.filter(domain => domain.available).length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Select All Available
                </label>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Searches */}
        {searchHistory && searchHistory.length > 0 && (
          <div className="mb-6">
            <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  🔍 Recent Searches ({searchHistory.length})
                  <ChevronDown className={`h-4 w-4 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <Card className="p-4">
                  <div className="space-y-2">
                    {searchHistory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <Button
                          variant="ghost"
                          className="flex-1 justify-start text-left h-auto p-2"
                          onClick={() => handleSearchAgain(item.keyword)}
                        >
                          <span className="font-medium">{item.keyword}</span>
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
        
        {/* Results Grid */}
        {sortedDomains && sortedDomains.length > 0 ? (
          <>
            <TooltipProvider>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {sortedDomains.map((domain) => {
                  const domainFeedback = feedback[domain.name];
                  const isSelected = selectedDomains.includes(domain.name);
                  const rankingScore = getRankingScore(domain);
                  const flipScoreBadge = getFlipScoreBadge(domain);
                  
                  return (
                    <Card 
                      key={domain.name}
                      className={`group transition-all duration-300 border-border ${
                        !domain.available 
                          ? 'opacity-50 grayscale cursor-not-allowed' 
                          : 'hover:shadow-lg hover:scale-105'
                      } ${
                        isSelected ? 'ring-2 ring-primary bg-muted/50' : ''
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Selection Checkbox - Only for available domains */}
                          <div className="flex items-start justify-between">
                            <Checkbox
                              id={`select-${domain.name}`}
                              checked={isSelected}
                              disabled={!domain.available}
                              onCheckedChange={(checked) => domain.available && handleDomainSelection(domain.name, checked as boolean)}
                            />
                          </div>
                          
                          {/* Domain Name & Badges */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                {domain.name}
                              </h3>
                              {flipScoreBadge ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge className={`text-xs cursor-help ${flipScoreBadge.className}`}>
                                      Flip Score: {flipScoreBadge.score}/10
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{flipScoreBadge.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Rank: {rankingScore}/10
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Availability & Price */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const availabilityBadge = getAvailabilityBadge(domain);
                                return (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge className={`${availabilityBadge.className} flex items-center gap-1`}>
                                        {availabilityBadge.icon}
                                        {availabilityBadge.text}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{availabilityBadge.tooltip}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })()}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ${domain.price.toFixed(2)}/year
                            </p>
                          </div>
                          
                          {/* Feedback Buttons */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(domain.name, 'like')}
                              className={`p-2 h-8 w-8 ${
                                domainFeedback === 'like' 
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                  : 'text-muted-foreground hover:text-green-600'
                              }`}
                            >
                              <ThumbsUp className="h-4 w-4" fill={domainFeedback === 'like' ? 'currentColor' : 'none'} />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(domain.name, 'dislike')}
                              className={`p-2 h-8 w-8 ${
                                domainFeedback === 'dislike' 
                                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                  : 'text-muted-foreground hover:text-red-600'
                              }`}
                            >
                              <ThumbsDown className="h-4 w-4" fill={domainFeedback === 'dislike' ? 'currentColor' : 'none'} />
                            </Button>
                          </div>
                          
                          {/* Buy Button - Only for available domains */}
                          <Button
                            onClick={() => handleBuyNow(domain.name, domain.available)}
                            disabled={!domain.available}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg transition-all duration-200 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            size="lg"
                          >
                            {domain.available ? 'BUY NOW' : 'UNAVAILABLE'}
                            {domain.available && <ExternalLink className="h-4 w-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TooltipProvider>
            
            {/* Sticky Footer with Bulk Actions */}
            {selectedDomains.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50">
                {popupBlocked && (
                  <div className="bg-orange-100 text-orange-800 text-sm p-2 text-center">
                    Pop-ups blocked. Allow pop-ups or use Copy/CSV.
                  </div>
                )}
                <div className="max-w-6xl mx-auto p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      {selectedDomains.length} domain(s) selected
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleBuySelected}
                        disabled={debounceTimeout !== null}
                        aria-disabled={debounceTimeout !== null}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Buy Selected on Spaceship
                      </Button>
                      <Button
                        onClick={handleCopySelected}
                        variant="outline"
                        disabled={selectedDomains.length === 0}
                        aria-disabled={selectedDomains.length === 0}
                      >
                        Copy Selected
                      </Button>
                      <Button
                        onClick={handleDownloadCSV}
                        variant="outline"
                        disabled={selectedDomains.length === 0}
                        aria-disabled={selectedDomains.length === 0}
                      >
                        Download CSV
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-destructive">No domains to display</p>
          </div>
        )}
      </div>
    </div>
  );
};
