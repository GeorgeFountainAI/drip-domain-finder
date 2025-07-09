import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, 
  ShieldX, 
  Users, 
  Search, 
  TrendingUp, 
  Calendar, 
  Loader2, 
  RefreshCw,
  Eye,
  Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchHistoryItem {
  id: string;
  keyword: string;
  created_at: string;
  user_id: string;
  user_email: string;
}

interface TopKeyword {
  keyword: string;
  count: number;
}

interface AdminStats {
  totalSearches: number;
  todaySearches: number;
  uniqueUsers: number;
}

interface AdminPanelProps {
  user: any;
}

export const AdminPanel = ({ user }: AdminPanelProps) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const [topKeywords, setTopKeywords] = useState<TopKeyword[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchAdminData = async (action: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-data', {
        body: { action }
      });

      if (error) {
        if (error.message?.includes("Access denied")) {
          setHasAccess(false);
          return null;
        }
        throw new Error(error.message || 'Failed to fetch admin data');
      }

      if (data.error) {
        if (data.error.includes("Access denied")) {
          setHasAccess(false);
          return null;
        }
        throw new Error(data.error);
      }

      setHasAccess(true);
      return data;
    } catch (err) {
      console.error(`Error fetching ${action}:`, err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : `Failed to fetch ${action}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch all admin data
      const [recentData, keywordsData, statsData] = await Promise.all([
        fetchAdminData('getRecentSearches'),
        fetchAdminData('getTopKeywords'),
        fetchAdminData('getStats')
      ]);

      if (recentData?.recentSearches) {
        setRecentSearches(recentData.recentSearches);
      }
      
      if (keywordsData?.topKeywords) {
        setTopKeywords(keywordsData.topKeywords);
      }
      
      if (statsData?.stats) {
        setStats(statsData.stats);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAllData();
    setIsRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Admin dashboard data has been updated.",
    });
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-muted-foreground">Loading admin dashboard...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="rounded-md bg-muted p-4">
              <Lock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                This area is restricted to administrators only.
                <br />
                Current user: <span className="font-medium">{user?.email}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor domain search activity and user engagement
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSearches.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time searches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Searches</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todaySearches.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Searches in the last 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Users who have searched</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top 5 Searched Keywords
          </CardTitle>
          <CardDescription>
            Most popular search terms across all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topKeywords.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No keyword data available yet.
            </p>
          ) : (
            <div className="space-y-3">
              {topKeywords.map((item, index) => (
                <div key={item.keyword} className="flex items-center justify-between p-3 rounded-md border">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{item.keyword}</span>
                  </div>
                  <Badge variant="secondary">
                    {item.count} search{item.count !== 1 ? 'es' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Searches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Domain Searches
          </CardTitle>
          <CardDescription>
            Latest 20 domain search queries from all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentSearches.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No recent searches found.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Email</TableHead>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSearches.map((search) => (
                    <TableRow key={search.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {search.user_email}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{search.keyword}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(search.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm">Admin Access Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-primary" />
            <span>Logged in as admin: <span className="font-medium">{user?.email}</span></span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            You have full access to view all user activity and search analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};