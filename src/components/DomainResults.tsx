import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink } from "lucide-react";

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

export const DomainResults: React.FC<DomainResultsProps> = ({
  domains,
  onBack,
  isLoading,
}) => {
  const handleBuyNow = (domainName: string) => {
    console.log('🎯 BUY NOW CLICKED:', domainName);
    window.open(`https://www.spaceship.com/search?query=${domainName}`, "_blank");
  };

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
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Domain Results ({domains?.length || 0} found)
        </h1>
        
        {/* Results Grid */}
        {domains && domains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => (
              <Card 
                key={domain.name}
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-border"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Domain Name */}
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {domain.name}
                    </h3>
                    
                    {/* Availability & Price */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        ✓ Available
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${domain.price.toFixed(2)}/year
                      </p>
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
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-destructive">No domains to display</p>
          </div>
        )}
      </div>
    </div>
  );
};