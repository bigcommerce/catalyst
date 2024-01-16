// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  extends: [
    '@bigcommerce/eslint-config/configs/base',
    'prettier',
    '@bigcommerce/eslint-config/configs/react',
    'plugin:@next/next/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prefer-read-only-props': 'off',
    'prettier/prettier': ['warn'],
    '@typescript-eslint/naming-convention': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'import/dynamic-import-chunkname': 'off',
    'no-underscore-dangle': ['error', { allow: ['__typename'] }],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['@bigcommerce/eslint-config/configs/typescript'],
    },
  ],
  env: {
    es2022: true,
    node: true,
  },
};

module.exports = config;
