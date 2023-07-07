const reactantPreset = require('@bigcommerce/reactant/tailwind-config');

/** @type {import('tailwindcss').Config} */
const config = {
  presets: [reactantPreset],
  content: ['./pages/**/*.{ts,tsx}', './lib/**/*.{ts,tsx,js,jsx}'],
  plugins: [],
};

module.exports = config;
