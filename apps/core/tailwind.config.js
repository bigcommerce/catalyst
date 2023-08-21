const reactantPreset = require('@bigcommerce/reactant/tailwind-config');

/** @type {import('tailwindcss').Config} */
const config = {
  presets: [reactantPreset],
  content: ['./app/**/*.{ts,tsx}', './node_modules/@bigcommerce/reactant/dist/**/*.{js,mjs}'],
  plugins: [],
};

module.exports = config;
