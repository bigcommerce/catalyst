// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  extends: ['@bigcommerce/catalyst/base', '@bigcommerce/catalyst/prettier'],
  rules: {
    'no-console': 'off',
  },
  ignorePatterns: ['/dist/**'],
};

module.exports = config;
