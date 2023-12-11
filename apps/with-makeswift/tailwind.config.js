const reactantPreset = require('@bigcommerce/reactant/tailwind-config');

/** @type {import('tailwindcss').Config} */
const config = {
  presets: [reactantPreset],
  content: [
    './pages/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './node_modules/@bigcommerce/reactant/src/**/*.{ts,tsx}',
  ],
  plugins: [],
};

module.exports = config;
