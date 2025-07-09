import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, AlertTriangle, RefreshCw, ArrowLeft, Sparkles, Mail } from "lucide-react";

interface ServerErrorProps {
  error?: Error;
  resetError?: () => void;
}

const ServerError = ({ error, resetError }: ServerErrorProps) => {
  useEffect(() => {
    console.error("500 Error: Server error occurred:", error);
  }, [error]);

  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DomainDrip.AI
            </span>
          </div>
        </div>

        <Card className="shadow-elevated">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
            <CardDescription>
              We're experiencing technical difficulties. Our team has been notified and is working to fix the issue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              {error && (
                <div className="bg-muted p-3 rounded-md mb-6">
                  <p className="text-xs text-muted-foreground mb-2">Error Details:</p>
                  <code className="text-xs break-all">{error.message}</code>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleRefresh} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-4"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Information */}
        <div className="mt-8 text-center">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Need Help?</h3>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="mailto:support@domaindrip.ai">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Home</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            If the problem persists, please contact our support team with the error details above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerError;