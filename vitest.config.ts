import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'coverage/'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    include: [
      'tests/**/*.test.{ts,tsx}',
      'src/**/*.test.{ts,tsx}'
    ],
    exclude: [
      'tests/e2e/**/*',
      'node_modules/',
      'dist/'
    ],
    testTimeout: 10000,
    reporter: process.env.CI ? 'junit' : 'verbose',
    outputFile: process.env.CI ? 'test-results/unit-results.xml' : undefined
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});