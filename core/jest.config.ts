// module.exports = {
//   collectCoverage: true,
//   coveragePathIgnorePatterns: ['<rootDir>/lib'],
//   moduleNameMapper: {
//     '^~/(.*)$': '<rootDir>/$1',
//   },
//   setupFilesAfterEnv: ['./jest.setup.ts'],
//   testEnvironment: 'jsdom',
//   testPathIgnorePatterns: ['<rootDir>/tests'],
//   transform: {
//     '^.+\\.(t|j)sx?$': [
//       '@swc/jest',
//       {
//         jsc: {
//           transform: {
//             react: {
//               runtime: 'automatic',
//             },
//           },
//         },
//       },
//     ],
//   },
// };

// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/tests/**/*.(test|spec).[jt]s?(x)'],
  // testMatch: ['<rootDir>/tests/**/*.(test|spec).(ts|tsx|js|jsx)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/client/$1',
    '^@/(.*)$': '<rootDir>/client/$1',
  },
};