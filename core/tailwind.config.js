/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './vibes/**/*.{ts,tsx}',
    '!./node_modules/**',
  ],
  theme: {
    colors: {
      background: {
        DEFAULT: 'var(--alto-sem-color-bg-base)',
        base: 'var(--alto-sem-color-bg-base)',
        layer1: {
          DEFAULT: 'var(--alto-sem-color-bg-layer1-default)',
          active: 'var(--alto-sem-color-bg-layer1-active)',
          hover: 'var(--alto-sem-color-bg-layer1-hover)',
        },
        layer2: {
          DEFAULT: 'var(--alto-sem-color-bg-layer2-default)',
          active: 'var(--alto-sem-color-bg-layer2-active)',
          hover: 'var(--alto-sem-color-bg-layer2-hover)',
        },
        layer3: {
          DEFAULT: 'var(--alto-sem-color-bg-layer3-default)',
          active: 'var(--alto-sem-color-bg-layer3-active)',
          hover: 'var(--alto-sem-color-bg-layer3-hover)',
        },
        accent: {
          vibrant: {
            DEFAULT: 'var(--alto-sem-color-bg-accent-vibrant-default)',
            active: 'var(--alto-sem-color-bg-accent-vibrant-active)',
            hover: 'var(--alto-sem-color-bg-accent-vibrant-hover)',
          },
          subtle: {
            DEFAULT: 'var(--alto-sem-color-bg-accent-subtle-default)',
            active: 'var(--alto-sem-color-bg-accent-subtle-active)',
            hover: 'var(--alto-sem-color-bg-accent-subtle-hover)',
          },
          deep: {
            DEFAULT: 'var(--alto-sem-color-bg-accent-deep-default)',
            active: 'var(--alto-sem-color-bg-accent-deep-active)',
            hover: 'var(--alto-sem-color-bg-accent-deep-hover)',
          },
        },
        critical: {
          vibrant: {
            DEFAULT: 'var(--alto-sem-color-bg-critical-vibrant-default)',
            active: 'var(--alto-sem-color-bg-critical-vibrant-active)',
            hover: 'var(--alto-sem-color-bg-critical-vibrant-hover)',
          },
          subtle: {
            DEFAULT: 'var(--alto-sem-color-bg-critical-subtle-default)',
            active: 'var(--alto-sem-color-bg-critical-subtle-active)',
            hover: 'var(--alto-sem-color-bg-critical-subtle-hover)',
          },
        },
        warning: {
          vibrant: {
            DEFAULT: 'var(--alto-sem-color-bg-warning-vibrant-default)',
            active: 'var(--alto-sem-color-bg-warning-vibrant-active)',
            hover: 'var(--alto-sem-color-bg-warning-vibrant-hover)',
          },
          subtle: {
            DEFAULT: 'var(--alto-sem-color-bg-warning-subtle-default)',
            active: 'var(--alto-sem-color-bg-warning-subtle-active)',
            hover: 'var(--alto-sem-color-bg-warning-subtle-hover)',
          },
        },
        caution: {
          vibrant: {
            DEFAULT: 'var(--alto-sem-color-bg-caution-vibrant-default)',
            active: 'var(--alto-sem-color-bg-caution-vibrant-active)',
            hover: 'var(--alto-sem-color-bg-caution-vibrant-hover)',
          },
          subtle: {
            DEFAULT: 'var(--alto-sem-color-bg-caution-subtle-default)',
            active: 'var(--alto-sem-color-bg-caution-subtle-active)',
            hover: 'var(--alto-sem-color-bg-caution-subtle-hover)',
          },
        },
        success: {
          vibrant: {
            DEFAULT: 'var(--alto-sem-color-bg-success-vibrant-default)',
            active: 'var(--alto-sem-color-bg-success-vibrant-active)',
            hover: 'var(--alto-sem-color-bg-success-vibrant-hover)',
          },
          subtle: {
            DEFAULT: 'var(--alto-sem-color-bg-success-subtle-default)',
            active: 'var(--alto-sem-color-bg-success-subtle-active)',
            hover: 'var(--alto-sem-color-bg-success-subtle-hover)',
          },
        },
        information: {
          vibrant: {
            DEFAULT: 'var(--alto-sem-color-bg-information-vibrant-default)',
            active: 'var(--alto-sem-color-bg-information-vibrant-active)',
            hover: 'var(--alto-sem-color-bg-information-vibrant-hover)',
          },
          subtle: {
            DEFAULT: 'var(--alto-sem-color-bg-information-subtle-default)',
            active: 'var(--alto-sem-color-bg-information-subtle-active)',
            hover: 'var(--alto-sem-color-bg-information-subtle-hover)',
          },
        },
        inverse: {
          vibrant: {
            DEFAULT: 'var(--alto-sem-color-bg-inverse-vibrant-default)',
            active: 'var(--alto-sem-color-bg-inverse-vibrant-active)',
            hover: 'var(--alto-sem-color-bg-inverse-vibrant-hover)',
          },
          subtle: {
            DEFAULT: 'var(--alto-sem-color-bg-inverse-subtle-default)',
            active: 'var(--alto-sem-color-bg-inverse-subtle-active)',
            hover: 'var(--alto-sem-color-bg-inverse-subtle-hover)',
          },
        },
        white: {
          vibrant: {
            DEFAULT: 'var(--alto-sem-color-bg-white-vibrant-default)',
            active: 'var(--alto-sem-color-bg-white-vibrant-active)',
            hover: 'var(--alto-sem-color-bg-white-vibrant-hover)',
          },
          subtle: {
            DEFAULT: 'var(--alto-sem-color-bg-white-subtle-default)',
            active: 'var(--alto-sem-color-bg-white-subtle-active)',
            hover: 'var(--alto-sem-color-bg-white-subtle-hover)',
          },
        },
        disabled: {
          vibrant: 'var(--alto-sem-color-bg-disabled-vibrant)',
          subtle: 'var(--alto-sem-color-bg-disabled-subtle)',
        },
        sale: {
          vibrant: {
            DEFAULT: 'var(--alto-sem-color-bg-sale-vibrant-default)',
            active: 'var(--alto-sem-color-bg-sale-vibrant-active)',
            hover: 'var(--alto-sem-color-bg-sale-vibrant-hover)',
          },
        },
        collect: {
          vibrant: 'var(--alto-sem-color-bg-collect-vibrant-default)',
        },
        spend: {
          vibrant: 'var(--alto-sem-color-bg-spend-vibrant-default)',
        },
        header: 'var(--alto-header-color-bg)',
        eyebrow: 'var(--alto-eyebrow-color-bg)',
      },
      brand: {
        DEFAULT: 'var(--alto-sem-color-brand-primary)',
        primary: 'var(--alto-sem-color-brand-primary)',
        secondary: 'var(--alto-sem-color-brand-secondary)',
      },
      foreground: {
        DEFAULT: 'var(--alto-sem-color-fg-primary)',
        primary: 'var(--alto-sem-color-fg-primary)',
        secondary: 'var(--alto-sem-color-fg-secondary)',
        accent: {
          DEFAULT: 'var(--alto-sem-color-fg-accent-primary)',
          primary: 'var(--alto-sem-color-fg-accent-primary)',
          secondary: 'var(--alto-sem-color-fg-accent-secondary)',
          on: {
            vibrant: {
              DEFAULT: 'var(--alto-sem-color-fg-accent-on-vibrant)',
              accent: 'var(--alto-sem-color-fg-accent-on-vibrant-accent)',
            },
            subtle: 'var(--alto-sem-color-fg-accent-on-subtle)',
            deep: 'var(--alto-sem-color-fg-accent-on-deep)',
          },
        },
        critical: {
          DEFAULT: 'var(--alto-sem-color-fg-critical-primary)',
          primary: 'var(--alto-sem-color-fg-critical-primary)',
          on: {
            vibrant: 'var(--alto-sem-color-fg-critical-on-vibrant)',
            subtle: 'var(--alto-sem-color-fg-critical-on-subtle)',
          },
        },
        warning: {
          DEFAULT: 'var(--alto-sem-color-fg-warning-primary)',
          primary: 'var(--alto-sem-color-fg-warning-primary)',
          on: {
            vibrant: 'var(--alto-sem-color-fg-warning-on-vibrant)',
            subtle: 'var(--alto-sem-color-fg-warning-on-subtle)',
          },
        },
        caution: {
          DEFAULT: 'var(--alto-sem-color-fg-caution-primary)',
          primary: 'var(--alto-sem-color-fg-caution-primary)',
          on: {
            vibrant: 'var(--alto-sem-color-fg-caution-on-vibrant)',
            subtle: 'var(--alto-sem-color-fg-caution-on-subtle)',
          },
        },
        success: {
          DEFAULT: 'var(--alto-sem-color-fg-success-primary)',
          primary: 'var(--alto-sem-color-fg-success-primary)',
          on: {
            vibrant: 'var(--alto-sem-color-fg-success-on-vibrant)',
            subtle: 'var(--alto-sem-color-fg-success-on-subtle)',
          },
        },
        information: {
          DEFAULT: 'var(--alto-sem-color-fg-information-primary)',
          primary: 'var(--alto-sem-color-fg-information-primary)',
          on: {
            vibrant: 'var(--alto-sem-color-fg-information-on-vibrant)',
            subtle: 'var(--alto-sem-color-fg-information-on-subtle)',
          },
        },
        inverse: {
          DEFAULT: 'var(--alto-sem-color-fg-inverse-primary)',
          primary: 'var(--alto-sem-color-fg-inverse-primary)',
          on: {
            vibrant: 'var(--alto-sem-color-fg-inverse-on-vibrant)',
            subtle: 'var(--alto-sem-color-fg-inverse-on-subtle)',
          },
        },
        white: {
          DEFAULT: 'var(--alto-sem-color-fg-white-primary)',
          primary: 'var(--alto-sem-color-fg-white-primary)',
          on: {
            vibrant: 'var(--alto-sem-color-fg-white-on-vibrant)',
            subtle: 'var(--alto-sem-color-fg-white-on-subtle)',
          },
        },
        disabled: {
          DEFAULT: 'var(--alto-sem-color-fg-disabled-primary)',
          primary: 'var(--alto-sem-color-fg-disabled-primary)',
          on: {
            vibrant: 'var(--alto-sem-color-fg-disabled-on-vibrant)',
            subtle: 'var(--alto-sem-color-fg-disabled-on-subtle)',
          },
        },
        sale: {
          DEFAULT: 'var(--alto-sem-color-fg-sale-primary)',
          primary: 'var(--alto-sem-color-fg-sale-primary)',
          on: {
            vibrant: 'var(--alto-sem-color-fg-sale-on-vibrant)',
          },
        },
        collect: {
          DEFAULT: 'var(--alto-sem-color-fg-collect-primary)',
          primary: 'var(--alto-sem-color-fg-collect-primary)',
          on: {
            vibrant: 'var(--alto-sem-color-fg-collect-on-vibrant-default)',
          },
        },
        spend: {
          DEFAULT: 'var(--alto-sem-color-fg-spend-primary)',
          primary: 'var(--alto-sem-color-fg-spend-primary)',
          on: {
            vibrant: 'var(--alto-sem-color-fg-spend-on-vibrant-default)',
          },
        },
      },
      border: {
        primary: {
          DEFAULT: 'var(--alto-sem-color-border-primary-default)',
          active: 'var(--alto-sem-color-border-primary-active)',
          hover: 'var(--alto-sem-color-border-primary-hover)',
        },
        secondary: 'var(--alto-sem-color-border-secondary)',
        tertiary: 'var(--alto-sem-color-border-tertiary)',
        accent: 'var(--alto-sem-color-border-accent)',
        critical: 'var(--alto-sem-color-border-critical)',
        sale: 'var(--alto-sem-color-border-sale)',
        warning: 'var(--alto-sem-color-border-warning)',
        caution: 'var(--alto-sem-color-border-caution)',
        success: 'var(--alto-sem-color-border-success)',
        information: 'var(--alto-sem-color-border-information)',
        white: 'var(--alto-sem-color-border-white)',
        inverse: 'var(--alto-sem-color-border-inverse)',
        collect: 'var(--alto-sem-color-border-collect)',
        spend: 'var(--alto-sem-color-border-spend)',
        disabled: {
          subtle: 'var(--alto-sem-color-border-disabled-subtle)',
          vibrant: 'var(--alto-sem-color-border-disabled-vibrant)',
        },
      },
      overlay: {
        scrim: 'var(--alto-sem-color-overlay-scrim)',
        state: {
          darken: {
            active: 'var(--alto-sem-color-overlay-state-darken-active)',
            hover: 'var(--alto-sem-color-overlay-state-darken-hover)',
            invert: {
              active: 'var(--alto-sem-color-overlay-state-darken-invert-active)',
              hover: 'var(--alto-sem-color-overlay-state-darken-invert-hover)',
            },
          },
          lighten: {
            active: 'var(--alto-sem-color-overlay-state-lighten-active)',
            hover: 'var(--alto-sem-color-overlay-state-lighten-hover)',
            invert: {
              active: 'var(--alto-sem-color-overlay-state-lighten-invert-active)',
              hover: 'var(--alto-sem-color-overlay-state-lighten-invert-hover)',
            },
          },
        },
      },
    },
    borderRadius: {
      none: 'var(--alto-sem-radius-none)',
      'button-md': 'var(--alto-button-md-radius)',
      'button-sm': 'var(--alto-button-sm-radius)',
      card: 'var(--alto-card-radius)',
      checkbox: 'var(--alto-checkbox-radius)',
      circle: 'var(--alto-sem-radius-circle)',
      container: 'var(--alto-segmented-control-container-radius)',
      eyebrow: 'var(--alto-eyebrow-radius)',
      input: 'var(--alto-input-radius)',
      radio: 'var(--alto-radio-radius)',
      segment: 'var(--alto-segmented-control-segment-radius)',
      tag: 'var(--alto-tag-radius)',
      xl: 'var(--alto-sem-radius-xl)',
      lg: 'var(--alto-sem-radius-lg)',
      md: 'var(--alto-sem-radius-md)',
      sm: 'var(--alto-sem-radius-sm)',
      xs: 'var(--alto-sem-radius-xs)',
      '2xs': 'var(--alto-sem-radius-2xs)',
      '3xs': 'var(--alto-sem-radius-3xs)',
      '4xs': 'var(--alto-sem-radius-4xs)',
      '5xs': 'var(--alto-sem-radius-5xs)',
      '6xs': 'var(--alto-sem-radius-6xs)',
    },
    borderWidth: {
      none: 'var(--alto-sem-border-width-none)',
      xs: 'var(--alto-sem-border-width-xs)',
      sm: 'var(--alto-sem-border-width-sm)',
      md: 'var(--alto-sem-border-width-md)',
      lg: 'var(--alto-sem-border-width-lg)',
      xl: 'var(--alto-sem-border-width-xl)',
    },
    fontFamily: {
      heading: 'var(--alto-sem-text-heading-font-family)',
      body: 'var(--alto-sem-text-body-font-family)',
      label: 'var(--alto-sem-text-label-font-family)',
    },
    fontSize: {
      'heading-xl': [
        'var(--alto-sem-text-heading-xl-font-size)',
        {
          fontWeight: 'var(--alto-sem-text-heading-xl-font-weight)',
          letterSpacing: 'var(--alto-sem-text-heading-xl-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-heading-xl-line-height)',
        },
      ],
      'heading-lg': [
        'var(--alto-sem-text-heading-lg-font-size)',
        {
          fontWeight: 'var(--alto-sem-text-heading-lg-font-weight)',
          letterSpacing: 'var(--alto-sem-text-heading-lg-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-heading-lg-line-height)',
        },
      ],
      'heading-md': [
        'var(--alto-sem-text-heading-md-font-size)',
        {
          fontWeight: 'var(--alto-sem-text-heading-md-font-weight)',
          letterSpacing: 'var(--alto-sem-text-heading-md-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-heading-md-line-height)',
        },
      ],
      'heading-sm': [
        'var(--alto-sem-text-heading-sm-font-size)',
        {
          fontWeight: 'var(--alto-sem-text-heading-sm-font-weight)',
          letterSpacing: 'var(--alto-sem-text-heading-sm-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-heading-sm-line-height)',
        },
      ],
      'heading-xs': [
        'var(--alto-sem-text-heading-xs-font-size)',
        {
          fontWeight: 'var(--alto-sem-text-heading-xs-font-weight)',
          letterSpacing: 'var(--alto-sem-text-heading-xs-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-heading-xs-line-height)',
        },
      ],
      'heading-2xs': [
        'var(--alto-sem-text-heading-2xs-font-size)',
        {
          fontWeight: 'var(--alto-sem-text-heading-2xs-font-weight)',
          letterSpacing: 'var(--alto-sem-text-heading-2xs-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-heading-2xs-line-height)',
        },
      ],
      'body-lg': [
        'var(--alto-sem-text-body-lg-font-size)',
        {
          letterSpacing: 'var(--alto-sem-text-body-lg-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-body-lg-line-height)',
        },
      ],
      'body-md': [
        'var(--alto-sem-text-body-md-font-size)',
        {
          letterSpacing: 'var(--alto-sem-text-body-md-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-body-md-line-height)',
        },
      ],
      'body-sm': [
        'var(--alto-sem-text-body-sm-font-size)',
        {
          letterSpacing: 'var(--alto-sem-text-body-sm-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-body-sm-line-height)',
        },
      ],
      'body-xs': [
        'var(--alto-sem-text-body-xs-font-size)',
        {
          letterSpacing: 'var(--alto-sem-text-body-xs-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-body-xs-line-height)',
        },
      ],
      'label-lg': [
        'var(--alto-sem-text-label-lg-font-size)',
        {
          fontWeight: 'var(--alto-sem-text-label-font-weight)',
          letterSpacing: 'var(--alto-sem-text-label-lg-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-label-lg-line-height)',
        },
      ],
      'label-md': [
        'var(--alto-sem-text-label-md-font-size)',
        {
          fontWeight: 'var(--alto-sem-text-label-font-weight)',
          letterSpacing: 'var(--alto-sem-text-label-md-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-label-md-line-height)',
        },
      ],
      'label-sm': [
        'var(--alto-sem-text-label-sm-font-size)',
        {
          fontWeight: 'var(--alto-sem-text-label-font-weight)',
          letterSpacing: 'var(--alto-sem-text-label-sm-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-label-sm-line-height)',
        },
      ],
      'label-xs': [
        'var(--alto-sem-text-label-xs-font-size)',
        {
          fontWeight: 'var(--alto-sem-text-label-font-weight)',
          letterSpacing: 'var(--alto-sem-text-label-xs-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-label-xs-line-height)',
        },
      ],
      'label-2xs': [
        'var(--alto-sem-text-label-2xs-font-size)',
        {
          fontWeight: 'var(--alto-sem-text-label-font-weight)',
          letterSpacing: 'var(--alto-sem-text-label-2xs-letter-spacing)',
          lineHeight: 'var(--alto-sem-text-label-2xs-line-height)',
        },
      ],
    },
    screens: {
      sm: 'var(--alto-sem-breakpoint-sm-min-width)',
      md: 'var(--alto-sem-breakpoint-md-min-width)',
      lg: 'var(--alto-sem-breakpoint-lg-min-width)',
      xl: 'var(--alto-sem-breakpoint-xl-min-width)',
      '2xl': 'var(--alto-sem-breakpoint-2xl-min-width)',
    },
    space: {
      '6xl': 'var(--alto-sem-space-6xl)',
      '5xl': 'var(--alto-sem-space-5xl)',
      '4xl': 'var(--alto-sem-space-4xl)',
      '3xl': 'var(--alto-sem-space-3xl)',
      '2xl': 'var(--alto-sem-space-2xl)',
      xl: 'var(--alto-sem-space-xl)',
      lg: 'var(--alto-sem-space-lg)',
      md: 'var(--alto-sem-space-md)',
      sm: 'var(--alto-sem-space-sm)',
      xs: 'var(--alto-sem-space-xs)',
      '2xs': 'var(--alto-sem-space-2xs)',
      '3xs': 'var(--alto-sem-space-3xs)',
      '4xs': 'var(--alto-sem-space-4xs)',
      '5xs': 'var(--alto-sem-space-5xs)',
    },
    extend: {
      gap: {
        'form-field': 'var(--alto-form-field-gap)',
        'form-section': 'var(--alto-form-section-gap)',
      },
      maxWidth: {
        form: 'var(--alto-form-max-width)',
        'section-container': 'var(--alto-section-container-max-width)',
      },
      opacity: {
        96: 'var(--alto-sem-opacity-96)',
      },
    },
  },
  plugins: [
    // @ts-ignore
    require('tailwindcss-radix')(),
    require('tailwindcss-animate'),
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/typography'),
  ],
};

module.exports = config;
