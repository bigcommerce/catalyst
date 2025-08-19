// @ts-check

/** @type {import("prettier").Config} */
const config = {
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'all',
  overrides: [
    {
      files: '**/*.jsonc',
      options: {
        trailingComma: 'none',
      },
    },
  ],
};

module.exports = config;
