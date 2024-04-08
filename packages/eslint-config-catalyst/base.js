/** @type {import("eslint").Linter.Config} */
const config = {
  extends: ['@bigcommerce/eslint-config/configs/base', 'prettier'],
  plugins: ['check-file'],
  parserOptions: {
    ecmaVersion: 'latest',
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
  rules: {
    'check-file/filename-naming-convention': [
      'error',
      {
        '**/*.{jsx,tsx}': 'KEBAB_CASE',
        '**/*.{js,ts}': 'KEBAB_CASE',
      },
      {
        ignoreMiddleExtensions: true,
      },
    ],
    "check-file/folder-naming-convention": [
      "error",
      {
        "**": "KEBAB_CASE",
      }
    ]
  },
};

module.exports = config;
