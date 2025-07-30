import { useState, useEffect } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { AuthForm } from "@/components/AuthForm";
import { AppHeader } from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import domainDripLogo from "/lovable-uploads/54151200-6cf6-4c1b-b88a-bc150fc097c8.png";

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show authentication form if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen relative">
        {/* Background Logo Watermark */}
        <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
          <img 
            src={domainDripLogo} 
            alt="" 
            className="w-[60vw] h-[60vh] object-contain opacity-[0.06] rotate-12 scale-150"
          />
        </div>
        <div className="relative z-10">
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Logo Watermark */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <img 
          src={domainDripLogo} 
          alt="" 
          className="w-[60vw] h-[60vh] object-contain opacity-[0.06] rotate-12 scale-150"
        />
      </div>
      <div className="relative z-10">
        <AppHeader user={user} />
        <AdminPanel user={user} />
      </div>
    </div>
  );
};

export default Admin;