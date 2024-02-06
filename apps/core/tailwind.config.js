const componentsPreset = require('@bigcommerce/components/tailwind-config');

/** @type {import('tailwindcss').Config} */
const config = {
  presets: [componentsPreset],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './node_modules/@bigcommerce/components/src/**/*.{ts,tsx}',
  ],
  plugins: [require('@tailwindcss/container-queries')],
};

module.exports = config;
