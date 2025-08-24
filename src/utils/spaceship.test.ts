import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildSpaceshipUrl, chunk, openInBatches } from './spaceship';

// Mock import.meta.env
const mockEnv = {
  VITE_SPACESHIP_AFF: '',
  VITE_SPACESHIP_CAMPAIGN: 'DomainDrip',
  VITE_CJ_DEEPLINK_BASE: '',
  DEV: false
};

vi.stubGlobal('import', {
  meta: {
    env: mockEnv
  }
});

describe('buildSpaceshipUrl', () => {
  beforeEach(() => {
    mockEnv.VITE_CJ_DEEPLINK_BASE = '';
  });

  it('should return direct search URL when no CJ base is set', () => {
    const result = buildSpaceshipUrl('example.com');
    expect(result).toBe('https://www.spaceship.com/domains?search=example.com&irgwc=1');
    expect(result).not.toContain('/domain-registration/results');
    expect(result).not.toContain('irclickid');
  });

  it('should build CJ deeplink when CJ base is provided', () => {
    mockEnv.VITE_CJ_DEEPLINK_BASE = 'https://spaceship.sjv.io/c/123/456/789?';
    const result = buildSpaceshipUrl('test.com');
    
    expect(result).toContain('spaceship.sjv.io');
    expect(result).toContain('u=');
    
    // Extract and decode the u parameter
    const url = new URL(result);
    const uParam = url.searchParams.get('u');
    expect(uParam).toBeTruthy();
    
    const decodedInner = decodeURIComponent(uParam!);
    expect(decodedInner).toBe('https://www.spaceship.com/domains?search=test.com&irgwc=1');
    expect(decodedInner).not.toContain('/domain-registration/results');
  });

  it('should handle CJ base that already ends with u=', () => {
    mockEnv.VITE_CJ_DEEPLINK_BASE = 'https://spaceship.sjv.io/c/123/456/789?u=';
    const result = buildSpaceshipUrl('test.com');
    
    const expectedInner = 'https://www.spaceship.com/domains?search=test.com&irgwc=1';
    expect(result).toBe(`https://spaceship.sjv.io/c/123/456/789?u=${encodeURIComponent(expectedInner)}`);
  });

  it('should add proper separator for CJ base without query params', () => {
    mockEnv.VITE_CJ_DEEPLINK_BASE = 'https://spaceship.sjv.io/c/123/456/789';
    const result = buildSpaceshipUrl('test.com');
    
    expect(result).toContain('?u=');
    expect(result).not.toContain('&u=');
  });

  it('should add proper separator for CJ base with existing query params', () => {
    mockEnv.VITE_CJ_DEEPLINK_BASE = 'https://spaceship.sjv.io/c/123/456/789?existing=param';
    const result = buildSpaceshipUrl('test.com');
    
    expect(result).toContain('&u=');
    expect(result).toContain('existing=param');
  });

  it('should handle domains with special characters', () => {
    const result = buildSpaceshipUrl('my-test domain.com');
    expect(result).toContain('my-test%20domain.com');
    expect(result).not.toContain('/domain-registration/results');
  });

  it('should generate valid URLs that can be parsed', () => {
    mockEnv.VITE_CJ_DEEPLINK_BASE = 'https://spaceship.sjv.io/c/123/456/789?';
    const result = buildSpaceshipUrl('example.com');
    expect(() => new URL(result)).not.toThrow();
    
    const url = new URL(result);
    expect(url.hostname).toBe('spaceship.sjv.io');
    expect(url.searchParams.get('u')).toBeTruthy();
  });

  it('should handle empty domain gracefully', () => {
    const result = buildSpaceshipUrl('');
    expect(result).toBe('https://www.spaceship.com/domains?search=&irgwc=1');
    expect(result).not.toContain('/domain-registration/results');
  });

  it('should never contain deprecated paths or parameters', () => {
    const domains = ['example.com', 'test.net', 'my-domain.org'];
    
    // Test with and without CJ base
    [undefined, 'https://spaceship.sjv.io/c/123/456/789?'].forEach(cjBase => {
      mockEnv.VITE_CJ_DEEPLINK_BASE = cjBase || '';
      
      domains.forEach(domain => {
        const url = buildSpaceshipUrl(domain);
        expect(url).not.toContain('/domain-registration/results');
        expect(url).not.toContain('irclickid');
        expect(url).toContain('irgwc=1'); // Should still have tracking
      });
    });
  });
});

describe('chunk', () => {
  it('should split array into chunks of specified size', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7];
    const result = chunk(arr, 3);
    expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
  });

  it('should handle empty array', () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it('should handle size larger than array', () => {
    const arr = [1, 2];
    const result = chunk(arr, 5);
    expect(result).toEqual([[1, 2]]);
  });
});

describe('openInBatches', () => {
  let mockOpenFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOpenFn = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should open URLs in batches with delay', async () => {
    mockEnv.VITE_CJ_DEEPLINK_BASE = 'https://spaceship.sjv.io/c/6354443/1794549/21274?';
    const domains = ['domain1.com', 'domain2.com', 'domain3.com'];
    
    const promise = openInBatches(domains, 2, 100, mockOpenFn);
    
    // First batch should open immediately
    expect(mockOpenFn).toHaveBeenCalledTimes(2);
    
    // Advance time to trigger second batch
    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();
    
    expect(mockOpenFn).toHaveBeenCalledTimes(3);
    
    await promise;
  });

  it('should remove duplicates and empty domains', async () => {
    const domains = ['domain1.com', '', 'domain1.com', '  ', 'domain2.com'];
    
    await openInBatches(domains, 5, 0, mockOpenFn);
    
    expect(mockOpenFn).toHaveBeenCalledTimes(2);
    expect(mockOpenFn).toHaveBeenCalledWith(expect.stringContaining('domain1.com'));
    expect(mockOpenFn).toHaveBeenCalledWith(expect.stringContaining('domain2.com'));
  });

  it('should use buildSpaceshipUrl for each domain', async () => {
    mockEnv.VITE_CJ_DEEPLINK_BASE = 'https://spaceship.sjv.io/c/6354443/1794549/21274?';
    const domains = ['test.com'];
    
    await openInBatches(domains, 1, 0, mockOpenFn);
    
    const expectedUrl = buildSpaceshipUrl('test.com');
    expect(mockOpenFn).toHaveBeenCalledWith(expectedUrl);
  });
});