interface DomainScores {
  flipScore: number; // 1-100
  trendStrength: number; // 1-5 stars
}

/**
 * Mock domain scoring service that simulates GPT-based scoring
 * In production, this would call GPT API to analyze brandability and trends
 */
export class DomainScoringService {
  
  /**
   * Generate flip score (brandability + resale potential)
   * Mock logic based on domain characteristics
   */
  private generateFlipScore(domainName: string): number {
    const baseName = domainName.split('.')[0];
    let score = 50; // Base score
    
    // Length factor (shorter is better for brandability)
    if (baseName.length <= 6) score += 20;
    else if (baseName.length <= 10) score += 10;
    else if (baseName.length > 15) score -= 20;
    
    // Common patterns that increase brandability
    const brandablePatterns = [
      /^[a-z]{3,8}$/, // Short, simple words
      /ly$/, // Ends with 'ly'
      /^get/, // Starts with 'get'
      /^my/, // Starts with 'my'
      /app$/, // Ends with 'app'
      /hub$/, // Ends with 'hub'
      /^pro/, // Starts with 'pro'
    ];
    
    brandablePatterns.forEach(pattern => {
      if (pattern.test(baseName.toLowerCase())) {
        score += 15;
      }
    });
    
    // Dictionary words boost score
    const commonWords = ['shop', 'store', 'tech', 'digital', 'smart', 'quick', 'fast', 'easy', 'simple'];
    if (commonWords.some(word => baseName.toLowerCase().includes(word))) {
      score += 10;
    }
    
    // Penalize numbers and hyphens
    if (/\d/.test(baseName)) score -= 15;
    if (/-/.test(baseName)) score -= 10;
    
    // Random factor to simulate market variability
    score += Math.floor(Math.random() * 20) - 10;
    
    return Math.max(1, Math.min(100, score));
  }
  
  /**
   * Generate trend strength (keyword popularity)
   * Mock logic based on domain keywords
   */
  private generateTrendStrength(domainName: string): number {
    const baseName = domainName.split('.')[0].toLowerCase();
    let strength = 3; // Base strength (3 stars)
    
    // High-trend keywords
    const hotKeywords = ['ai', 'crypto', 'nft', 'meta', 'cloud', 'app', 'tech', 'digital', 'smart'];
    const mediumKeywords = ['shop', 'store', 'buy', 'sell', 'market', 'hub', 'pro', 'online'];
    const timelessKeywords = ['home', 'health', 'food', 'travel', 'news', 'blog'];
    
    if (hotKeywords.some(keyword => baseName.includes(keyword))) {
      strength = 5;
    } else if (mediumKeywords.some(keyword => baseName.includes(keyword))) {
      strength = 4;
    } else if (timelessKeywords.some(keyword => baseName.includes(keyword))) {
      strength = 3;
    } else if (baseName.length > 15 || /\d{3,}/.test(baseName)) {
      strength = 2;
    }
    
    // Random variation
    const variation = Math.random() > 0.5 ? 1 : -1;
    if (Math.random() > 0.7) {
      strength += variation;
    }
    
    return Math.max(1, Math.min(5, strength));
  }
  
  /**
   * Get both scores for a domain
   * In production, this would make API calls to GPT
   */
  async getScores(domainName: string): Promise<DomainScores> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    return {
      flipScore: this.generateFlipScore(domainName),
      trendStrength: this.generateTrendStrength(domainName)
    };
  }
  
  /**
   * Batch scoring for multiple domains
   */
  async getBatchScores(domainNames: string[]): Promise<Map<string, DomainScores>> {
    const scores = new Map<string, DomainScores>();
    
    // Process in batches to simulate realistic API behavior
    const batchSize = 5;
    for (let i = 0; i < domainNames.length; i += batchSize) {
      const batch = domainNames.slice(i, i + batchSize);
      const batchPromises = batch.map(async (domain) => {
        const score = await this.getScores(domain);
        return [domain, score] as const;
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(([domain, score]) => {
        scores.set(domain, score);
      });
    }
    
    return scores;
  }
}

// Export singleton instance
export const domainScoringService = new DomainScoringService();

export type { DomainScores };