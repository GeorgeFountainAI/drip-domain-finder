import React from 'react';
import { Shield } from 'lucide-react';

interface TrustBadgeProps {
  visible: boolean;
  className?: string;
}

const TrustBadge: React.FC<TrustBadgeProps> = ({ visible, className = '' }) => {
  if (!visible) return null;

  return (
    <div className={`
      fixed bottom-4 right-4 z-40
      flex items-center gap-2 
      bg-background/80 backdrop-blur-sm 
      border border-border/50
      rounded-lg px-3 py-2 
      text-xs text-muted-foreground 
      opacity-70 hover:opacity-90 
      transition-all duration-300
      pointer-events-none
      ${className}
    `}>
      <Shield className="w-3 h-3 text-primary" />
      <span className="font-medium">
        <span className="text-primary">Trust Layer</span> Certified
      </span>
      <span className="text-muted-foreground/70">•</span>
      <span className="text-muted-foreground/90">
        Tested. Logged. Safe to Buy.
      </span>
    </div>
  );
};

export default TrustBadge;