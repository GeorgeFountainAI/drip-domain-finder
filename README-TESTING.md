# 🧪 DomainDrip.AI Comprehensive Test Suite

> **Zero False Positives. Zero Broken Links. Zero Compromises.**

This test suite provides comprehensive regression testing for DomainDrip.AI to ensure 100% accuracy in domain availability detection and buy link validation.

## 🚀 Quick Start

### One-Click Full Test Suite
```bash
# Run complete regression suite
npm run test:regression

# Run in CI mode (continues on failures)
npm run test:ci
```

### Individual Test Categories
```bash
# Unit tests - Pure logic validation
npm run test:unit

# Integration tests - Edge function APIs
npm run test:integration  

# Component tests - React UI behavior
npm run test:components

# Database tests - Logging validation
npm run test:database

# E2E tests - Full user journeys
npm run test:e2e
```

## 🎯 Test Coverage

### 1. Domain Search Validation ✅
- ✓ Only truly available domains in results
- ✓ Registered domains (getsupermind.com) never shown
- ✓ FlipScore displayed only for available domains
- ✓ Strict Spaceship API parsing
- ✓ RDAP fallback conflict resolution

### 2. Buy Link Validation ✅
- ✓ "Buy Now" buttons only for available domains
- ✓ Pre-validation before window.open()
- ✓ 404 detection and prevention
- ✓ Graceful error handling
- ✓ User feedback on failures

### 3. Availability Logic ✅
- ✓ Multi-layer validation (Spaceship + RDAP)
- ✓ Edge case handling
- ✓ API timeout resilience
- ✓ Malformed response parsing
- ✓ Network failure graceful degradation

### 4. Logging System ✅
- ✓ Structured validation_logs entries
- ✓ API mismatch detection
- ✓ RDAP conflict logging
- ✓ Buy link failure tracking
- ✓ One-time per domain per day deduplication

## 📊 Test Data & Scenarios

### Critical Test Cases
```typescript
// Never should appear as available
REGISTERED_DOMAINS = [
  'getsupermind.com',
  'google.com', 
  'facebook.com'
]

// Should appear with buy buttons
AVAILABLE_DOMAINS = [
  'unique-test-domain-12345.com',
  'another-available-domain.net'
]

// Edge cases and conflicts
EDGE_CASES = [
  'spaceship-says-available-rdap-says-taken.com',
  'malformed-api-response.com',
  'rdap-timeout.com'
]
```

### FlipScore Validation
```typescript
FLIP_SCORE_TESTS = [
  { domain: 'ai.com', expectedRange: [90, 100] },
  { domain: 'verylongdomain.com', expectedRange: [20, 35] },
  { domain: 'test123.xyz', expectedRange: [30, 45] }
]
```

## 🔧 Environment Setup

### Required Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# E2E Testing
E2E_BASE_URL=http://localhost:5173

# CI Configuration  
CI=true
CONTINUE_ON_FAIL=true  # Continue tests after failures
SKIP_E2E=true          # Skip E2E tests if needed
```

### Local Development Setup
```bash
# Install dependencies
npm install

# Install Playwright browsers (for E2E)
npx playwright install

# Start development server
npm run dev

# Run tests in another terminal
npm run test:regression
```

## 📋 Test Categories Explained

### Unit Tests (`tests/unit/`)
**Pure logic validation - No external dependencies**

- ✅ Domain availability parsing logic
- ✅ FlipScore calculation accuracy  
- ✅ Buy button visibility rules
- ✅ Input validation and sanitization
- ✅ Edge case handling

**Run:** `npm run test:unit`

### Integration Tests (`tests/integration/`)
**Edge function and API validation**

- ✅ spaceship-domain-search function behavior
- ✅ validate-buy-link endpoint testing
- ✅ Mock API response handling
- ✅ RDAP fallback mechanisms
- ✅ Error handling and timeouts

**Run:** `npm run test:integration`

### Component Tests (`tests/components/`)
**React UI behavior and state management**

- ✅ DomainResults rendering logic
- ✅ Buy button interaction flows
- ✅ Selection and bulk operations
- ✅ Loading states and error handling
- ✅ Accessibility compliance

**Run:** `npm run test:components`

### Database Tests (`tests/database/`)
**Validation logging and data integrity**

- ✅ validation_logs table structure
- ✅ Log entry creation and validation
- ✅ Duplicate prevention logic
- ✅ Query performance validation
- ✅ Data cleanup and maintenance

**Run:** `npm run test:database`

### E2E Tests (`tests/e2e/`)
**Full user journey validation**

- ✅ Search → Results → Buy flow
- ✅ Domain availability accuracy in browser
- ✅ Buy link validation UX
- ✅ Error handling user experience
- ✅ Mobile and desktop responsiveness

**Run:** `npm run test:e2e`

## 🤖 CI/CD Integration

### GitHub Actions Workflow
The test suite runs automatically on:
- ✅ Every push to main/develop
- ✅ Every pull request
- ✅ Daily schedule (6 AM UTC)
- ✅ Manual workflow dispatch

### Test Matrix
- **Node.js:** 18.x
- **Browsers:** Chrome, Firefox, Safari, Mobile
- **Environments:** Development, Staging, Production
- **Timeouts:** Configured for CI optimization

### Deployment Gating
```yaml
# Tests must pass before deployment
needs: [unit-tests, integration-tests, e2e-tests]
if: github.ref == 'refs/heads/main'
```

## 🔍 Debugging & Troubleshooting

### Common Issues

**🚨 "getsupermind.com appears in results"**
```bash
# Check spaceship-domain-search function
npm run test:integration -- --grep "getsupermind"

