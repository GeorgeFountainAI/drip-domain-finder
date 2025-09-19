import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Wand2, TrendingUp, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConsumeCreditRPC } from '@/hooks/useConsumeCreditRPC';
import { useGetCreditBalance } from '@/hooks/useGetCreditBalance';
import { useAdminBypass } from "@/hooks/useAdminBypass";
import { APP_CONFIG } from '@/lib/constants';
import { generateWildcardSuggestions } from "@/utils/domainGenerator";

interface WildcardExplorerProps {
  className?: string;
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

const WildcardExplorer = ({ className = "" }: WildcardExplorerProps) => {
  const [pattern, setPattern] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { toast } = useToast();
  const { consumeCredits, loading: consumingCredit } = useConsumeCreditRPC();
  const { credits, loading: creditsLoading } = useGetCreditBalance();
  const { isAdmin } = useAdminBypass();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pattern.trim()) {
      toast({
        title: "Invalid Pattern",
        description: "Please enter a wildcard pattern (e.g., *ai.com, crypto*, web*app)",
        variant: "destructive",
      });
      return;
    }

    // Check if pattern contains wildcard
    if (!pattern.includes('*')) {
      toast({
        title: "Invalid Pattern",
        description: "Pattern must contain a wildcard (*). Try patterns like *ai.com or crypto*",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    // Check credits and consume if not admin
    if (!isAdmin) {
      if (credits < APP_CONFIG.CREDITS_PER_WILDCARD) {
        toast({
          title: "Insufficient credits",
          description: `You need ${APP_CONFIG.CREDITS_PER_WILDCARD} credits for wildcard search.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      try {
        await consumeCredits(
          APP_CONFIG.CREDITS_PER_WILDCARD,
          'wildcard_search',
          { pattern, timestamp: new Date().toISOString() }
        );
      } catch (error) {
        if (error instanceof Error && error.message === 'insufficient_credits') {
          toast({
            title: "Insufficient credits",
            description: `You need ${APP_CONFIG.CREDITS_PER_WILDCARD} credits for wildcard search.`,
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }
    } else {
      console.log('Admin bypass: Skipping credit deduction for wildcard search');
    }

    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const wildcardSuggestions = generateWildcardSuggestions(pattern.replace(/\*/g, ''));
      setSuggestions(wildcardSuggestions);
      
      toast({
        title: "Wildcard Search Complete",
        description: `Found ${wildcardSuggestions.length} domain pattern suggestions`,
        variant: "default",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate wildcard suggestions";
      toast({
        title: "Search Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPattern(e.target.value);
  };

  // Show loading while credits are being fetched
  if (creditsLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${className}`}>
        {/* Wildcard Search Form */}
        <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2 flex items-center justify-center gap-2">
              <Wand2 className="h-6 w-6 text-accent" />
              Wildcard Explorer
            </CardTitle>
            <CardDescription className="text-base">
              Discover domain patterns using wildcards. Try patterns like <code className="bg-muted px-1 rounded">*ai.com</code>, <code className="bg-muted px-1 rounded">crypto*</code>, or <code className="bg-muted px-1 rounded">web*app</code>
            </CardDescription>
            <div className="text-sm text-muted-foreground">
              {isAdmin ? (
                <Badge variant="outline" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Admin Access - Free Usage
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  3 Credits per Search
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter wildcard pattern (e.g., *ai.com, crypto*, web*app)..."
                  value={pattern}
                  onChange={handlePatternChange}
                  className="text-lg py-6"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                disabled={isLoading || !pattern.trim() || (!isAdmin && credits < APP_CONFIG.CREDITS_PER_WILDCARD)}
                className="px-8 py-6 text-lg"
                variant="default"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                    Exploring...
                  </>
                ) : (!isAdmin && credits < APP_CONFIG.CREDITS_PER_WILDCARD) ? (
                  <>Need {APP_CONFIG.CREDITS_PER_WILDCARD} Credits</>
                ) : (
                  <><Search className="mr-2 h-5 w-5" /> Explore Pattern</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {hasSearched && (
          <div className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating wildcard suggestions...</span>
                  </div>
                </CardContent>
              </Card>
            ) : suggestions.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Pattern Suggestions ({suggestions.length} domains)</CardTitle>
                  <CardDescription>
                    Brand-style domain variations based on your wildcard pattern
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={suggestion}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/10 transition-colors cursor-pointer group"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm group-hover:text-accent transition-colors">
                            {suggestion}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Pattern Match
                            </Badge>
                            <div className="flex items-center gap-1">
                              <StarRating rating={Math.floor(Math.random() * 3) + 3} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    No patterns found for "{pattern}". Try a different wildcard pattern.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  };
  
  export default WildcardExplorer;