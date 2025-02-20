module.exports = {
  collectCoverage: true,
  coveragePathIgnorePatterns: ['<rootDir>/lib'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/tests'],
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
};
