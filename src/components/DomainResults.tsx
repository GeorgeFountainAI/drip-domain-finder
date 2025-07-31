import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShoppingCart, Check, Globe, ArrowLeft, Star, TrendingUp, ExternalLink } from "lucide-react";
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
}

export const DomainResults = ({ domains, onAddToCart, onBack, isLoading }: DomainResultsProps) => {
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBuyNow = (domainName: string) => {
    const url = `https://www.spaceship.com/search?query=${domainName}&aff=MY_AFFILIATE_ID`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading domain results...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Search
        </Button>
      </div>

      {domains.map((domain) => (
        <Card
          key={domain.name}
          className="flex items-center justify-between p-4 mb-3 border rounded-lg shadow-sm"
        >
          {/* Domain Info */}
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedDomains.has(domain.name)}
              onCheckedChange={(checked) => {
                const newSet = new Set(selectedDomains);
                if (checked) newSet.add(domain.name);
                else newSet.delete(domain.name);
                setSelectedDomains(newSet);
              }}
            />
            <Globe className="text-primary h-5 w-5" />
            <span className="font-semibold text-lg">{domain.name}</span>
            <Badge variant="secondary" className="ml-2">
              {domain.available ? "Available" : "Unavailable"}
            </Badge>
          </div>

          {/* Price & BUY NOW BUTTON */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xl font-bold">${domain.price.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">per year</p>
            </div>

            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                handleBuyNow(domain.name);
              }}
            >
              Buy Now
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
