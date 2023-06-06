/* eslint-env node */

/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  extends: ['@bigcommerce/eslint-config'],
  ignorePatterns: ['/dist/**'],
};

module.exports = config;
