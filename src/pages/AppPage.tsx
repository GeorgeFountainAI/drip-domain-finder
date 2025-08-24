
import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { DomainSearchForm } from '@/components/DomainSearchForm';
import DomainResults from '@/components/DomainResults';
import { SearchHistoryViewer } from '@/components/SearchHistoryViewer';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';

const AppPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        // Redirect to auth if not authenticated
        navigate('/auth');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          // Redirect to auth if logged out
          navigate('/auth');
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-32 mb-2"></div>
          <div className="h-8 bg-muted rounded w-48"></div>
        </div>
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />
      
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section for App */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              AI Domain Search
            </h1>
            <p className="text-xl text-muted-foreground">
              Enter keywords to discover available domains with our FlipScore analysis
            </p>
          </div>

          {/* Search Form */}
          <div className="mb-8">
            <DomainSearchForm onResults={() => {}} onStateChange={() => {}} />
          </div>

          {/* Search History */}
          <div className="mb-8">
            <SearchHistoryViewer onSearchAgain={(keyword) => {
              // Handle search again functionality
              console.log('Search again:', keyword);
            }} />
          </div>

          {/* Results */}
          <DomainResults />
        </div>
      </div>
    </div>
  );
};

export default AppPage;
