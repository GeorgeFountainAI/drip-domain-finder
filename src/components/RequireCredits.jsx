import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [attemptCount, setAttemptCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);
  const timeoutRef = useRef(null);

  // Check admin status - Admin bypass for internal testing and demo use
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const adminStatus = user.email === 'gfountain257@gmail.com' || 
                            user.user_metadata?.role === 'admin';
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, []);

  // Function to show enhanced insufficient credits toast
  const showInsufficientCreditsToast = () => {
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset attempt count after 10 seconds
    timeoutRef.current = setTimeout(() => {
      setAttemptCount(0);
    }, 10000);

    toast({
      title: "⚠️ Insufficient Credits",
      description: `You need ${credits} credit${credits > 1 ? 's' : ''} to search domains. You have ${userCredits} credit${userCredits !== 1 ? 's' : ''}.`,
      variant: "insufficient-credits",
      duration: 6000,
      action: (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('openCreditPurchase'));
          }}
          className="bg-white text-orange-600 hover:bg-gray-100 font-medium shrink-0"
        >
          Buy Credits
        </Button>
      ),
      className: newAttemptCount > 1 ? "animate-pulse" : "",
    });
  };

  // Reset toast flag when user gains credits or changes credit requirements
  useEffect(() => {
    if (hasCredits(credits) || isAdmin) {
      setHasShownToast(false);
    }
  }, [userCredits, credits, hasCredits, isAdmin]);

  useEffect(() => {
    if (!loading && !hasCredits(credits) && showAlert && !isAdmin && !hasShownToast) {
      setHasShownToast(true);
      showInsufficientCreditsToast();
    }
  }, [loading, userCredits, credits, showAlert, hasCredits, isAdmin, hasShownToast]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  // If user has enough credits or is admin, render children
  if (hasCredits(credits) || isAdmin) {
    return children;
  }

  // If blockRender is false, still render children even without credits
  if (!blockRender) {
    return children;
  }

  // Show insufficient credits message (only for non-admin users)
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