import React from "react";
import { useSearchStore, useSelectedDomains } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { HelpCircle, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const FlipScoreWithTooltip = ({ score }: { score: number }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const scoreOutOfTen = Math.round((score / 100) * 10);

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-purple-600 bg-purple-100 rounded px-2 py-1">
        Flip Score: {scoreOutOfTen}/10
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="h-3 w-3" />
            <span className="sr-only">What is Flip Score?</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-sm">
            <strong>Flip Score = Brand Potential</strong>
            <ul className="mt-1 space-y-1">
              <li>• Short, memorable names</li>
              <li>• Trendy keywords</li>
              <li>• Available .com domains</li>
              <li>• High resale interest</li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

const DomainResults = () => {
  const { results } = useSearchStore();
  const { selectedDomains, add, remove } = useSelectedDomains();

  const handleCheckboxChange = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      remove(domain);
    } else {
      add(domain);
    }
  };

  const buildBuyLink = (domain: string) => {
    return `https://www.spaceship.com/domains/domain-registration/results?search=${domain}&irclickid=Wc7xihyLMxycUY8QQ-Spo2Tf4Ukp26X0lyT-3Uk0`;
  };

  const handleBuyClick = async (e: React.MouseEvent, domain: string) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-buy-link', {
        body: { domain }
      });
      
      if (error) {
        console.error('Validation error:', error);
        return;
      }
      
      if (data?.ok) {
        const url = buildBuyLink(domain);
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to validate buy link:', error);
    }
  };

  // Filter results to only show available domains and exclude getsupermind.com
  const filteredResults = results.filter(
    item => item.available && item.domain !== 'getsupermind.com'
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        {filteredResults.map((item) => {
          const isSelected = selectedDomains.includes(item.domain);

          return (
            <div
              key={item.domain}
              className="rounded-xl border-2 border-primary/20 p-4 shadow-elevated bg-card hover:shadow-primary transition-all duration-200"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCheckboxChange(item.domain)}
                    className="rounded border-2 border-primary/30"
                  />
                  <span className="text-lg font-bold text-primary">{item.domain}</span>
                </div>
                {item.flipScore && <FlipScoreWithTooltip score={item.flipScore} />}
              </div>
              <div className="flex items-center gap-2 text-green-600 text-sm mb-3">
                <span>✅ Available</span>
                <span className="text-foreground font-medium">${item.price?.toFixed(2)}/year</span>
              </div>
              <a
                href={buildBuyLink(item.domain)}
                onClick={(e) => handleBuyClick(e, item.domain)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md hover:shadow-primary/30 hover:shadow-lg inline-flex items-center gap-2 font-medium transition-all duration-200"
              >
                BUY NOW
                <span role="img" aria-label="arrow">
                  🔗
                </span>
              </a>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default DomainResults;
