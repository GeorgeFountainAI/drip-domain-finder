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
  beforeEach(() => {
    mockEnv.VITE_SPACESHIP_AFF = '';
  });

  it('should return default page when domain is empty or null', () => {
    expect(buildSpaceshipUrl('')).toBe('https://www.spaceship.com/domains/domain-registration/');
    expect(buildSpaceshipUrl('   ')).toBe('https://www.spaceship.com/domains/domain-registration/');
  });

  it('should return direct search URL when no affiliate link is set', () => {
    const result = buildSpaceshipUrl('example.com');
    expect(result).toBe('https://www.spaceship.com/domains/domain-registration/results?search=example.com');
  });

  it('should wrap with affiliate link when VITE_SPACESHIP_AFF is set', () => {
    mockEnv.VITE_SPACESHIP_AFF = 'https://spaceship.sjv.io/c/6354443/1794549/21274';
    const result = buildSpaceshipUrl('example.com');
    const expectedInnerUrl = 'https://www.spaceship.com/domains/domain-registration/results?search=example.com';
    expect(result).toBe(`https://spaceship.sjv.io/c/6354443/1794549/21274?u=${encodeURIComponent(expectedInnerUrl)}`);
  });

  it('should handle domains with spaces and special characters', () => {
    mockEnv.VITE_SPACESHIP_AFF = 'https://spaceship.sjv.io/c/6354443/1794549/21274';
    const result = buildSpaceshipUrl('my test domain.com');
    const expectedInnerUrl = 'https://www.spaceship.com/domains/domain-registration/results?search=my%20test%20domain.com';
    expect(result).toBe(`https://spaceship.sjv.io/c/6354443/1794549/21274?u=${encodeURIComponent(expectedInnerUrl)}`);
  });

  it('should ignore invalid affiliate URLs', () => {
    mockEnv.VITE_SPACESHIP_AFF = 'not-a-url';
    const result = buildSpaceshipUrl('example.com');
    expect(result).toBe('https://www.spaceship.com/domains/domain-registration/results?search=example.com');
  });

  it('should handle exceptions gracefully', () => {
    // Mock a scenario where encodeURIComponent might throw
    const originalEncode = global.encodeURIComponent;
    global.encodeURIComponent = vi.fn(() => {
      throw new Error('Encoding error');
    });

    const result = buildSpaceshipUrl('example.com');
    expect(result).toBe('https://www.spaceship.com/domains/domain-registration/');

    global.encodeURIComponent = originalEncode;
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