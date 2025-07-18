import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CreditCard } from 'lucide-react';

const RequireCredits = ({ 
  credits = 1, 
  children, 
  redirectTo = '/credits',
  showAlert = true,
  blockRender = true 
}) => {
  const { credits: userCredits, loading, hasCredits } = useCredits();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !hasCredits(credits) && showAlert) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${credits} credit${credits > 1 ? 's' : ''} to access this feature. You have ${userCredits} credit${userCredits !== 1 ? 's' : ''}.`,
        variant: "destructive",
      });
    }
  }, [loading, userCredits, credits, showAlert, hasCredits, toast]);

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user has enough credits, render children
  if (hasCredits(credits)) {
    return children;
  }

  // If blockRender is false, still render children even without credits
  if (!blockRender) {
    return children;
  }

  // Show insufficient credits message
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Insufficient Credits</h3>
        <p className="text-muted-foreground mb-4">
          You need {credits} credit{credits > 1 ? 's' : ''} to access this feature.
          <br />
          You currently have {userCredits} credit{userCredits !== 1 ? 's' : ''}.
        </p>
        <Button 
          onClick={() => navigate(redirectTo)}
          className="w-full"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Purchase Credits
        </Button>
      </CardContent>
    </Card>
  );
};

export default RequireCredits;