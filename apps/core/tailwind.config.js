const reactantPreset = require('@bigcommerce/reactant/tailwind-config');

/** @type {import('tailwindcss').Config} */
const config = {
  presets: [reactantPreset],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './node_modules/@bigcommerce/reactant/src/**/*.{ts,tsx}',
  ],
  plugins: [require('@tailwindcss/container-queries')],
};

module.exports = config;
