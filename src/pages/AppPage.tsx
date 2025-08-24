// src/pages/AppPage.tsx
import React from 'react';
import { DomainSearchForm } from '@/components/DomainSearchForm';
import DomainResults from '@/components/DomainResults';
import { useSearchStore } from '@/lib/store';

const AppPage: React.FC = () => {
  const { setResults } = useSearchStore();

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
    <div className="mx-auto max-w-5xl px-4 py-6">
      <DomainSearchForm onResults={handleResults} />
      <DomainResults />
    </div>
  );
};

export default AppPage;
