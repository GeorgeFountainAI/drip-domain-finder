import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { LOG_VALIDATION_SCENARIOS } from '../test-data/domain-scenarios';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://nfzmnkpepfrubjpifnna.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseService: any;

describe('Database Tests - Validation Logs', () => {
  
  beforeAll(async () => {
    if (!SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY required for database tests');
    }
    
    supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false }
    });
  });
  
  beforeEach(async () => {
    // Clean up test data before each test
    await supabaseService
      .from('validation_logs')
      .delete()
      .like('domain', 'test-%');
  });
  
  afterAll(async () => {
    // Clean up all test data
    await supabaseService
      .from('validation_logs')
      .delete()
      .like('domain', 'test-%');
  });
  
  describe('Log Structure and Validation', () => {
    
    it('should have correct table structure', async () => {
      const testLog = {
        domain: 'test-structure-validation.com',
        source: 'spaceship',
        status: 'error',
        message: 'Test log entry for structure validation'
      };
      
      const { error, data } = await supabaseService
        .from('validation_logs')
        .insert(testLog)
        .select();
      
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      
      const logEntry = data[0];
      
      // Required fields
      expect(logEntry.id).toBeDefined();
      expect(logEntry.domain).toBe(testLog.domain);
      expect(logEntry.source).toBe(testLog.source);
      expect(logEntry.status).toBe(testLog.status);
      expect(logEntry.message).toBe(testLog.message);
      expect(logEntry.created_at).toBeDefined();
      
      // Timestamps should be valid dates
      expect(new Date(logEntry.created_at)).toBeInstanceOf(Date);
      expect(new Date(logEntry.created_at).getTime()).toBeGreaterThan(0);
    });
    
    it('should enforce required fields', async () => {
      const invalidLogs = [
        { /* missing all fields */ },
        { domain: 'test.com' /* missing source, status */ },
        { source: 'spaceship', status: 'error' /* missing domain */ }
      ];
      
      for (const invalidLog of invalidLogs) {
        const { error } = await supabaseService
          .from('validation_logs')
          .insert(invalidLog);
        
        expect(error).toBeTruthy();
        expect(error.message).toMatch(/violates not-null constraint|null value in column/);
      }
    });
    
    it('should allow optional message field', async () => {
      const logWithoutMessage = {
        domain: 'test-no-message.com',
        source: 'rdap',
        status: 'timeout'
        // message is optional
      };
      
      const { error, data } = await supabaseService
        .from('validation_logs')
        .insert(logWithoutMessage)
        .select();
      
      expect(error).toBeNull();
      expect(data[0].message).toBeNull();
    });
  });
  
  describe('Log Entry Scenarios', () => {
    
    it('should log Spaceship API errors', async () => {
      const spaceshipError = {
        domain: 'test-spaceship-error.com',
        source: 'spaceship',
        status: 'error',
        message: 'API request failed: 500 Internal Server Error'
      };
      
      const { error, data } = await supabaseService
        .from('validation_logs')
        .insert(spaceshipError)
        .select();
      
      expect(error).toBeNull();
      expect(data[0].source).toBe('spaceship');
      expect(data[0].status).toBe('error');
      expect(data[0].message).toContain('API request failed');
    });
    
    it('should log RDAP conflicts', async () => {
      const rdapConflict = {
        domain: 'test-rdap-conflict.com',
        source: 'rdap',
        status: 'mismatch',
        message: 'Spaceship marked available but RDAP shows registered: active'
      };
      
      const { error, data } = await supabaseService
        .from('validation_logs')
        .insert(rdapConflict)
        .select();
      
      expect(error).toBeNull();
      expect(data[0].source).toBe('rdap');
      expect(data[0].status).toBe('mismatch');
      expect(data[0].message).toContain('Spaceship marked available but RDAP shows registered');
    });
    
    it('should log buy link validation failures', async () => {
      const buyLinkError = {
        domain: 'test-buy-link-404.com',
        source: 'buy_link',
        status: '404',
        message: 'Both cart and search URLs returned 404'
      };
      
      const { error, data } = await supabaseService
        .from('validation_logs')
        .insert(buyLinkError)
        .select();
      
      expect(error).toBeNull();
      expect(data[0].source).toBe('buy_link');
      expect(data[0].status).toBe('404');
    });
  });
  
  describe('Data Integrity and Constraints', () => {
    
    it('should allow multiple logs for same domain', async () => {
      const domain = 'test-multiple-logs.com';
      
      const logs = [
        { domain, source: 'spaceship', status: 'error', message: 'First error' },
        { domain, source: 'rdap', status: 'timeout', message: 'Second error' },
        { domain, source: 'buy_link', status: '404', message: 'Third error' }
      ];
      
      const { error, data } = await supabaseService
        .from('validation_logs')
        .insert(logs)
        .select();
      
      expect(error).toBeNull();
      expect(data).toHaveLength(3);
      
      // All should have same domain but different sources
      data.forEach((log, index) => {
        expect(log.domain).toBe(domain);
        expect(log.source).toBe(logs[index].source);
      });
    });
    
    it('should handle concurrent log insertions', async () => {
      const domain = 'test-concurrent.com';
      
      // Simulate concurrent insertions
      const promises = Array.from({ length: 5 }, (_, i) => 
        supabaseService
          .from('validation_logs')
          .insert({
            domain,
            source: 'test',
            status: 'concurrent',
            message: `Concurrent insert ${i}`
          })
      );
      
      const results = await Promise.all(promises);
      
      // All should succeed
      results.forEach(result => {
        expect(result.error).toBeNull();
      });
      
      // Verify all were inserted
      const { data: allLogs } = await supabaseService
        .from('validation_logs')
        .select('*')
        .eq('domain', domain);
      
      expect(allLogs).toHaveLength(5);
    });
  });
  
  describe('Query Performance and Indexing', () => {
    
    it('should query by domain efficiently', async () => {
      // Insert multiple logs
      const testLogs = Array.from({ length: 10 }, (_, i) => ({
        domain: `test-performance-${i}.com`,
        source: 'test',
        status: 'ok',
        message: `Performance test log ${i}`
      }));
      
      await supabaseService
        .from('validation_logs')
        .insert(testLogs);
      
      const start = performance.now();
      
      const { data, error } = await supabaseService
        .from('validation_logs')
        .select('*')
        .eq('domain', 'test-performance-5.com');
      
      const duration = performance.now() - start;
      
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(duration).toBeLessThan(100); // Should be fast
    });
    
    it('should query recent logs efficiently', async () => {
      const start = performance.now();
      
      const { data, error } = await supabaseService
        .from('validation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      const duration = performance.now() - start;
      
      expect(error).toBeNull();
      expect(duration).toBeLessThan(200); // Should be reasonably fast
    });
  });
  
  describe('Data Cleanup and Maintenance', () => {
    
    it('should support filtering by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      // Insert log with specific timestamp
      await supabaseService
        .from('validation_logs')
        .insert({
          domain: 'test-date-filter.com',
          source: 'test',
          status: 'ok',
          message: 'Date filter test'
        });
      
      const { data, error } = await supabaseService
        .from('validation_logs')
        .select('*')
        .eq('domain', 'test-date-filter.com')
        .gte('created_at', yesterday.toISOString());
      
      expect(error).toBeNull();
      expect(data).toHaveLength(1);
    });
    
    it('should support bulk operations', async () => {
      // Insert test data
      const bulkLogs = Array.from({ length: 5 }, (_, i) => ({
        domain: `test-bulk-${i}.com`,
        source: 'bulk_test',
        status: 'test',
        message: 'Bulk operation test'
      }));
      
      await supabaseService
        .from('validation_logs')
        .insert(bulkLogs);
      
      // Bulk delete
      const { error } = await supabaseService
        .from('validation_logs')
        .delete()
        .eq('source', 'bulk_test');
      
      expect(error).toBeNull();
      
      // Verify deletion
      const { data } = await supabaseService
        .from('validation_logs')
        .select('*')
        .eq('source', 'bulk_test');
      
      expect(data).toHaveLength(0);
    });
  });
  
  describe('Error Handling and Edge Cases', () => {
    
    it('should handle very long messages', async () => {
      const longMessage = 'x'.repeat(2000); // Very long message
      
      const { error, data } = await supabaseService
        .from('validation_logs')
        .insert({
          domain: 'test-long-message.com',
          source: 'test',
          status: 'error',
          message: longMessage
        })
        .select();
      
      expect(error).toBeNull();
      expect(data[0].message).toBe(longMessage);
    });
    
    it('should handle special characters in domain names', async () => {
      const specialDomains = [
        'test-üñíçødé.com',
        'test-emoji-🚀.com',
        'test-quotes-"domain".com',
        'test-sql-injection\'; DROP TABLE---.com'
      ];
      
      for (const domain of specialDomains) {
        const { error, data } = await supabaseService
          .from('validation_logs')
          .insert({
            domain,
            source: 'test',
            status: 'special_chars',
            message: 'Testing special characters'
          })
          .select();
        
        expect(error).toBeNull();
        expect(data[0].domain).toBe(domain);
      }
    });
  });
});