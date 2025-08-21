import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

const VIBES = ["Urban","Professional","Trendy","Slang","Luxury","Spiritual","Techy","Playful"] as const;
export type Vibe = typeof VIBES[number];

const VIBE_TOOLTIP =
  "Pick a vibe to shape the style of name ideas (e.g., Urban, Luxury, Techy). You can combine multiple.";

export default function VibeFilter({
  selected = [],
  onChange,
}: {
  selected?: Vibe[];
  onChange?: (next: Vibe[]) => void;
}) {
  const [local, setLocal] = useState<Vibe[]>(selected);
  
  // Sync with external changes
  useEffect(() => {
    setLocal(selected);
  }, [selected]);

  const toggle = (v: Vibe) => {
    const next = local.includes(v) ? local.filter(x => x !== v) : [...local, v];
    setLocal(next);
    onChange?.(next);
  };

  return (
    <TooltipProvider>
      <section data-testid="vibe-filter" className="mt-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-medium text-foreground">
            Style & Vibe
          </h3>
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

        <div className="flex flex-wrap gap-2">
          {VIBES.map((v) => {
            const active = local.includes(v);
            return (
              <button
                key={v}
                type="button"
                onClick={() => toggle(v)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
                  ${active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-foreground border-border hover:bg-muted hover:border-muted-foreground/20"
                  }
                `}
              >
                {v}
              </button>
            );
          })}
        </div>
      </section>
    </TooltipProvider>
  );
}