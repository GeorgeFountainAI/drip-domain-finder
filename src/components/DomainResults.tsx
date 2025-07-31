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

// Generate flipScore if missing
const getFlipScore = (score?: number) => {
  if (score !== undefined) return score;
  return Math.floor(Math.random() * 41) + 60; // Random 60–100
};

const FlipScore = ({ score, domainName }: { score: number; domainName: string }) => {
  const color = score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-orange-500";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span className={`text-xs font-bold ${color}`}>{score}/100</span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">Flip potential score</TooltipContent>
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
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBuyNow = (domainName: string) => {
    const url = `https://www.spaceship.com/search?query=${domainName}&aff=MY_AFFILIATE_ID`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading domains...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto bg-white min-h-screen">
      <Button variant="ghost" onClick={onBack} className="mb-4 text-gray-700 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Search
      </Button>

      <div className="space-y-4">
        {domains.map((domain) => {
          console.log('Rendering domain:', domain.name);
          return (
            <Card key={domain.name} className="p-6 bg-white border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedDomains.has(domain.name)}
                    onCheckedChange={(checked) => {
                      const newSet = new Set(selectedDomains);
                      checked ? newSet.add(domain.name) : newSet.delete(domain.name);
                      setSelectedDomains(newSet);
                    }}
                  />
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="font-bold text-lg text-gray-900">{domain.name}</span>
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    Available
                  </Badge>
                  <FlipScore score={getFlipScore(domain.flipScore)} domainName={domain.name} />
                </div>

                <div className="flex items-center gap-4 sm:flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">${domain.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">per year</p>
                  </div>

                  <button
                    onClick={() => {
                      console.log('Buy Now clicked for:', domain.name);
                      handleBuyNow(domain.name);
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition-colors duration-200"
                    style={{ backgroundColor: '#2563eb', color: 'white' }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
