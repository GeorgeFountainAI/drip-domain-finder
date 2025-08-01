import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ExternalLink, ThumbsUp, ThumbsDown, ShoppingCart } from "lucide-react";

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

type FeedbackType = 'like' | 'dislike' | null;
type SortOption = 'rank' | 'price' | 'name';

export const DomainResults: React.FC<DomainResultsProps> = ({
  domains,
  onAddToCart,
  onBack,
  isLoading,
}) => {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Record<string, FeedbackType>>({});
  const [sortBy, setSortBy] = useState<SortOption>('rank');

  // Impact deep link base URL
  const IMPACT_DEEP_LINK_BASE = "https://spaceship.sjv.io/c/6354443/2873271/21274?u=";

  const buildAffiliateUrl = (domainName: string) => {
    const landingPage = `https://www.spaceship.com/domain/search?query=${domainName}`;
    return `${IMPACT_DEEP_LINK_BASE}${encodeURIComponent(landingPage)}`;
  };

  const handleBuyNow = (domainName: string) => {
    console.log(`🛒 Buying ${domainName} via affiliate link`);
    const affiliateUrl = buildAffiliateUrl(domainName);
    window.open(affiliateUrl, "_blank");
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
      setSelectedDomains(sortedDomains.map(domain => domain.name));
    } else {
      setSelectedDomains([]);
    }
  };

  const handleFeedback = (domainName: string, feedbackType: FeedbackType) => {
    setFeedback(prev => ({
      ...prev,
      [domainName]: prev[domainName] === feedbackType ? null : feedbackType
    }));
    
    if (feedbackType === 'like') {
      console.log(`👍 Liked ${domainName}`);
    } else if (feedbackType === 'dislike') {
      console.log(`👎 Disliked ${domainName}`);
    }
  };

  const handleBuySelected = () => {
    console.log(`🛒 Bulk buying domains: ${selectedDomains.join(', ')}`);
    
    // Open a new tab for each selected domain using the Impact deep link format
    selectedDomains.forEach((domainName, index) => {
      setTimeout(() => {
        const affiliateUrl = buildAffiliateUrl(domainName);
        window.open(affiliateUrl, "_blank");
      }, index * 500); // Stagger the tab openings by 500ms to avoid browser blocking
    });
    
    // Clear selection after purchase
    setSelectedDomains([]);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    console.log('📊 Sort changed to:', value);
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
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="rank">Rank (High to Low)</SelectItem>
                    <SelectItem value="price">Price (Low to High)</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Select All */}
            {sortedDomains && sortedDomains.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedDomains.length === sortedDomains.length}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Select All
                </label>
              </div>
            )}
          </div>
        </div>
        
        {/* Results Grid */}
        {sortedDomains && sortedDomains.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {sortedDomains.map((domain) => {
                const domainFeedback = feedback[domain.name];
                const isSelected = selectedDomains.includes(domain.name);
                const rankingScore = getRankingScore(domain);
                
                return (
                  <Card 
                    key={domain.name}
                    className={`group hover:shadow-lg transition-all duration-300 hover:scale-105 border-border ${
                      isSelected ? 'ring-2 ring-primary bg-muted/50' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Selection Checkbox */}
                        <div className="flex items-start justify-between">
                          <Checkbox
                            id={`select-${domain.name}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => handleDomainSelection(domain.name, checked as boolean)}
                          />
                        </div>
                        
                        {/* Domain Name & Ranking */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                              {domain.name}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {domain.flipScore ? `Flip Score: ${rankingScore}` : `Rank: ${rankingScore}/10`}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Availability & Price */}
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            ✓ Available
                          </p>
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
                                ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-400' 
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
                                ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-400' 
                                : 'text-muted-foreground hover:text-red-600'
                            }`}
                          >
                            <ThumbsDown className="h-4 w-4" fill={domainFeedback === 'dislike' ? 'currentColor' : 'none'} />
                          </Button>
                        </div>
                        
                        {/* Buy Button */}
                        <Button
                          onClick={() => handleBuyNow(domain.name)}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200 gap-2"
                          size="lg"
                        >
                          BUY NOW
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Buy Selected Domains Button */}
            {selectedDomains.length > 0 && (
              <div className="fixed bottom-6 right-6 z-50">
                <Button
                  onClick={handleBuySelected}
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Buy Selected Domains ({selectedDomains.length})
                </Button>
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
