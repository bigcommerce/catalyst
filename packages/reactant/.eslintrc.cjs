/* eslint-env node */

/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  extends: [
    '@bigcommerce/catalyst/base',
    '@bigcommerce/catalyst/react',
    '@bigcommerce/catalyst/prettier',
  ],
  ignorePatterns: ['/dist/**'],
};

module.exports = config;
