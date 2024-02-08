// @ts-check

/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000000',
      blue: {
        primary: '#053FB0',
        secondary: '#3071EF',
      },
      gray: {
        100: '#F1F3F5',
        200: '#CFD8DC',
        300: '#AFBAC5',
        400: '#90A4AE',
        500: '#546E7A',
        600: '#091D45',
      },
      green: {
        100: '#388E3C',
        200: '#146622',
        300: '#4FD055',
      },
      red: {
        100: '#C62828',
        200: '#AD0000',
      },
      white: '#ffffff',
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      keyframes: {
        revealVertical: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0%)' },
        },
      },
      animation: {
        revealVertical: 'revealVertical 400ms forwards cubic-bezier(0, 1, 0.25, 1)',
      },
    },
  },
  // @ts-ignore
  // eslint-disable-next-line global-require
  plugins: [require('tailwindcss-radix')(), require('tailwindcss-animate')],
};

module.exports = config;
