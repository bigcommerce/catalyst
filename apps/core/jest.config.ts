import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/node_modules/**', '!**/vendor/**'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  verbose: true,
};

export default config;
