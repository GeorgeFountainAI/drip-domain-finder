import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildSpaceshipUrl, chunk, openInBatches } from './spaceship';

// Mock import.meta.env
const mockEnv = {
  VITE_SPACESHIP_AFF: '',
  VITE_SPACESHIP_CAMPAIGN: 'DomainDrip'
};

vi.stubGlobal('import', {
  meta: {
    env: mockEnv
  }
});

describe('buildSpaceshipUrl', () => {
  it('should return direct search URL with proper encoding', () => {
    const result = buildSpaceshipUrl('example.com');
    expect(result).toBe('https://spaceship.sjv.io/c/6354443/1794549/21274?url=https%3A//www.spaceship.com/domains/domain-registration/results%3Fsearch%3Dexample.com');
  });

  it('should contain valid CJ tracking parameter', () => {
    const result = buildSpaceshipUrl('test.com');
    // Should contain either 'aid=' or CJ tracking structure
    expect(result).toMatch(/spaceship\.sjv\.io.*6354443.*1794549.*21274/);
    expect(result).toContain('url=');
  });

  it('should handle domains with special characters', () => {
    const result = buildSpaceshipUrl('my-test domain.com');
    expect(result).toContain('spaceship.sjv.io');
    expect(result).toContain('url=');
    // Should properly encode the inner URL
    expect(decodeURIComponent(result.split('url=')[1])).toContain('my-test%20domain.com');
  });

  it('should always include affiliate tracking', () => {
    const domains = ['example.com', 'test.net', 'my-domain.org'];
    
    domains.forEach(domain => {
      const url = buildSpaceshipUrl(domain);
      expect(url).toMatch(/spaceship\.sjv\.io.*6354443.*1794549.*21274/);
      expect(url).toContain('url=');
    });
  });

  it('should generate valid URLs that can be parsed', () => {
    const result = buildSpaceshipUrl('example.com');
    expect(() => new URL(result)).not.toThrow();
    
    const url = new URL(result);
    expect(url.hostname).toBe('spaceship.sjv.io');
    expect(url.searchParams.get('url')).toBeTruthy();
  });

  it('should handle empty domain gracefully', () => {
    const result = buildSpaceshipUrl('');
    expect(result).toContain('spaceship.sjv.io');
    expect(result).toContain('url=');
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
    mockEnv.VITE_SPACESHIP_AFF = 'https://spaceship.sjv.io/c/6354443/1794549/21274';
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
    mockEnv.VITE_SPACESHIP_AFF = 'https://spaceship.sjv.io/c/6354443/1794549/21274';
    const domains = ['test.com'];
    
    await openInBatches(domains, 1, 0, mockOpenFn);
    
    const expectedUrl = buildSpaceshipUrl('test.com');
    expect(mockOpenFn).toHaveBeenCalledWith(expectedUrl);
  });
});