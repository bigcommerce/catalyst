// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  extends: ['@bigcommerce/catalyst/base', '@bigcommerce/catalyst/prettier'],
  rules: {
    'no-console': 'off',
    'import/no-named-as-default': 'off',
    '@typescript-eslint/naming-convention': 'off',
    // sequential execution is typically desired in a synchronous CLI program
    'no-await-in-loop': 'off',
  },
  ignorePatterns: ['/dist/**'],
};

module.exports = config;
