import React from "react";

interface Domain {
  name: string;
  available: boolean;
  price: number;
  tld: string;
  flipScore?: number;
  trendStrength?: number;
}

interface DomainResultsProps {
  domains: Domain[];
  onAddToCart: (domains: Domain[]) => void;
  onBack: () => void;
  isLoading: boolean;
  totalResults?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export const DomainResults: React.FC<DomainResultsProps> = ({
  domains,
  onBack,
  isLoading,
}) => {
  const handleBuyNow = (domainName: string) => {
    console.log('🎯 BUY NOW CLICKED:', domainName);
    window.open(`https://www.spaceship.com/search?query=${domainName}`, "_blank");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log('🚀 DomainResults rendering with', domains?.length, 'domains');

  return (
    <div style={{ 
      backgroundColor: 'white', 
      minHeight: '100vh', 
      padding: '20px',
      color: 'black'
    }}>
      <button 
        onClick={onBack}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          backgroundColor: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        ← Back to Search
      </button>
      
      <h1 style={{ color: 'black', marginBottom: '20px' }}>
        Domain Results ({domains?.length || 0} found)
      </h1>
      
      {domains && domains.map((domain, index) => (
        <div 
          key={domain.name} 
          style={{
            border: '2px solid #000',
            padding: '20px',
            marginBottom: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <h3 style={{ color: 'black', margin: '0 0 5px 0', fontSize: '18px' }}>
                {domain.name}
              </h3>
              <p style={{ color: 'green', margin: '0', fontWeight: 'bold' }}>
                Available - ${domain.price.toFixed(2)}/year
              </p>
            </div>
            
            <button
              onClick={() => handleBuyNow(domain.name)}
              style={{
                backgroundColor: '#ff6b35',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '5px',
                cursor: 'pointer',
                minWidth: '120px',
                height: '50px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#e55a2b';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ff6b35';
              }}
            >
              BUY NOW
            </button>
          </div>
        </div>
      ))}
      
      {(!domains || domains.length === 0) && (
        <p style={{ color: 'red', fontSize: '18px' }}>No domains to display</p>
      )}
    </div>
  );
};