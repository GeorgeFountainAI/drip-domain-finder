import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { LogOut, User, Sparkles, Shield, CreditCard, Coins, Settings, Rocket, FileText, UserPlus, ChevronDown } from "lucide-react";
import domainDripLogo from "/lovable-uploads/54151200-6cf6-4c1b-b88a-bc150fc097c8.png";
import paintSplatterLogo from "@/assets/paint-splatter-logo.png";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CreditBalance from "@/components/CreditBalance";
import CreditPurchase from "@/components/CreditPurchase";
import { useUser } from "@/lib/supabaseClient";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AppHeaderProps {
  user: SupabaseUser | null;
}

export const AppHeader = ({ user }: AppHeaderProps) => {
  const { toast } = useToast();
  const location = useLocation();
  const { user: hookUser } = useUser();
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  // Use prop user if provided, otherwise fall back to hook
  const currentUser = user || hookUser;

  // Listen for custom event to open credit purchase modal
  useEffect(() => {
    const handleOpenCreditPurchase = () => {
      setShowCreditPurchase(true);
    };

    window.addEventListener('openCreditPurchase', handleOpenCreditPurchase);
    return () => {
      window.removeEventListener('openCreditPurchase', handleOpenCreditPurchase);
    };
  }, []);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser?.email) {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('admin-data', {
          body: { action: 'checkAdminStatus' }
        });

        if (error || data?.error) {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [currentUser?.email]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Logout failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (err) {
      toast({
        title: "Logout failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-6">
          <Link to="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <img 
                src={paintSplatterLogo} 
                alt="DomainDrip Paint Splatter Logo" 
                className="h-8 w-8 md:h-10 md:w-10"
              />
            </div>
            <span className="text-lg md:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DomainDrip
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-2">
            <Button
              asChild
              variant={location.pathname === "/" ? "default" : "ghost"}
              size="sm"
            >
              <Link to="/">Home</Link>
            </Button>
            
            {isAdmin && (
              <Button
                asChild
                variant={location.pathname === "/admin" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Link to="/admin">
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {currentUser ? (
            <>
              <CreditBalance />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreditPurchase(true)}
                className="gap-1 md:gap-2 mobile-touch-target"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Buy Credits</span>
                <span className="sm:hidden text-xs">Credits</span>
              </Button>

              {/* Admin Tools Dropdown */}
              {isAdmin && !isCheckingAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Admin Tools</span>
                      <span className="sm:hidden">Tools</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48 mobile-dropdown"
                  >
                    <DropdownMenuItem asChild>
                      <Link to="/admin/deploy" className="flex items-center gap-2 cursor-pointer">
                        <Rocket className="h-4 w-4" />
                        Deploy to Production
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/logs" className="flex items-center gap-2 cursor-pointer">
                        <FileText className="h-4 w-4" />
                        View Logs
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="flex items-center gap-2 text-muted-foreground">
                      <UserPlus className="h-4 w-4" />
                      Add Admins
                      <Badge variant="outline" className="text-xs ml-auto">Soon</Badge>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* User Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{currentUser.email?.split('@')[0]}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 mobile-dropdown">
                  <div className="p-2 border-b">
                    <p className="text-sm font-medium">{currentUser.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/app" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>

    <Dialog open={showCreditPurchase} onOpenChange={setShowCreditPurchase}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Purchase Credits
          </DialogTitle>
        </DialogHeader>
        <CreditPurchase />
      </DialogContent>
    </Dialog>
    </>
  );
};