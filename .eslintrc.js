require('@bigcommerce/eslint-config/patch');

module.exports = {
  extends: ['@bigcommerce/eslint-config', 'next/core-web-vitals'],
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'no-underscore-dangle': ['error', { allow: ['__typename'] }],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/lib/client/**/*'],
            message: 'Please use @client/* instead.',
          },
          {
            group: ['**/lib/reactant/**/*'],
            message: 'Please use @reactant/* instead.',
          },
        ],
      },
    ],
  },
};
