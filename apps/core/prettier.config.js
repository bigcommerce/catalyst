// @ts-check

const baseConfig = require('@bigcommerce/catalyst-configs/prettier.config');

/** @type {import("prettier").Config} */
const config = {
  ...baseConfig,
  plugins: ['prettier-plugin-tailwindcss'],
  // Until https://github.com/tailwindlabs/prettier-plugin-tailwindcss/issues/161
  // @ts-expect-error
  tailwindFunctions: ['cs'],
};

module.exports = config;
