/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  extends: ['@bigcommerce/eslint-config', 'next/core-web-vitals'],
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'no-underscore-dangle': ['error', { allow: ['__typename'] }],
  },
};

module.exports = config;
