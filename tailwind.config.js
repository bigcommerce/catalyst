/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
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
      green: '#388E3C',
      red: '#C62828',
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
    fontSize: {
      h1: ['4rem', { lineHeight: '1.3', fontWeight: '900' }],
      h2: ['3rem', { lineHeight: '1.3', fontWeight: '900' }],
      h3: ['2.5rem', { lineHeight: '1.3', fontWeight: '900' }],
      h4: ['1.75rem', { lineHeight: '1.3', fontWeight: '700' }],
      h5: ['1.25rem', { lineHeight: '1.3', fontWeight: '700' }],
      h6: ['1rem', { lineHeight: '1.3', fontWeight: '700' }],
      sm: ['.75rem', { lineHeight: '1.7' }],
      base: ['1rem', { lineHeight: '1.7' }],
      lg: ['1.25rem', { lineHeight: '1.7' }],
      li: ['1rem', { lineHeight: '1.7' }],
    },
  },
  plugins: [],
};
