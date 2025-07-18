import { useState, useEffect } from "react";
import { DeployDashboard } from "@/components/DeployDashboard";
import { AuthForm } from "@/components/AuthForm";
import { AppHeader } from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";

const AdminDeploy = () => {
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
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />
      <DeployDashboard user={user} />
    </div>
  );
};

export default AdminDeploy;