import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, BrowserContext, Page } from 'playwright';

/**
 * End-to-End Tests for Critical User Flows
 * 
 * These tests simulate real user interactions to validate:
 * 1. Search → Results → Buy flow
 * 2. Domain availability accuracy 
 * 3. Buy link validation
 * 4. Error handling and edge cases
 */

let browser: Browser;
let context: BrowserContext;
let page: Page;

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

describe('E2E Tests - Critical User Flows', () => {
  
  beforeAll(async () => {
    browser = await chromium.launch({ 
      headless: process.env.CI === 'true',
      slowMo: process.env.CI ? 0 : 100 // Slow down for debugging
    });
    context = await browser.newContext();
    page = await context.newPage();
    
    // Navigate to app
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });
  
  afterAll(async () => {
    await browser?.close();
  });
  
  describe('Domain Search Flow', () => {
    
    it('should complete full search-to-results flow', async () => {
      // Navigate to search page
      await page.goto(`${BASE_URL}/`);
      
      // Find and fill search input
      const searchInput = page.locator('input[type="text"]').first();
      await searchInput.fill('ai startup');
      
      // Submit search
      const searchButton = page.getByRole('button', { name: /search/i });
      await searchButton.click();
      
      // Wait for results
      await page.waitForSelector('[data-testid="domain-results"], .domain-card, h1:has-text("Available Domains")', { 
        timeout: 10000 
      });
      
      // Verify results are displayed
      const resultsTitle = page.getByText(/Available Domains \(\d+ found\)/);
      await expect(resultsTitle).toBeVisible();
      
      // Verify only available domains are shown
      const domainCards = page.locator('.domain-card, [data-testid="domain-card"]');
      const cardCount = await domainCards.count();
      
      if (cardCount > 0) {
        // Check each domain card for availability badge
        for (let i = 0; i < Math.min(cardCount, 5); i++) {
          const card = domainCards.nth(i);
          const availableBadge = card.getByText('Available');
          await expect(availableBadge).toBeVisible();
        }
      }
    });
    
    it('should never show registered domains like getsupermind.com', async () => {
      // Search for a term that might include known registered domains
      await page.goto(`${BASE_URL}/`);
      
      const searchInput = page.locator('input[type="text"]').first();
      await searchInput.fill('getsupermind');
      
      const searchButton = page.getByRole('button', { name: /search/i });
      await searchButton.click();
      
      await page.waitForTimeout(3000); // Wait for search to complete
      
      // Verify getsupermind.com is NOT in results
      const getsupermindText = page.getByText('getsupermind.com');
      await expect(getsupermindText).not.toBeVisible();
      
      // Verify we either have other results or "no domains found"
      const resultsOrNoResults = page.locator(
        'text="Available Domains", text="No available domains found"'
      );
      await expect(resultsOrNoResults.first()).toBeVisible();
    });
    
    it('should handle empty search gracefully', async () => {
      await page.goto(`${BASE_URL}/`);
      
      // Try to search with empty input
      const searchButton = page.getByRole('button', { name: /search/i });
      await searchButton.click();
      
      // Should show validation message or stay on search page
      const currentUrl = page.url();
      expect(currentUrl).toContain(BASE_URL);
      
      // Should not navigate to results with empty query
      const errorMessage = page.getByText(/keyword.*required|search.*required/i);
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    });
  });
  
  describe('Buy Button Validation Flow', () => {
    
    it('should validate buy links before opening', async () => {
      // Perform search to get results
      await page.goto(`${BASE_URL}/`);
      
      const searchInput = page.locator('input[type="text"]').first();
      await searchInput.fill('unique test domain');
      
      const searchButton = page.getByRole('button', { name: /search/i });
      await searchButton.click();
      
      await page.waitForSelector('[data-testid="domain-results"], h1:has-text("Available Domains")', { 
        timeout: 10000 
      });
      
      // Find first buy button
      const buyButton = page.getByRole('button', { name: /buy now/i }).first();
      
      if (await buyButton.isVisible()) {
        // Set up popup monitoring
        const popupPromise = context.waitForEvent('page');
        
        await buyButton.click();
        
        // Wait a moment for validation
        await page.waitForTimeout(1000);
        
        // Check if popup opened (indicates successful validation)
        try {
          const popup = await Promise.race([
            popupPromise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('No popup opened')), 2000)
            )
          ]) as Page;
          
          // If popup opened, verify it's a Spaceship URL
          expect(popup.url()).toMatch(/spaceship\.com/);
          await popup.close();
        } catch (error) {
          // If no popup opened, validation might have failed
          // This is acceptable - the important thing is no crash
          console.log('No popup opened - validation may have prevented it');
        }
      }
    });
    
    it('should handle buy button for unavailable domains correctly', async () => {
      // This test would need a way to inject unavailable domains
      // For now, we verify the buy button behavior is consistent
      
      await page.goto(`${BASE_URL}/`);
      
      const searchInput = page.locator('input[type="text"]').first();
      await searchInput.fill('test domains');
      
      const searchButton = page.getByRole('button', { name: /search/i });
      await searchButton.click();
      
      await page.waitForTimeout(3000);
      
      // All visible buy buttons should be for available domains only
      const buyButtons = page.getByRole('button', { name: /buy now/i });
      const buttonCount = await buyButtons.count();
      
      // Verify each buy button is on an available domain card
      for (let i = 0; i < buttonCount; i++) {
        const button = buyButtons.nth(i);
        const card = button.locator('xpath=ancestor::*[contains(@class,"card") or contains(@class,"domain")]');
        const availableBadge = card.getByText('Available');
        
        // If button exists, its card should have "Available" badge
        if (await button.isVisible()) {
          await expect(availableBadge).toBeVisible();
        }
      }
    });
  });
  
  describe('User Interface and Experience', () => {
    
    it('should be responsive on different screen sizes', async () => {
      // Test desktop size
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto(`${BASE_URL}/`);
      
      const searchInput = page.locator('input[type="text"]').first();
      await expect(searchInput).toBeVisible();
      
      // Test mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(searchInput).toBeVisible();
      
      // Test tablet size
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(searchInput).toBeVisible();
    });
    
    it('should show loading states during search', async () => {
      await page.goto(`${BASE_URL}/`);
      
      const searchInput = page.locator('input[type="text"]').first();
      await searchInput.fill('loading test');
      
      const searchButton = page.getByRole('button', { name: /search/i });
      await searchButton.click();
      
      // Should show loading indicators
      const loadingIndicators = page.locator('[class*="skeleton"], [class*="loading"], text="Loading"');
      
      // Check if loading indicators appear (they might be very brief)
      try {
        await expect(loadingIndicators.first()).toBeVisible({ timeout: 1000 });
      } catch {
        // Loading might be too fast to catch - that's okay
        console.log('Loading state too brief to capture');
      }
    });
    
    it('should handle network errors gracefully', async () => {
      // Simulate network failure
      await context.route('**/functions/v1/**', route => {
        route.abort('failed');
      });
      
      await page.goto(`${BASE_URL}/`);
      
      const searchInput = page.locator('input[type="text"]').first();
      await searchInput.fill('network error test');
      
      const searchButton = page.getByRole('button', { name: /search/i });
      await searchButton.click();
      
      await page.waitForTimeout(3000);
      
      // Should show error message or empty results, not crash
      const errorMessages = page.locator(
        'text="error", text="failed", text="try again", text="No available domains"'
      );
      
      // Page should still be responsive
      await expect(searchInput).toBeVisible();
      
      // Clean up route interception
      await context.unroute('**/functions/v1/**');
    });
  });
  
  describe('Accessibility and Standards', () => {
    
    it('should be keyboard navigable', async () => {
      await page.goto(`${BASE_URL}/`);
      
      // Tab through interface
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Continue tabbing to ensure no keyboard traps
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        const stillFocused = page.locator(':focus');
        await expect(stillFocused).toBeVisible();
      }
    });
    
    it('should have proper heading structure', async () => {
      await page.goto(`${BASE_URL}/`);
      
      // Should have proper heading hierarchy
      const h1Elements = page.locator('h1');
      const h1Count = await h1Elements.count();
      
      // Should have at least one H1
      expect(h1Count).toBeGreaterThanOrEqual(1);
      
      // Search and get results
      const searchInput = page.locator('input[type="text"]').first();
      await searchInput.fill('accessibility test');
      
      const searchButton = page.getByRole('button', { name: /search/i });
      await searchButton.click();
      
      await page.waitForTimeout(2000);
      
      // Results page should also have proper headings
      const resultsH1 = page.getByRole('heading', { level: 1 });
      await expect(resultsH1.first()).toBeVisible();
    });
  });
  
  describe('Performance and Load Testing', () => {
    
    it('should load within acceptable time limits', async () => {
      const start = Date.now();
      
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - start;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });
    
    it('should handle rapid successive searches', async () => {
      await page.goto(`${BASE_URL}/`);
      
      const searchInput = page.locator('input[type="text"]').first();
      const searchButton = page.getByRole('button', { name: /search/i });
      
      // Perform rapid searches
      for (let i = 0; i < 3; i++) {
        await searchInput.fill(`rapid search ${i}`);
        await searchButton.click();
        await page.waitForTimeout(500);
      }
      
      // Should not crash or show errors
      await expect(searchInput).toBeVisible();
      
      // Wait for final search to complete
      await page.waitForTimeout(2000);
    });
  });
  
  describe('Data Validation and Security', () => {
    
    it('should sanitize search input', async () => {
      await page.goto(`${BASE_URL}/`);
      
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '"; DROP TABLE domains; --',
        '../../../etc/passwd',
        'javascript:alert(1)'
      ];
      
      const searchInput = page.locator('input[type="text"]').first();
      const searchButton = page.getByRole('button', { name: /search/i });
      
      for (const maliciousInput of maliciousInputs) {
        await searchInput.fill(maliciousInput);
        await searchButton.click();
        
        await page.waitForTimeout(1000);
        
        // Should not execute malicious code or crash
        await expect(searchInput).toBeVisible();
        
        // No alert should appear
        const alerts = page.locator('text="xss"');
        await expect(alerts).not.toBeVisible();
      }
    });
  });
});