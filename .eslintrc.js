require('@bigcommerce/eslint-config/patch');

module.exports = {
  extends: ['@bigcommerce/eslint-config', 'next/core-web-vitals'],
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'no-underscore-dangle': ['error', { allow: ['__typename'] }],
  },
};
