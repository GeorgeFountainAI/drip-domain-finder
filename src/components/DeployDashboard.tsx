import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  GitBranch, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  GitCommit,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeploymentStatus {
  status: 'staging' | 'deploying' | 'success' | 'failed';
  lastCommit?: {
    message: string;
    hash: string;
    author: string;
    timestamp: string;
  };
  deploymentUrl?: string;
  workflowRunId?: string;
}

interface DeployDashboardProps {
  user: any;
}

export const DeployDashboard = ({ user }: DeployDashboardProps) => {
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    status: 'staging'
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentHistory, setDeploymentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Mock deployment status - in real implementation, this would fetch from GitHub API or deployment service
  const fetchDeploymentStatus = async () => {
    setIsLoading(true);
    
    // Simulate API call to get latest deployment info
    setTimeout(() => {
      setDeploymentStatus({
        status: 'staging',
        lastCommit: {
          message: "feat: Added admin deploy dashboard with one-click production deployment",
          hash: "a1b2c3d",
          author: "admin@example.com",
          timestamp: new Date().toISOString()
        },
        deploymentUrl: "https://staging.domaindrip.ai",
        workflowRunId: "123456789"
      });
      
      // Mock deployment history
      setDeploymentHistory([
        {
          id: "1",
          status: "success",
          environment: "production",
          commit_message: "fix: Improved domain search performance",
          commit_hash: "x9y8z7w",
          deployed_at: new Date(Date.now() - 86400000).toISOString(),
          deployed_by: "admin@example.com"
        },
        {
          id: "2", 
          status: "success",
          environment: "production",
          commit_message: "feat: Added credit system integration",
          commit_hash: "q1w2e3r",
          deployed_at: new Date(Date.now() - 172800000).toISOString(),
          deployed_by: "admin@example.com"
        }
      ]);
      
      setIsLoading(false);
    }, 800);
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    
    try {
      toast({
        title: "🚀 Starting Deployment",
        description: "Triggering production deployment...",
      });

      const { data, error } = await supabase.functions.invoke('deploy-to-production', {
        body: {
          commit_hash: deploymentStatus.lastCommit?.hash,
          commit_message: deploymentStatus.lastCommit?.message,
          deployed_by: user.email
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Update status to deploying
      setDeploymentStatus(prev => ({ ...prev, status: 'deploying' }));

      // Simulate deployment progress
      setTimeout(() => {
        setDeploymentStatus(prev => ({ ...prev, status: 'success' }));
        setIsDeploying(false);
        
        toast({
          title: "✅ Deployment Successful",
          description: "Production deployment completed successfully!",
        });

        // Refresh deployment history
        fetchDeploymentStatus();
      }, 5000);

    } catch (error) {
      console.error('Deployment error:', error);
      setDeploymentStatus(prev => ({ ...prev, status: 'failed' }));
      setIsDeploying(false);
      
      toast({
        title: "❌ Deployment Failed",
        description: error instanceof Error ? error.message : "Deployment failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDeploymentStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'staging':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'deploying':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'staging':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">🟡 Staging Ready</Badge>;
      case 'deploying':
        return <Badge variant="outline" className="text-blue-600 border-blue-300">🔄 Deploying</Badge>;
      case 'success':
        return <Badge variant="outline" className="text-green-600 border-green-300">✅ Production Live</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-300">❌ Deploy Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-muted-foreground">Loading deployment status...</span>
            </div>
          </CardContent>
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
            <Rocket className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="hidden sm:inline">Deploy Dashboard</span>
            <span className="sm:hidden">Deploy</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            One-click production deployment from staging
          </p>
        </div>
        <Button 
          onClick={fetchDeploymentStatus} 
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          size="sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh Status</span>
          <span className="sm:hidden">Refresh</span>
        </Button>
      </div>

      {/* Main Deployment Card */}
      <Card className="border-primary/20 bg-gradient-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              {getStatusIcon(deploymentStatus.status)}
              Current Status
            </CardTitle>
            {getStatusBadge(deploymentStatus.status)}
          </div>
          <CardDescription>
            Latest staging deployment ready for production release
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Latest Commit Info */}
          {deploymentStatus.lastCommit && (
            <div className="p-4 rounded-md border bg-muted/30 space-y-3">
              <div className="flex items-start gap-3">
                <GitCommit className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="font-medium text-sm">{deploymentStatus.lastCommit.message}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {deploymentStatus.lastCommit.hash}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(deploymentStatus.lastCommit.timestamp)}
                    </span>
                    <span>by {deploymentStatus.lastCommit.author}</span>
                  </div>
                </div>
              </div>
              {deploymentStatus.deploymentUrl && (
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href={deploymentStatus.deploymentUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                    Preview Staging
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Deploy Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleDeploy}
              disabled={isDeploying || deploymentStatus.status === 'deploying'}
              className="flex-1 gap-2 bg-gradient-primary hover:shadow-primary transform hover:scale-105 transition-smooth font-semibold shadow-card"
              size="lg"
            >
              {isDeploying || deploymentStatus.status === 'deploying' ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Deploying to Production...
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5" />
                  🚀 Publish to Production
                </>
              )}
            </Button>
            
            {(isDeploying || deploymentStatus.status === 'deploying') && (
              <Button variant="outline" size="lg" className="gap-2" disabled>
                <XCircle className="h-5 w-5" />
                Cancel Deploy
              </Button>
            )}
          </div>

          {/* Progress indicator during deployment */}
          {(isDeploying || deploymentStatus.status === 'deploying') && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Deployment Progress</span>
                <span>Running...</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">
                Triggering GitHub Actions → Building → Deploying → Sending Slack notification
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deployment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Deployments
          </CardTitle>
          <CardDescription>
            Last 5 production deployments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deploymentHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No deployment history available.
            </p>
          ) : (
            <div className="space-y-3">
              {deploymentHistory.map((deployment) => (
                <div key={deployment.id} className="flex items-center justify-between p-3 rounded-md border">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(deployment.status)}
                    <div>
                      <p className="font-medium text-sm">{deployment.commit_message}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{deployment.commit_hash}</span>
                        <span>•</span>
                        <span>{formatDate(deployment.deployed_at)}</span>
                        <span>•</span>
                        <span>by {deployment.deployed_by}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={deployment.status === 'success' ? 'outline' : 'destructive'}>
                    {deployment.environment}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm">Deployment Access Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <Rocket className="h-4 w-4 text-primary" />
            <span>Deployment admin: <span className="font-medium">{user?.email}</span></span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            You have permissions to deploy staging changes to production.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};