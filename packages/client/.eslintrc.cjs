/* eslint-env node */

/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  extends: ['@bigcommerce/eslint-config'],
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    'no-underscore-dangle': ['error', { allow: ['__typename'] }],
  },
  ignorePatterns: ['/src/generated/**', '/dist/**'],
};

module.exports = config;
