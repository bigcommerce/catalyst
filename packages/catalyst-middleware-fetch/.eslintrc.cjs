// @ts-check

/** @type {import('eslint').Linter.LegacyConfig} */
const config = {
  root: true,
  extends: ['@bigcommerce/catalyst/base', '@bigcommerce/catalyst/prettier'],
  rules: {
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/naming-convention': 'off',
    'no-underscore-dangle': ['error', { allow: ['__typename'] }],
    'check-file/filename-naming-convention': 'off',
    'switch-case/newline-between-switch-case': 'off', // Has a bug with invalid ranges
    'valid-jsdoc': 'off', // TypeScript provides type safety, JSDoc adds redundancy
    '@stylistic/padding-line-between-statements': 'off', // Conflicts with switch statement formatting
  },
  ignorePatterns: ['/src/generated/**', '/dist/**'],
};

module.exports = config;
