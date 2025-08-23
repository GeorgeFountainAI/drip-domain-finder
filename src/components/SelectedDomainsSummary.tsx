import React from "react";
import { useSelectedDomains } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

const SelectedDomainsSummary = () => {
  const { selectedDomains, clear } = useSelectedDomains();

  if (selectedDomains.length === 0) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-w-[calc(100vw-2rem)] md:sticky md:top-4 md:bottom-auto md:right-auto bg-background/95 backdrop-blur-sm shadow-lg border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Selected Domains ({selectedDomains.length})
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            aria-label="Close"
            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {selectedDomains.map((domain) => (
            <div
              key={domain}
              className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1"
            >
              {domain}
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clear}
          className="w-full mt-3 text-xs"
        >
          Clear All
        </Button>
      </CardContent>
    </Card>
  );
};

export default SelectedDomainsSummary;