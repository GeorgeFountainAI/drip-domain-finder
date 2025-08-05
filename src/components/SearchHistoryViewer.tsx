import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, History, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchHistoryItem {
  id: string;
  keyword: string;
  created_at: string;
}

interface SearchHistoryViewerProps {
  onSearchAgain?: (keyword: string) => Promise<void>;
}

export const SearchHistoryViewer = ({ onSearchAgain }: SearchHistoryViewerProps) => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchingKeyword, setSearchingKeyword] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const clearHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to clear history.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing search history:', error);
        toast({
          title: "Error", 
          description: "Failed to clear search history. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setSearchHistory([]);
      
      toast({
        title: "History cleared",
        description: "Your search history has been cleared.",
      });
    } catch (error) {
      console.error('Error clearing search history:', error);
      toast({
        title: "Error",
        description: "Failed to clear search history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('search_history')
        .select('id, keyword, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching search history:', error);
        return;
      }

      setSearchHistory(data || []);
    } catch (error) {
      console.error('Error fetching search history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' – ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSearchAgain = async (keyword: string) => {
    if (!onSearchAgain) return;
    
    setSearchingKeyword(keyword);
    
    try {
      await onSearchAgain(keyword);
      
      toast({
        title: "Search triggered",
        description: `Searching for "${keyword}" again...`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search domains";
      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSearchingKeyword(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-muted-foreground">Loading search history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (searchHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Search History
          </CardTitle>
          <CardDescription>
            Your recent domain searches will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No search history yet. Start searching for domains to see your history here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Search History
        </CardTitle>
        <CardDescription>
          Your {searchHistory.length} most recent domain searches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {searchHistory.map((item) => (
            <div 
              key={item.id} 
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors gap-3"
            >
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="font-medium break-all">{item.keyword}</span>
                  <Badge variant="outline" className="self-start text-xs">
                    {formatDate(item.created_at)}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => handleSearchAgain(item.keyword)}
                disabled={searchingKeyword === item.keyword}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                {searchingKeyword === item.keyword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Searching...</span>
                    <span className="sm:hidden">Search</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Search Again</span>
                    <span className="sm:hidden">Search</span>
                  </>
                )}
              </Button>
            </div>
          ))}
          <div className="pt-3 border-t">
            <Button
              onClick={clearHistory}
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              Clear History
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};