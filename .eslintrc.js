require('@bigcommerce/eslint-config/patch');

module.exports = {
  extends: ['next/core-web-vitals', '@bigcommerce/eslint-config'],
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    '@next/next/no-html-link-for-pages': 'off',
  },
};
