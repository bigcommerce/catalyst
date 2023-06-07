const baseConfig = require('@bigcommerce/catalyst-configs/prettier.config');

/** @type {import("prettier").Config} */
const config = {
  ...baseConfig,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindFunctions: ['cs'],
};

module.exports = config;
