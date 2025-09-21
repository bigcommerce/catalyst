// @ts-check

/** @type {import('eslint').Linter.LegacyConfig} */
const config = {
  root: true,
  extends: ['@bigcommerce/catalyst/base', '@bigcommerce/catalyst/prettier'],
  rules: {
    'no-console': 'off',
    'import/no-named-as-default': 'off',
    'import/namespace': 'off',
    'import/no-unresolved': 'off',
    '@typescript-eslint/naming-convention': 'off',
  },
  ignorePatterns: ['/dist/**'],
};

module.exports = config;
