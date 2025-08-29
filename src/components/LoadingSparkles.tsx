import { Sparkles } from "lucide-react";

export const LoadingSparkles = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        <Sparkles className="h-4 w-4 text-primary animate-sparkle" />
        <Sparkles className="h-3 w-3 text-primary/70 animate-sparkle-delay-1 absolute -top-1 -right-1" />
        <Sparkles className="h-2 w-2 text-primary/50 animate-sparkle-delay-2 absolute -bottom-1 -left-1" />
        <Sparkles className="h-3 w-3 text-primary/60 animate-sparkle-delay-3 absolute top-1 left-2" />
      </div>
      <span>Searching domains...</span>
    </div>
  );
};