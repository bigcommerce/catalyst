/** @type {import("eslint").Linter.Config} */
const config = {
  extends: ['@bigcommerce/eslint-config/configs/base', 'prettier'],
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
