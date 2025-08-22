#!/usr/bin/env node

/**
 * DomainDrip.AI Comprehensive Test Suite Runner
 * 
 * Runs all tests in sequence with detailed reporting:
 * - Unit tests (domain logic, scoring)
 * - Integration tests (edge functions, APIs) 
 * - Component tests (React UI)
 * - Database tests (logging validation)
 * - E2E tests (full user flows)
 */

import { spawn } from 'child_process';
import chalk from 'chalk';
import { performance } from 'perf_hooks';

const TEST_SUITES = [
  {
    name: 'Unit Tests - Domain Logic',
    command: 'npm run test:unit',
    description: 'Pure logic for domain availability, FlipScore calculation'
  },
  {
    name: 'Integration Tests - Edge Functions', 
    command: 'npm run test:integration',
    description: 'Supabase functions, API responses, RDAP validation'
  },
  {
    name: 'Component Tests - React UI',
    command: 'npm run test:components',
    description: 'DomainResults, buy buttons, UI state management'
  },
  {
    name: 'Database Tests - Logging',
    command: 'npm run test:database', 
    description: 'Validation logs, structured data, deduplication'
  },
  {
    name: 'E2E Tests - User Flows',
    command: 'npm run test:e2e',
    description: 'Search to buy journey, critical path validation',
    optional: true
  }
];

async function runCommand(command, description) {
  return new Promise((resolve) => {
    console.log(chalk.blue(`\n🚀 Running: ${description}`));
    console.log(chalk.gray(`   Command: ${command}\n`));
    
    const startTime = performance.now();
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, { 
      stdio: 'inherit',
      shell: true 
    });
    
    child.on('close', (code) => {
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      
      if (code === 0) {
        console.log(chalk.green(`✅ PASSED (${duration}s): ${description}\n`));
        resolve({ success: true, duration, description });
      } else {
        console.log(chalk.red(`❌ FAILED (${duration}s): ${description}\n`));
        resolve({ success: false, duration, description, exitCode: code });
      }
    });
    
    child.on('error', (error) => {
      console.log(chalk.red(`🚨 ERROR: ${error.message}`));
      resolve({ success: false, duration: 0, description, error: error.message });
    });
  });
}

async function main() {
  console.log(chalk.cyan.bold(`
╔══════════════════════════════════════════════════╗
║            🧪 DomainDrip.AI Test Suite           ║
║              Comprehensive Regression             ║
╚══════════════════════════════════════════════════╝
`));

  const startTime = performance.now();
  const results = [];
  
  for (const suite of TEST_SUITES) {
    if (suite.optional && process.env.SKIP_E2E === 'true') {
      console.log(chalk.yellow(`⏭️  SKIPPED (optional): ${suite.description}`));
      continue;
    }
    
    const result = await runCommand(suite.command, suite.description);
    results.push(result);
    
    // Stop on first failure unless CONTINUE_ON_FAIL is set
    if (!result.success && process.env.CONTINUE_ON_FAIL !== 'true') {
      console.log(chalk.red('\n🛑 Stopping on first failure. Set CONTINUE_ON_FAIL=true to continue.\n'));
      break;
    }
  }
  
  // Final Report
  const totalDuration = ((performance.now() - startTime) / 1000).toFixed(2);
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(chalk.cyan.bold(`
╔══════════════════════════════════════════════════╗
║                   📊 TEST REPORT                 ║
╚══════════════════════════════════════════════════╝
`));
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const color = result.success ? chalk.green : chalk.red;
    console.log(color(`${icon} ${result.description} (${result.duration}s)`));
  });
  
  console.log(`\n📈 Summary: ${chalk.green(passed + ' passed')}, ${chalk.red(failed + ' failed')}`);
  console.log(`⏱️  Total time: ${totalDuration}s\n`);
  
  if (failed > 0) {
    console.log(chalk.red('🚨 REGRESSION DETECTED: Review failed tests before production deployment.'));
    process.exit(1);
  } else {
    console.log(chalk.green('🎉 ALL TESTS PASSED: Ready for production deployment!'));
    process.exit(0);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️  Test suite interrupted by user'));
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n⚠️  Test suite terminated'));
  process.exit(1);
});

main().catch(error => {
  console.error(chalk.red(`🚨 Test runner failed: ${error.message}`));
  process.exit(1);
});