// Analytics tracking for DomainDrip user interactions

export interface DomainInteractionEvent {
  domain: string;
  timestamp: number;
  flipScore?: number;
  action: 'buy_click' | 'select' | 'deselect' | 'bulk_buy' | 'export_csv' | 'copy_domains';
  source: string;
}

export interface BulkActionEvent {
  action: 'bulk_buy' | 'export_csv' | 'copy_domains' | 'clear_selection';
  domainCount: number;
  domains: string[];
  timestamp: number;
}

class AnalyticsLogger {
  private events: (DomainInteractionEvent | BulkActionEvent)[] = [];
  private maxEvents = 1000;

  logDomainInteraction(event: Omit<DomainInteractionEvent, 'timestamp'>) {
    const fullEvent: DomainInteractionEvent = {
      ...event,
      timestamp: Date.now()
    };
    
    this.events.push(fullEvent);
    this.trimEvents();
    
    // Log to console for debugging
    console.log('📊 Domain Interaction:', fullEvent);
    
    // Could send to external analytics service here
    this.sendToAnalytics(fullEvent);
  }

  logBulkAction(event: Omit<BulkActionEvent, 'timestamp'>) {
    const fullEvent: BulkActionEvent = {
      ...event,
      timestamp: Date.now()
    };
    
    this.events.push(fullEvent);
    this.trimEvents();
    
    console.log('📊 Bulk Action:', fullEvent);
    this.sendToAnalytics(fullEvent);
  }

  private trimEvents() {
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  private sendToAnalytics(event: DomainInteractionEvent | BulkActionEvent) {
    // In a production app, send to analytics service
    // For now, just store in localStorage for persistence
    try {
      const stored = localStorage.getItem('domaindrip_analytics') || '[]';
      const existingEvents = JSON.parse(stored);
      existingEvents.push(event);
      
      // Keep last 100 events in localStorage
      const trimmed = existingEvents.slice(-100);
      localStorage.setItem('domaindrip_analytics', JSON.stringify(trimmed));
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  getEvents(): (DomainInteractionEvent | BulkActionEvent)[] {
    return [...this.events];
  }

  getEventsByDomain(domain: string): DomainInteractionEvent[] {
    return this.events.filter((event): event is DomainInteractionEvent => 
      'domain' in event && event.domain === domain
    );
  }

  getEventsByAction(action: string): (DomainInteractionEvent | BulkActionEvent)[] {
    return this.events.filter(event => event.action === action);
  }

  clear() {
    this.events = [];
    localStorage.removeItem('domaindrip_analytics');
  }
}

// Export singleton instance
export const analytics = new AnalyticsLogger();

// Convenience functions for common tracking scenarios
export const trackDomainBuyClick = (domain: string, flipScore?: number) => {
  analytics.logDomainInteraction({
    domain,
    flipScore,
    action: 'buy_click',
    source: 'spaceship_link'
  });
};

export const trackDomainSelection = (domain: string, selected: boolean, flipScore?: number) => {
  analytics.logDomainInteraction({
    domain,
    flipScore,
    action: selected ? 'select' : 'deselect', 
    source: 'checkbox'
  });
};

export const trackBulkBuy = (domains: string[]) => {
  analytics.logBulkAction({
    action: 'bulk_buy',
    domainCount: domains.length,
    domains
  });
};

export const trackExportCSV = (domains: string[]) => {
  analytics.logBulkAction({
    action: 'export_csv',
    domainCount: domains.length,
    domains
  });
};

export const trackCopyDomains = (domains: string[]) => {
  analytics.logBulkAction({
    action: 'copy_domains', 
    domainCount: domains.length,
    domains
  });
};

export const trackClearSelection = (domains: string[]) => {
  analytics.logBulkAction({
    action: 'clear_selection',
    domainCount: domains.length,
    domains
  });
};
