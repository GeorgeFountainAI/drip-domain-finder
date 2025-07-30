import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { LogOut, User, Sparkles, Shield, CreditCard, Coins, Settings, Rocket, FileText, UserPlus, ChevronDown } from "lucide-react";
import domainDripLogo from "/lovable-uploads/54151200-6cf6-4c1b-b88a-bc150fc097c8.png";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CreditBalance from "@/components/CreditBalance";
import CreditPurchase from "@/components/CreditPurchase";

interface AppHeaderProps {
  user: any;
}

export const AppHeader = ({ user }: AppHeaderProps) => {
  const { toast } = useToast();
  const location = useLocation();
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

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
      if (!user?.email) {
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
  }, [user?.email]);

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
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src={domainDripLogo} 
              alt="DomainDrip Logo" 
              className="h-8 w-8"
            />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DomainDrip
            </span>
          </Link>
          
          <nav className="flex items-center gap-2">
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

        <div className="flex items-center gap-4">
          <CreditBalance />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreditPurchase(true)}
            className="gap-2"
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Buy Credits</span>
            <span className="sm:hidden">Credits</span>
          </Button>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="hidden sm:inline-flex">
              {user?.email}
            </Badge>
            <span className="text-sm text-muted-foreground sm:hidden">
              {user?.email?.split('@')[0]}
            </span>
          </div>

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
                className="w-48 bg-background border shadow-elevated z-50"
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

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
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