import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analytics, trackDomainBuyClick, trackDomainSelection, trackBulkBuy } from './analytics';

describe('Analytics Logger', () => {
  beforeEach(() => {
    analytics.clear();
  });

  describe('Domain Interaction Tracking', () => {
    it('should log domain buy clicks with correct data', () => {
      trackDomainBuyClick('example.com', 85);
      
      const events = analytics.getEvents();
      expect(events).toHaveLength(1);
      
      const event = events[0] as any;
      expect(event).toMatchObject({
        domain: 'example.com',
        action: 'buy_click',
        source: 'spaceship_link',
        flipScore: 85
      });
      expect(event.timestamp).toBeTypeOf('number');
    });

    it('should log domain selection and deselection', () => {
      trackDomainSelection('test.com', true, 92);
      trackDomainSelection('test.com', false, 92);
      
      const events = analytics.getEvents();
      expect(events).toHaveLength(2);
      
      expect(events[0].action).toBe('select');
      expect(events[1].action).toBe('deselect');
    });

    it('should handle domains without flip scores', () => {
      trackDomainBuyClick('simple.com');
      
      const events = analytics.getEvents();
      const event = events[0] as any;
      expect(event).toMatchObject({
        domain: 'simple.com',
        action: 'buy_click',
        source: 'spaceship_link'
      });
      expect(event.flipScore).toBeUndefined();
    });
  });

  describe('Event Management', () => {
    it('should clear all events', () => {
      trackDomainBuyClick('test.com');
      trackBulkBuy(['domain1.com', 'domain2.com']);
      
      expect(analytics.getEvents()).toHaveLength(2);
      
      analytics.clear();
      
      expect(analytics.getEvents()).toHaveLength(0);
    });
  });
});
