import { defineConfig } from 'vitest/config'
import type { UserConfig } from 'vitest/config'

const config: UserConfig = {
  test: {
    // Test environment
    environment: 'node', // or 'jsdom' for browser-like environment
    
    // Coverage configuration
    coverage: {
      provider: 'v8', // or 'istanbul' if you prefer
      enabled: true,
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc}.config.*',
        '**/*.d.ts',
        '**/*.spec.{js,ts}',
        '**/*.test.{js,ts}',
      ],
      all: false, // show just those with coverage
    },

    // Test files pattern
    include: ['**/*.{test,spec}.{js,ts}'],

    // Global setup/teardown
    // setupFiles: ['./test/setup.ts'],
    // globalSetup: ['./test/globalSetup.ts'],

    // Mocking and aliases
    // alias: {
    //   '@': path.resolve(__dirname, './src'),
    // },

		watch: true,

    // TypeScript support
    typecheck: {
      checker: 'tsc',
      include: ['**/*.spec.ts'],
    },

    // Benchmark options (if using vitest benchmarks)
    // benchmark: {
    //   include: ['**/*.{bench,benchmark}.{js,ts}'],
    // },

    // Isolate environment for each test file
    isolate: true,

    // Global test timeout (ms)
    testTimeout: 5000,

    // Silent console output during tests
    silent: false,

    // Open browser UI (when running vitest ui)
    // open: false,

    // API server (when running vitest api)
    // api: {
    //   port: 51204,
    // },
    
    // Viewport settings for jsdom environment
    // environmentOptions: {
    //   jsdom: {
    //     url: 'http://localhost',
    //     referrer: 'http://localhost',
    //   },
    // },
  },
}

export default defineConfig(config)