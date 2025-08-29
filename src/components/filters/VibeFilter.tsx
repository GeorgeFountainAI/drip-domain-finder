import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

// Reordered as per user request
const VIBES = ["Professional", "Urban", "Trendy", "Luxury", "Playful", "Slang", "Spiritual", "Techy"] as const;
export type Vibe = typeof VIBES[number];

const VIBE_TOOLTIP = "Choose a style to shape the vibe of domain suggestions (e.g., Professional, Urban, Trendy).";

export default function VibeFilter({
  selected = "",
  onChange,
}: {
  selected?: string;
  onChange?: (vibe: string) => void;
}) {
  return (
    <TooltipProvider>
      <div data-testid="vibe-filter" className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">
            Choose Style & Vibe (optional)
          </label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-3.5 w-3.5" />
                <span className="sr-only">What are vibes?</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-center">
              <p className="text-sm">{VIBE_TOOLTIP}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Select 
          value={selected || "none"} 
          onValueChange={(value) => onChange?.(value === "none" ? "" : value)}
        >
          <SelectTrigger className="mobile-touch-target">
            <SelectValue placeholder="Select style (optional)" />
          </SelectTrigger>
          <SelectContent className="mobile-dropdown">
            <SelectItem value="none">None (all styles)</SelectItem>
            {VIBES.map(vibe => (
              <SelectItem key={vibe} value={vibe}>{vibe}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </TooltipProvider>
  );
}