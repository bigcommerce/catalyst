// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  extends: ['@bigcommerce/catalyst/base', '@bigcommerce/catalyst/prettier'],
  rules: {
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/naming-convention': 'off',
    'no-underscore-dangle': ['error', { allow: ['__typename'] }],
    'check-file/filename-naming-convention': 'off',
  },
  ignorePatterns: ['/dist/**', '/src/providers/bodl/ga4/google_analytics4.js'],
};

module.exports = config;
