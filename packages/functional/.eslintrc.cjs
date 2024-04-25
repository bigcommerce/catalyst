// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  extends: ['@bigcommerce/catalyst/base', '@bigcommerce/catalyst/prettier'],
  ignorePatterns: ['/playwright-report/**', '/test-results/**'],
};

module.exports = config;
