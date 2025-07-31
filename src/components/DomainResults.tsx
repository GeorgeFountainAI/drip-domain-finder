import { useState } from "react";
import { ArrowLeft, Globe, TrendingUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

const getFlipScore = (score?: number) => {
  if (score !== undefined) return score;
  return Math.floor(Math.random() * 41) + 60;
};

const FlipScore = ({ score }: { score: number }) => {
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#eab308" : "#ea580c";
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'help' }}>
            <TrendingUp style={{ width: '12px', height: '12px', color: '#6b7280' }} />
            <span style={{ fontSize: '12px', fontWeight: 'bold', color }}>{score}/100</span>
            <Info style={{ width: '12px', height: '12px', color: '#6b7280' }} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">Flip potential score</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const DomainResults = ({
  domains,
  onAddToCart,
  onBack,
  isLoading,
}: DomainResultsProps) => {
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());

  const handleBuyNow = (domainName: string) => {
    console.log('🔥 Buy Now clicked for:', domainName);
    const url = `https://www.spaceship.com/search?query=${domainName}&aff=MY_AFFILIATE_ID`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'white'
      }}>
        <p style={{ fontSize: '18px', color: '#111827' }}>Loading domains...</p>
      </div>
    );
  }

  console.log('🚀 Rendering DomainResults with', domains?.length || 0, 'domains');

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'white', 
      padding: '16px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Back Button */}
      <button 
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'transparent',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          color: '#374151',
          cursor: 'pointer',
          marginBottom: '24px',
          padding: '8px 16px',
          fontSize: '14px'
        }}
      >
        <ArrowLeft style={{ width: '16px', height: '16px' }} /> 
        Back to Search
      </button>

      {/* Results Header */}
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        color: '#111827', 
        marginBottom: '16px' 
      }}>
        Search Results ({domains?.length || 0} domains)
      </h2>

      {/* Domain List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {domains && domains.length > 0 ? domains.map((domain) => {
          console.log('🔍 Rendering domain:', domain.name);
          return (
            <div 
              key={domain.name}
              style={{
                padding: '24px',
                backgroundColor: '#ffffff',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Domain Info Row */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={selectedDomains.has(domain.name)}
                    onChange={(e) => {
                      const newSet = new Set(selectedDomains);
                      e.target.checked ? newSet.add(domain.name) : newSet.delete(domain.name);
                      setSelectedDomains(newSet);
                    }}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <Globe style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: '20px', 
                    color: '#111827' 
                  }}>
                    {domain.name}
                  </span>
                  <span style={{
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Available
                  </span>
                  <FlipScore score={getFlipScore(domain.flipScore)} />
                </div>
              </div>

              {/* Price and Button Row */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: '#111827' 
                  }}>
                    ${domain.price.toFixed(2)}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#6b7280' 
                  }}>
                    per year
                  </div>
                </div>

                <button
                  onClick={() => handleBuyNow(domain.name)}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '16px 32px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.2s ease',
                    minWidth: '120px',
                    height: '56px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                  }}
                >
                  BUY NOW
                </button>
              </div>
            </div>
          );
        }) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#6b7280',
            fontSize: '18px'
          }}>
            No domains found. Try a different search term.
          </div>
        )}
      </div>
    </div>
  );
};