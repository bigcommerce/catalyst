module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': {
      browsers: '>2%, last 2 versions, Firefox ESR',
      features: {
        'cascade-layers': true,
        'color-mix': true,
        'oklab-function': true,
        'is-pseudo-class': true,
        'has-pseudo-class': true,
        'focus-visible-pseudo-class': true,
        'gap-properties': true,
      },
    },
  },
};
