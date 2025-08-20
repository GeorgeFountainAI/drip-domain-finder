import { useState } from "react";

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
  const toggle = (v: Vibe) => {
    const next = local.includes(v) ? local.filter(x => x !== v) : [...local, v];
    setLocal(next);
    onChange?.(next);
  };

  return (
    <section data-testid="vibe-filter" className="mt-4" aria-describedby="vibe-help">
      <h3
        className="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100"
        title={VIBE_TOOLTIP}
      >
        Vibe <span aria-hidden className="ml-2 text-xs text-gray-500">?</span>
      </h3>
      <p id="vibe-help" className="sr-only">{VIBE_TOOLTIP}</p>

      <div className="flex flex-wrap gap-2">
        {VIBES.map((v) => {
          const active = local.includes(v);
          return (
            <button
              key={v}
              type="button"
              onClick={() => toggle(v)}
              aria-pressed={active}
              className={`px-3 py-1 rounded-full border text-sm md:text-base transition
                ${active
                  ? "border-gray-900 bg-gray-100 dark:bg-gray-800 dark:border-gray-100"
                  : "border-gray-400 hover:border-gray-700 dark:border-gray-500 dark:hover:border-gray-300"}`}
            >
              {v}
            </button>
          );
        })}
      </div>
    </section>
  );
}