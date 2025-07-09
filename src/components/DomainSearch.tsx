import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DomainSearchProps {
  onSearch: (keyword: string) => void;
  isLoading: boolean;
}

export const DomainSearch = ({ onSearch, isLoading }: DomainSearchProps) => {
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch(keyword.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DomainDrip.AI
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate perfect domain names for your next project. Enter a keyword or pattern and discover available domains instantly.
          </p>
        </div>

        {/* Search Card */}
        <Card className="bg-gradient-card border-border/50 shadow-elevated backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Find Your Perfect Domain</CardTitle>
            <CardDescription>
              Enter a keyword or use wildcards like "curl*" to generate variations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter keyword or pattern (e.g., curl* or myapp)"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="text-lg h-12 bg-background/50 border-border/50 focus:border-primary"
                />
              </div>
              <Button
                type="submit"
                variant="hero"
                size="lg"
                disabled={isLoading || !keyword.trim()}
                className="h-12 px-8"
              >
                <Search className="h-5 w-5 mr-2" />
                {isLoading ? "Searching..." : "Search Domains"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Example Patterns */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">Try these patterns:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["curl*", "my*app", "*hub", "get*", "super*"].map((pattern) => (
              <Button
                key={pattern}
                variant="outline"
                size="sm"
                onClick={() => setKeyword(pattern)}
                className="bg-background/50 hover:bg-background/70"
              >
                {pattern}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};