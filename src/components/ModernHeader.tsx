import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, CreditCard, Settings, Menu, ShieldCheck } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { useAdminBypass } from "@/hooks/useAdminBypass";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import domainDripLogo from "/lovable-uploads/54151200-6cf6-4c1b-b88a-bc150fc097c8.png";

interface ModernHeaderProps {
  user: any;
  onCreditPurchase?: () => void;
}

export const ModernHeader = ({ user, onCreditPurchase }: ModernHeaderProps) => {
  const { credits } = useCredits();
  const { isAdmin } = useAdminBypass();
  const { toast } = useToast();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <img 
            src={domainDripLogo} 
            alt="DomainDrip Logo" 
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DomainDrip
            </h1>
            <p className="text-xs text-muted-foreground">
              Find your perfect domain
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          {/* Credits Display */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              <span className="font-medium">{credits} credits</span>
            </Badge>
            {onCreditPurchase && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCreditPurchase}
                className="text-xs"
              >
                Add Credits
              </Button>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">
                {user?.email?.split('@')[0] || 'User'}
              </span>
              <Menu className="h-3 w-3" />
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-popover p-1 shadow-md">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {credits} credits available
                  </p>
                </div>
                
                <div className="py-1">
                  {onCreditPurchase && (
                    <button
                      onClick={() => {
                        onCreditPurchase();
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-sm"
                    >
                      <CreditCard className="h-4 w-4" />
                      Purchase Credits
                    </button>
                  )}
                  
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-sm"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-sm text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};