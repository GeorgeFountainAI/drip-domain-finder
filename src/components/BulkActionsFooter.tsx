import React from "react";
import { useSelectedDomains, useSearchStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Download, Copy, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackBulkBuy, trackExportCSV, trackCopyDomains, trackClearSelection } from "@/utils/analytics";
import { toast } from "sonner";
import { getNamecheapLink } from "@/utils/getNamecheapLink";

const BulkActionsFooter = () => {
  const { selectedDomains, clear } = useSelectedDomains();
  const { results } = useSearchStore();

  // Don't render if no domains selected
  if (selectedDomains.length === 0) {
    return null;
  }

  const handleBuyAll = async () => {
    const selectedResults = results.filter(r => 
      selectedDomains.includes(r.domain) && r.available && r.domain !== 'getsupermind.com'
    );
    
    const domains = selectedResults.map(r => r.domain);
    trackBulkBuy(domains);
    
    for (const domain of domains) {
      try {
        const { data, error } = await supabase.functions.invoke('validate-buy-link', {
          body: { domain }
        });
        
        if (!error && data?.ok) {
          const url = getNamecheapLink(domain);
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      } catch (error) {
        console.error('Failed to validate buy link for', domain, error);
      }
    }
    
    toast.success(`Opening ${domains.length} domains in new tabs`);
  };

  const handleExportCSV = () => {
    // Get selected domain data from results
    const selectedData = results.filter(result => 
      selectedDomains.includes(result.domain) && result.available
    );

    const domains = selectedData.map(r => r.domain);
    trackExportCSV(domains);

    // Create CSV content
    const headers = ['domain', 'price', 'flipScore'];
    const csvRows = [
      headers.join(','),
      ...selectedData.map(item => [
        item.domain,
        item.price?.toFixed(2) || '0.00',
        item.flipScore || 'N/A'
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
    
    toast.success(`Exported ${selectedData.length} domains to CSV`);
  };

  const handleCopyToClipboard = async () => {
    const domainNames = results
      .filter(r => selectedDomains.includes(r.domain) && r.available)
      .map(r => r.domain);
    
    trackCopyDomains(domainNames);
    
    try {
      await navigator.clipboard.writeText(domainNames.join(', '));
      toast.success('Domain names copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = domainNames.join(', ');
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Domain names copied to clipboard');
    }
  };

  const handleClear = () => {
    trackClearSelection([...selectedDomains]);
    clear();
    toast.success('Selection cleared');
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
            onClick={handleClear}
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