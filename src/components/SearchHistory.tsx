import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, History, Search, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SearchHistoryItem {
  id: string;
  keyword: string;
  created_at: string;
}

interface SearchHistoryProps {
  onSearchAgain: (keyword: string) => void;
  currentKeyword?: string;
}

const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const searchTime = new Date(timestamp);
  const diffMs = now.getTime() - searchTime.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return searchTime.toLocaleDateString();
};

export const SearchHistory: React.FC<SearchHistoryProps> = ({ onSearchAgain, currentKeyword }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load search history from Supabase
  const loadSearchHistory = async () => {
    setIsLoading(true);
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
        console.error('Error loading search history:', error);
        return;
      }

      setSearchHistory(data || []);
    } catch (error) {
      console.error('Error loading search history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save search to history
  const saveSearchToHistory = async (keyword: string) => {
    if (!keyword.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Only save history for authenticated users

      const { error } = await supabase
        .from('search_history')
        .insert([{ keyword: keyword.trim(), user_id: user.id }]);

      if (error) {
        console.error('Error saving search to history:', error);
        return;
      }

      // Reload history to show the new search
      await loadSearchHistory();
    } catch (error) {
      console.error('Error saving search to history:', error);
    }
  };

  // Clear all search history
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
          description: "Failed to clear search history",
          variant: "destructive",
        });
        return;
      }

      setSearchHistory([]);
      console.log('🧹 History cleared');
      
      toast({
        title: "History Cleared",
        description: "All search history has been cleared",
        variant: "default",
      });
    } catch (error) {
      console.error('Error clearing search history:', error);
      toast({
        title: "Error",
        description: "Failed to clear search history",
        variant: "destructive",
      });
    }
  };

  // Handle search again
  const handleSearchAgain = (keyword: string) => {
    console.log(`🔄 Re-running search: ${keyword}`);
    onSearchAgain(keyword);
  };

  // Handle toggle
  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      console.log('📂 History expanded');
      loadSearchHistory();
    } else {
      console.log('📁 History collapsed');
    }
  };

  // Save current search when currentKeyword changes
  useEffect(() => {
    if (currentKeyword && currentKeyword.trim()) {
      saveSearchToHistory(currentKeyword);
    }
  }, [currentKeyword]);

  // Always render the collapsible header for better UX
  // (removed conditional rendering so users always see the section)

  return (
    <Card className="border-border">
      <Collapsible open={isOpen} onOpenChange={handleToggle}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto hover:bg-muted/50"
            onClick={handleToggle}
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">Search History</span>
              {searchHistory.length > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {searchHistory.length}
                </span>
              )}
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="transition-all duration-300 ease-in-out overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <CardContent className="pt-0 pb-4">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading history...
              </div>
            ) : searchHistory.length > 0 ? (
              <div className="space-y-2">
                {/* Clear History Button */}
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-muted-foreground hover:text-destructive gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear History
                  </Button>
                </div>

                {/* History Items */}
                <div className="space-y-1">
                  {searchHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground bg-primary/10 px-2 py-1 rounded text-sm">
                            {item.keyword}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeTime(item.created_at)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearchAgain(item.keyword)}
                        className="gap-1 text-xs"
                      >
                        <Search className="h-3 w-3" />
                        Search Again
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No search history yet</p>
                <p className="text-xs">Your recent searches will appear here</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};