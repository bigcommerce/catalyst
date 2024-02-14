module.exports = {
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(t|j)s?$': '@swc/jest',
  },
  transformIgnorePatterns: [],
  // moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
};
