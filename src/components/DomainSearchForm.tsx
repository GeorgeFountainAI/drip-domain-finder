import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Check, X, AlertCircle } from "lucide-react";

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
}

interface DomainSearchFormProps {
  className?: string;
}

export const DomainSearchForm = ({ className = "" }: DomainSearchFormProps) => {
  const [keyword, setKeyword] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      setError("Please enter a keyword");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/domainSearch?keyword=${encodeURIComponent(keyword.trim())}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setDomains(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search domains");
      setDomains([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Domain Search
          </CardTitle>
          <CardDescription>
            Enter a wildcard keyword (e.g., "curl*", "get*", "*app") to find available domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter keyword (e.g., curl*, get*, *app)"
                value={keyword}
                onChange={handleKeywordChange}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !keyword.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {hasSearched && !isLoading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>
              Search Results {domains.length > 0 && `(${domains.length} domains)`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {domains.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No domains found for "{keyword}". Try a different keyword.
              </p>
            ) : (
              <div className="space-y-2">
                {domains.map((domain) => (
                  <div
                    key={domain.name}
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {domain.available ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{domain.name}</span>
                      </div>
                      <Badge variant={domain.available ? "default" : "secondary"}>
                        {domain.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    
                    {domain.available && (
                      <div className="text-sm font-medium">
                        ${domain.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-muted-foreground">Searching for domains...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};