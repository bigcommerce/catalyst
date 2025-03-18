module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/tests/**/*.(test|spec).[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
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