# Verify RDAP fallback
npm run test:unit -- --grep "edge case"
```

**🚨 "Buy button validation failing"**
```bash  
# Test validate-buy-link function
npm run test:integration -- --grep "buy link"

# Check component behavior
npm run test:components -- --grep "buy button"
```

**🚨 "FlipScore showing for unavailable domains"**
```bash
# Validate domain filtering logic  
npm run test:unit -- --grep "FlipScore"
npm run test:components -- --grep "available domains"
```

### Verbose Debugging
```bash
# Run with detailed output
DEBUG=* npm run test:regression

# Run specific test with UI
npm run test:ui

# E2E with headed browser
npm run test:e2e-ui
```

### Log Analysis
```bash
# Check recent validation logs
node -e "
const { createClient } = require('@supabase/supabase-js');
// Query validation_logs for issues
"
```

## 📈 Performance & Metrics

### Test Performance Targets
- **Unit Tests:** < 5 seconds total
- **Integration Tests:** < 30 seconds total  
- **Component Tests:** < 15 seconds total
- **Database Tests:** < 10 seconds total
- **E2E Tests:** < 2 minutes total

### Coverage Targets
- **Statements:** > 80%
- **Functions:** > 80%  
- **Branches:** > 75%
- **Lines:** > 80%

### Critical Path Monitoring
- Domain search accuracy: 100%
- Buy link validation: 100%
- No false positives: 0 tolerance
- Page load performance: < 3 seconds

## 🛡️ Security Testing

### Input Sanitization
```javascript
const maliciousInputs = [
  '<script>alert("xss")</script>',
  '"; DROP TABLE domains; --',
  '../../../etc/passwd'
]
```

### API Security  
- ✅ SQL injection prevention
- ✅ XSS attack mitigation
- ✅ CSRF protection validation
- ✅ Rate limiting compliance

## 📚 Best Practices

### Writing New Tests
1. **Follow the AAA pattern:** Arrange, Act, Assert
2. **Use descriptive test names:** Should describe expected behavior
3. **Test edge cases:** Null, undefined, malformed data
4. **Mock external dependencies:** Keep tests isolated
5. **Assert meaningful outcomes:** Don't just test implementation

### Maintaining Tests  
1. **Keep tests fast:** Mock slow operations
2. **Update test data:** Reflect real-world scenarios  
3. **Clean up resources:** Prevent test pollution
4. **Document complex scenarios:** Help future maintainers
5. **Regular test review:** Remove obsolete tests

## 🎯 Success Criteria

### Pre-Deployment Checklist
- [ ] All unit tests pass (100%)
- [ ] All integration tests pass (100%) 
- [ ] All component tests pass (100%)
- [ ] All database tests pass (100%)
- [ ] E2E critical flows pass (100%)
- [ ] No validation log errors (24h)
- [ ] Performance targets met
- [ ] Security scans pass

### Production Readiness Gates
✅ **Zero false positives detected**  
✅ **Buy link validation 100% accurate**  
✅ **Domain availability logic verified**  
✅ **Logging system operational**  
✅ **User experience flows validated**  
✅ **Performance benchmarks met**

---

## 🆘 Support & Maintenance

### Getting Help
- **Documentation:** This README + inline code comments
- **Issues:** GitHub Issues with `testing` label  
- **CI Logs:** GitHub Actions workflow logs
- **Local Debugging:** `npm run test:ui` for interactive mode

### Regular Maintenance
- **Weekly:** Review validation logs for patterns
- **Monthly:** Update test data for new scenarios
- **Quarterly:** Performance benchmark review
- **As needed:** Add tests for new features

---

**🎉 Ready to ship with confidence!**

This comprehensive test suite ensures DomainDrip.AI delivers accurate, reliable domain search results with zero false positives and perfect buy link validation.