module.exports = {
  transformIgnorePatterns: [
    'node_modules/(?!(fs-extra|@inquirer|chalk|commander|conf|dotenv|giget|lodash.kebabcase|nypm|ora|semver|std-env|zod|zod-validation-error)/)',
  ],
  transform: {
    '^.+\\.(t|j)s?$': ['@swc/jest', {
      sourceMaps: true,
      module: {
        type: 'commonjs'
      },
      jsc: {
        target: 'es2021',
        parser: {
          syntax: 'typescript',
          tsx: false,
          decorators: true,
        },
      },
    }]
  },
  moduleNameMapper: {
    '^chalk$': '<rootDir>/src/test-mocks/chalk.ts',
  },
  setupFiles: ['<rootDir>/src/test/setup.ts'],
};
