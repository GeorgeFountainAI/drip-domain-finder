import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminBypass = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          return;
        }

        // List of admin emails that can bypass credit checks
        const adminEmails = [
          'admin@domaindrip.ai',
          'demo@domaindrip.ai', 
          'test@admin.com',
          'gfountain257@gmail.com' // Based on the secrets, this seems to be an admin email
        ];
        
        const isUserAdmin = adminEmails.includes(user.email || '');
        setIsAdmin(isUserAdmin);
        
        if (isUserAdmin) {
          console.log('Admin access granted for:', user.email);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, loading };
};