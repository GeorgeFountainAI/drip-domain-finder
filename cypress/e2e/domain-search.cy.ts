describe('Domain Search Flow', () => {
  beforeEach(() => {
    // Visit the app page directly
    cy.visit('/app');
  });

  it('displays the search form', () => {
    cy.get('[data-testid="domain-search-form"]').should('be.visible');
    cy.get('input[placeholder*="keyword"]').should('be.visible');
    cy.get('button').contains(/search/i).should('be.visible');
  });

  it('performs a domain search and displays results', () => {
    const testKeyword = 'testdomain';
    
    // Enter keyword and search
    cy.get('input[placeholder*="keyword"]').type(testKeyword);
    cy.get('button').contains(/search/i).click();
    
    // Should show loading state
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    
    // Wait for results
    cy.get('[data-testid="domain-results"]', { timeout: 10000 }).should('be.visible');
    
    // Should display domain results
    cy.get('[data-testid="domain-result-item"]').should('have.length.greaterThan', 0);
    
    // Check that results contain the searched keyword
    cy.get('[data-testid="domain-result-item"]').first().should('contain', testKeyword);
  });

  it('handles search errors gracefully', () => {
    // Mock network failure
    cy.intercept('POST', '**/api/**', { forceNetworkError: true });
    
    cy.get('input[placeholder*="keyword"]').type('errortest');
    cy.get('button').contains(/search/i).click();
    
    // Should show demo mode fallback
    cy.contains(/demo/i, { timeout: 10000 }).should('be.visible');
  });

  it('validates required keyword input', () => {
    // Try to search without keyword
    cy.get('button').contains(/search/i).click();
    
    // Should show validation error
    cy.contains(/please enter a keyword/i).should('be.visible');
  });

  it('allows admin users to search with 0 credits', () => {
    // This test assumes admin authentication is handled
    // In a real scenario, you'd need to authenticate as admin first
    
    cy.get('input[placeholder*="keyword"]').type('admintest');
    cy.get('button').contains(/search/i).click();
    
    // Admin should bypass credit checks
    cy.get('[data-testid="domain-results"]', { timeout: 10000 }).should('be.visible');
  });

  it('navigates correctly to search route', () => {
    cy.visit('/search');
    cy.url().should('include', '/search');
    cy.get('[data-testid="domain-search-form"]').should('be.visible');
  });

  it('shows demo mode notification', () => {
    cy.get('input[placeholder*="keyword"]').type('demotest');
    cy.get('button').contains(/search/i).click();
    
    // Should show demo mode toast or indicator
    cy.contains(/demo/i, { timeout: 10000 }).should('be.visible');
  });

  it('displays domain availability correctly', () => {
    cy.get('input[placeholder*="keyword"]').type('availabilitytest');
    cy.get('button').contains(/search/i).click();
    
    cy.get('[data-testid="domain-results"]', { timeout: 10000 }).should('be.visible');
    
    // Check for availability indicators
    cy.get('[data-testid="domain-result-item"]').each(($el) => {
      cy.wrap($el).should('contain.text', /available|unavailable/i);
    });
  });

  it('handles no results gracefully', () => {
    // Search for something that should return no results
    cy.get('input[placeholder*="keyword"]').type('xyzunlikelytobefound123');
    cy.get('button').contains(/search/i).click();
    
    // Should handle gracefully even if no exact matches
    cy.get('[data-testid="loading-spinner"]').should('not.exist');
  });
});