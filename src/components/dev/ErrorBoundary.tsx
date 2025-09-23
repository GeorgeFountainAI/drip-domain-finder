import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-elevated">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-destructive">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                {isDev 
                  ? "A runtime error occurred during development. Check the console for details."
                  : "An unexpected error occurred. Please try refreshing the page."
                }
              </p>
              
              {isDev && this.state.error && (
                <>
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <h4 className="font-medium text-destructive mb-2">Error Details:</h4>
                    <p className="text-sm font-mono text-destructive break-all">
                      {this.state.error.name}: {this.state.error.message}
                    </p>
                  </div>
                  
                  {this.state.error.stack && (
                    <details className="p-4 rounded-lg bg-muted/50 border">
                      <summary className="cursor-pointer font-medium text-sm">
                        Stack Trace (click to expand)
                      </summary>
                      <pre className="mt-2 text-xs font-mono text-muted-foreground whitespace-pre-wrap overflow-x-auto">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <details className="p-4 rounded-lg bg-muted/50 border">
                      <summary className="cursor-pointer font-medium text-sm">
                        Component Stack (click to expand)
                      </summary>
                      <pre className="mt-2 text-xs font-mono text-muted-foreground whitespace-pre-wrap overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </>
              )}
              
              <div className="flex justify-center pt-4">
                <Button onClick={this.handleReset} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  {isDev ? "Reload App" : "Try Again"}
                </Button>
              </div>
              
              {isDev && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Check your browser console for additional debugging information
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;