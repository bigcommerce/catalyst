// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  extends: ['@bigcommerce/catalyst/base', '@bigcommerce/catalyst/prettier'],
  rules: {
    'check-file/filename-naming-convention': 'off',
  },
};

module.exports = config;
