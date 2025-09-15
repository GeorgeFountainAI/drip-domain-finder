import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildSpaceshipUrl, buildFallbackSearchUrl, chunk, openInBatches } from './spaceship';

describe('buildSpaceshipUrl', () => {
  it('should return hardcoded affiliate URL for all domains', () => {
    const result = buildSpaceshipUrl('example.com');
    expect(result).toContain('spaceship.sjv.io/APQy0D');
  });

  it('should handle domains with special characters', () => {
    const result = buildSpaceshipUrl('my-test domain.com');
    expect(result).toContain('my-test%20domain.com');
  });

  it('should generate valid URLs that can be parsed', () => {
    const result = buildSpaceshipUrl('example.com');
    expect(() => new URL(result)).not.toThrow();
    
    const url = new URL(result);
    expect(url.hostname).toBe('spaceship.sjv.io');
  });

  it('should handle empty domain gracefully', () => {
    const result = buildSpaceshipUrl('');
    expect(result).toContain('spaceship.sjv.io/APQy0D');
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

describe('buildFallbackSearchUrl', () => {
  it('should generate fallback search URL', () => {
    const result = buildFallbackSearchUrl('example.com');
    expect(result).toBe('https://www.spaceship.com/search?q=example.com');
  });

  it('should encode special characters in domain', () => {
    const result = buildFallbackSearchUrl('my-domain@test.com');
    expect(result).toBe('https://www.spaceship.com/search?q=my-domain%40test.com');
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
    const domains = ['test.com'];
    
    await openInBatches(domains, 1, 0, mockOpenFn);
    
    const expectedUrl = buildSpaceshipUrl('test.com');
    expect(mockOpenFn).toHaveBeenCalledWith(expectedUrl);
  });

  it('should handle errors with fallback URL', async () => {
    const domains = ['example.com'];
    let fallbackUsed = false;
    
    const errorOpenFn = vi.fn((url: string) => {
      if (url.includes('spaceship.sjv.io')) {
        throw new Error('Affiliate link failed');
      } else if (url.includes('search?q=')) {
        fallbackUsed = true;
      }
    });

    await openInBatches(domains, 1, 0, errorOpenFn);
    
    expect(errorOpenFn).toHaveBeenCalledTimes(2); // Original + fallback
    expect(fallbackUsed).toBe(true);
  });
});