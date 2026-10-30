import { defineConfig } from 'vitest/config';

// Unit tests of the shared package and the generators' pure logic. The sites' e2e is Playwright (tests/).
export default defineConfig({
  test: { include: ['packages/*/src/**/*.test.ts', 'packages/c3-data/*.test.ts', 'scripts/**/*.test.ts', 'sites/*/src/**/*.test.ts'], environment: 'node' },
});
