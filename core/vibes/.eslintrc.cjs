// @ts-check

// eslint-disable-next-line import/no-extraneous-dependencies
require('@bigcommerce/eslint-config/patch');

/** @type {import('eslint').Linter.Config} */
const config = {
  rules: {
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    'react/jsx-no-bind': 'off',
  },
};

module.exports = config;
