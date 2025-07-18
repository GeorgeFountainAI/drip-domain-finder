import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  Calendar, 
  Loader2, 
  RefreshCw,
  AlertCircle,
  Shield,
  Activity,
  Database,
  Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  source: string;
  metadata?: any;
}

interface AdminLogsProps {
  user: any;
}

export const AdminLogs = ({ user }: AdminLogsProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const { toast } = useToast();

  const fetchLogs = async () => {
    setIsLoading(true);
    
    try {
      // Check admin access and fetch logs
      const { data, error } = await supabase.functions.invoke('admin-data', {
        body: { action: 'getSystemLogs' }
      });

      if (error) {
        if (error.message?.includes("Access denied")) {
          setHasAccess(false);
          return;
        }
        throw new Error(error.message || 'Failed to fetch logs');
      }

      if (data.error) {
        if (data.error.includes("Access denied")) {
          setHasAccess(false);
          return;
        }
        throw new Error(data.error);
      }

      setHasAccess(true);
      
      // Mock logs for now - in real implementation, these would come from Supabase logs
      const mockLogs: LogEntry[] = [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Production deployment completed successfully",
          source: "deploy-to-production",
          metadata: { commit_hash: "a1b2c3d", deployed_by: user.email }
        },
        {
          id: "2", 
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          level: "info",
          message: "Admin dashboard accessed",
          source: "admin-data",
          metadata: { user_email: user.email, action: "getStats" }
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          level: "warn",
          message: "Slack notification delivery delayed",
          source: "slack-deployment-notification",
          metadata: { retry_count: 2 }
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          level: "error",
          message: "GitHub API rate limit exceeded",
          source: "deploy-to-production",
          metadata: { rate_limit_reset: "2024-01-01T00:00:00Z" }
        }
      ];
      
      setLogs(mockLogs);
    } catch (err) {
      console.error('Error fetching logs:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch system logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warn':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Warning</Badge>;
      case 'info':
      default:
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Info</Badge>;
    }
  };

  const getSourceIcon = (source: string) => {
    if (source.includes('deploy')) {
      return <Server className="h-4 w-4 text-primary" />;
    }
    if (source.includes('admin')) {
      return <Shield className="h-4 w-4 text-primary" />;
    }
    return <Database className="h-4 w-4 text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-muted-foreground">Loading system logs...</span>
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
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view system logs.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="hidden sm:inline">System Logs</span>
            <span className="sm:hidden">Logs</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Monitor application activity and system events
          </p>
        </div>
        <Button 
          onClick={fetchLogs} 
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          size="sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh Logs</span>
          <span className="sm:hidden">Refresh</span>
        </Button>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent System Events
          </CardTitle>
          <CardDescription>
            Latest application logs and deployment events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No logs available.
            </p>
          ) : (
            <>
              {/* Mobile View */}
              <div className="block sm:hidden space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 rounded-md border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getLevelIcon(log.level)}
                        {getLevelBadge(log.level)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    <div className="font-medium text-sm">{log.message}</div>
                    <div className="flex items-center gap-2 text-xs">
                      {getSourceIcon(log.source)}
                      <span className="text-muted-foreground">{log.source}</span>
                    </div>
                    {log.metadata && (
                      <details className="text-xs">
                        <summary className="text-muted-foreground cursor-pointer">
                          View metadata
                        </summary>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden sm:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getLevelIcon(log.level)}
                            {getLevelBadge(log.level)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <span className="font-medium">{log.message}</span>
                            {log.metadata && (
                              <details className="text-xs">
                                <summary className="text-muted-foreground cursor-pointer">
                                  metadata
                                </summary>
                                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto max-w-xs">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSourceIcon(log.source)}
                            <span className="text-sm">{log.source}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Admin Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm">Log Access Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-primary" />
            <span>System logs access: <span className="font-medium">{user?.email}</span></span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            You have permissions to view application logs and deployment events.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};