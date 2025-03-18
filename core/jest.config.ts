module.exports = {
  collectCoverage: true,
  coveragePathIgnorePatterns: ['<rootDir>/lib'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/tests/**/*.(test|spec).[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
    '^@/vibes/(.*)$': '<rootDir>/vibes/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/tests/visual-regression/', '/tests/ui/'],
};
