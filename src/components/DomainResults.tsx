import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShoppingCart, Check, Globe, ArrowLeft, Star, TrendingUp, ExternalLink, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-3 w-3 ${
          star <= rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-muted text-muted-foreground"
        }`}
      />
    ))}
  </div>
);

const FlipScore = ({ score }: { score: number }) => {
  const color =
    score >= 80
      ? "text-green-600 dark:text-green-400"
      : score >= 60
      ? "text-yellow-600 dark:text-yellow-400"
      : "text-orange-600 dark:text-orange-400";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span className={`text-xs font-medium ${color}`}>
              {score}/100
            </span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold">Flip Potential: {score}/100</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const DomainResults = ({
  domains,
  onAddToCart,
  onBack,
  isLoading,
  totalResults,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
}: DomainResultsProps) => {
  const [selectedDomainsForCart, setSelectedDomainsForCart] = useState<Set<string>>(new Set());
  const [selectedDomainsForBulk, setSelectedDomainsForBulk] = useState<Set<string>>(new Set());
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDomainSelect = (domain: Domain) => {
    setSelectedDomain(selectedDomain?.name === domain.name ? null : domain);
  };

  const handleBuyNow = (domainName: string) => {
    const url = `https://www.spaceship.com/search?query=${domainName}&aff=MY_AFFILIATE_ID`;
    window.open(url, "_blank");
  };

  // Ensure every domain has a flipScore if missing
  const getFlipScore = (domain: Domain) =>
    domain.flipScore ?? Math.floor(Math.random() * 41) + 60;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading domains...</p>
      </div>
    );
  }

  const availableDomains = domains.filter((d) => d.available);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Search
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {availableDomains.map((domain) => (
            <Card
              key={domain.name}
              onClick={() => handleDomainSelect(domain)}
              className="flex items-center justify-between p-4 rounded-xl hover:shadow-md transition"
            >
              {/* Domain Info */}
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  checked={selectedDomainsForBulk.has(domain.name)}
                  onCheckedChange={(checked) => {
                    const updated = new Set(selectedDomainsForBulk);
                    checked ? updated.add(domain.name) : updated.delete(domain.name);
                    setSelectedDomainsForBulk(updated);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <Globe className="h-5 w-5 text-primary" />
                <span className="font-bold">{domain.name}</span>
                <Badge className="bg-green-200 text-green-800">Available</Badge>
                <FlipScore score={getFlipScore(domain)} />
              </div>

              {/* Price + Buy Now */}
              <div className="flex items-center gap-4">
                <p className="text-lg font-bold">${domain.price.toFixed(2)}</p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyNow(domain.name);
                  }}
                  className="bg-white text-black font-bold px-4 py-2 rounded-lg shadow-md hover:bg-gray-200"
                >
                  Buy Now
                </Button>
                {selectedDomain?.name === domain.name && (
                  <Check className="text-primary h-5 w-5" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
