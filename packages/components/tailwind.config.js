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
    fontSize: {
      // Temp workaround while we chat with design about our font sizes
      // Generated using https://chrisburnell.com/clamp-calculator/ for fluid size
      // Using 640px as smallest viewport and 1536px as max
      h1: [
        'clamp(3.052rem, 2.226rem + 2.066vw, 4.209rem)',
        { lineHeight: '1.3', fontWeight: '900' },
      ],
      h2: [
        'clamp(2.441rem, 1.93rem + 1.279vw, 3.158rem)',
        { lineHeight: '1.3', fontWeight: '900' },
      ],
      h3: [
        'clamp(1.953rem, 1.656rem + 0.742vw, 2.369rem)',
        { lineHeight: '1.3', fontWeight: '900' },
      ],
      h4: [
        'clamp(1.563rem, 1.409rem + 0.383vw, 1.777rem)',
        { lineHeight: '1.3', fontWeight: '700' },
      ],
      h5: [
        'clamp(1.25rem, 1.191rem + 0.148vw, 1.333rem)',
        { lineHeight: '1.3', fontWeight: '700' },
      ],
      h6: ['1rem', { lineHeight: '1.3', fontWeight: '700' }],
      sm: ['.75rem', { lineHeight: '1.7' }],
      base: ['1rem', { lineHeight: '1.7' }],
      lg: ['1.25rem', { lineHeight: '1.7' }],
      li: ['1rem', { lineHeight: '1.7' }],
    },
  },
  // @ts-ignore
  // eslint-disable-next-line global-require
  plugins: [require('tailwindcss-radix')(), require('tailwindcss-animate')],
};

module.exports = config;
