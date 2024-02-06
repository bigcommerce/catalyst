const componentsPreset = require('@bigcommerce/components/tailwind-config');

/** @type {import('tailwindcss').Config} */
const config = {
  presets: [componentsPreset],
  content: ['./stories/**/*.{ts,tsx}', './node_modules/@bigcommerce/components/src/**/*.{ts,tsx}'],
  plugins: [],
};

module.exports = config;
