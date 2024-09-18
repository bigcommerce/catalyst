/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '!./node_modules/**', // Exclude everything in node_modules to speed up builds
  ],
  prefix: '',
  theme: {
    extend: {
      colors: {
        secondary: '#3071EF', // TODO: REMOVE WHEN MERGE
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          highlight: 'color-mix(in oklab, hsl(var(--primary)), white 75%)',
          shadow: 'color-mix(in oklab, hsl(var(--primary)), black 75%)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          highlight: 'color-mix(in oklab, hsl(var(--accent)), white 75%)',
          shadow: 'color-mix(in oklab, hsl(var(--accent)), black 75%)',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          highlight: 'color-mix(in oklab, hsl(var(--success)), white 75%)',
          shadow: 'color-mix(in oklab, hsl(var(--success)), black 75%)',
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          highlight: 'color-mix(in oklab, hsl(var(--error)), white 75%)',
          shadow: 'color-mix(in oklab, hsl(var(--error)), black 75%)',
          secondary: '#C62828', // TODO: REMOVE WHEN MERGE
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          highlight: 'color-mix(in oklab, hsl(var(--warning)), white 75%)',
          shadow: 'color-mix(in oklab, hsl(var(--warning)), black 75%)',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          highlight: 'color-mix(in oklab, hsl(var(--info)), white 75%)',
          shadow: 'color-mix(in oklab, hsl(var(--info)), black 75%)',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        contrast: {
          100: 'hsl(var(--contrast-100))',
          200: 'hsl(var(--contrast-200))',
          300: 'hsl(var(--contrast-300))',
          400: 'hsl(var(--contrast-400))',
          500: 'hsl(var(--contrast-500))',
        },
      },
      fontFamily: {
        heading: [
          'var(--font-family-heading)',
          {
            fontFeatureSettings: 'var(--font-feature-settings-heading)',
            fontVariationSettings: 'var(--font-variation-settings-heading)',
          },
        ],
        body: [
          'var(--font-family-body)',
          {
            fontFeatureSettings: 'var(--font-feature-settings-body)',
            fontVariationSettings: 'var(--font-variation-settings-body)',
          },
        ],
        mono: [
          'var(--font-family-mono)',
          {
            fontFeatureSettings: 'var(--font-feature-settings-mono)',
            fontVariationSettings: 'var(--font-variation-settings-mono)',
          },
        ],
      },
      fontSize: {
        xs: 'var(--font-size-xs, 0.75rem)',
        sm: 'var(--font-size-sm, 0.875rem)',
        base: 'var(--font-size-base, 1rem)',
        lg: 'var(--font-size-lg, 1.125rem)',
        xl: 'var(--font-size-xl, 1.25rem)',
        '2xl': 'var(--font-size-2xl, 1.5rem)',
        '3xl': 'var(--font-size-3xl, 1.875rem)',
        '4xl': 'var(--font-size-4xl, 2.25rem)',
        '5xl': 'var(--font-size-5xl, 3rem)',
        '6xl': 'var(--font-size-6xl, 3.75rem)',
        '7xl': 'var(--font-size-7xl, 4.5rem)',
        '8xl': 'var(--font-size-8xl, 6rem)',
        '9xl': 'var(--font-size-9xl, 8rem)',
      },
      shadows: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-base)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
    },
  },
  plugins: [
    // @ts-ignore
    require('tailwindcss-radix')(), // TODO: REMOVE WHEN MERGE
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ],
};

module.exports = config;
