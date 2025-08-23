import React from "react";
import { useSelectedDomains, useSearchStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Download, Copy, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BulkActionsFooter = () => {
  const { selectedDomains, clear } = useSelectedDomains();
  const { results } = useSearchStore();

  // Don't render if no domains selected
  if (selectedDomains.length === 0) {
    return null;
  }

  const buildBuyLink = (domain: string) => {
    return `https://www.spaceship.com/domains/domain-registration/results?search=${domain}&irclickid=Wc7xihyLMxycUY8QQ-Spo2Tf4Ukp26X0lyT-3Uk0`;
  };

  const handleBuyAll = async () => {
    for (const domain of selectedDomains) {
      try {
        const { data, error } = await supabase.functions.invoke('validate-buy-link', {
          body: { domain }
        });
        
        if (!error && data?.ok) {
          const url = buildBuyLink(domain);
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      } catch (error) {
        console.error('Failed to validate buy link for', domain, error);
      }
    }
  };

  const handleExportCSV = () => {
    // Get selected domain data from results
    const selectedData = results.filter(result => 
      selectedDomains.includes(result.domain)
    );

    // Create CSV content
    const headers = ['domain', 'price', 'flipScore'];
    const csvRows = [
      headers.join(','),
      ...selectedData.map(item => [
        item.domain,
        item.price?.toFixed(2) || '0.00',
        item.flipScore || '0'
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `selected-domains-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(selectedDomains.join(', '));
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = selectedDomains.join(', ');
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="fixed bottom-0 w-full z-50 bg-white shadow-lg p-4 rounded-t-xl border-t border-gray-200 transition-all duration-300 ease-in-out animate-fade-in">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">
            {selectedDomains.length} domain{selectedDomains.length !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={handleBuyAll}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm"
            aria-label="Buy all selected domains"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Buy All</span>
          </Button>
          
          <Button
            onClick={handleExportCSV}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm"
            aria-label="Export selected domains to CSV"
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          
          <Button
            onClick={handleCopyToClipboard}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm"
            aria-label="Copy selected domains to clipboard"
          >
            <Copy className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
          
          <Button
            onClick={clear}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm"
            aria-label="Clear all selected domains"
          >
            <X className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsFooter;