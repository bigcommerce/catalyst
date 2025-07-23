// @ts-check

/** @type {import('eslint').Linter.LegacyConfig} */
const config = {
  root: true,
  extends: ['@bigcommerce/catalyst/base', '@bigcommerce/catalyst/prettier'],
  rules: {
    'no-console': 'off',
    'import/no-named-as-default': 'off',
    '@typescript-eslint/naming-convention': 'off',
  },
  ignorePatterns: ['/dist/**', '/templates/**'],
};

module.exports = config;
