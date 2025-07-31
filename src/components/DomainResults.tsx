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
        className={`h-3 w-3 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground"}`}
      />
    ))}
  </div>
);

const FlipScore = ({ score, domainName }: { score: number; domainName: string }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return "Excellent flip potential";
    if (score >= 60) return "Good flip potential";
    return "Moderate flip potential";
  };

  const domainLength = domainName.split(".")[0].length;
  const tld = domainName.split(".")[1];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span className={`text-xs font-medium ${getScoreColor(score)}`}>{score}/100</span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold">{getScoreDescription(score)}</p>
          <p className="text-xs">Domain length: {domainLength} characters</p>
          <p className="text-xs">TLD: .{tld}</p>
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

  const handleBuyNow = (domainName: string) => {
    const url = `https://www.spaceship.com/search?query=${domainName}&aff=MY_AFFILIATE_ID`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking domain availability...</p>
      </div>
    );
  }

  const availableDomains = domains.filter((d) => d.available);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>

        <div className="space-y-4">
          {availableDomains.map((domain) => (
            <Card key={domain.name} className="flex flex-col sm:flex-row justify-between p-6 rounded-xl shadow-sm">
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
                <span className="font-bold text-lg">{domain.name}</span>
                <Badge variant="secondary">Available</Badge>
              </div>

              {/* Price + Buy Now button */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">${domain.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">per year</p>
                </div>
                <Button
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyNow(domain.name);
                  }}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold"
                >
                  Buy Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
