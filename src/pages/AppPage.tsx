// src/pages/AppPage.tsx
import React, { useState, useEffect } from 'react';
import { DomainSearchForm } from '@/components/DomainSearchForm';
import DomainResults from '@/components/DomainResults';
import { AppHeader } from '@/components/AppHeader';
import { useSearchStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

const AppPage: React.FC = () => {
  const { setResults } = useSearchStore();
  const [user, setUser] = useState<User | null>(null);

  // Set up auth state management
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResults = (domains: any[]) => {
    // Convert DomainSearchForm results to store format
    const storeResults = domains.map(domain => ({
      domain: domain.name,
      available: domain.available,
      price: domain.price,
      flipScore: domain.flipScore
    }));
    setResults(storeResults);
  };

  return (
    <div className="min-h-screen">
      <AppHeader user={user} />
      <main className="max-w-4xl mx-auto p-6">
        <DomainSearchForm onResults={handleResults} />
        <DomainResults />
      </main>
    </div>
  );
};

export default AppPage;
