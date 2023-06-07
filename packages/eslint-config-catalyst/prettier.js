/** @type {import("eslint").Linter.Config} */
const config = {
  extends: ['plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': ['warn'],
  }
};

module.exports = config;
