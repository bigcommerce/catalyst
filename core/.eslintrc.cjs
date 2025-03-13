// @ts-check

// eslint-disable-next-line import/no-extraneous-dependencies
require('@bigcommerce/eslint-config/patch');

/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  extends: [
    '@bigcommerce/catalyst/base',
    '@bigcommerce/catalyst/react',
    '@bigcommerce/catalyst/next',
    '@bigcommerce/catalyst/prettier',
  ],
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'import/dynamic-import-chunkname': 'off',
    'no-underscore-dangle': ['error', { allow: ['__typename'] }],
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/no-unsafe-enum-comparison': 'off',
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'next/link',
            message: "Please import 'Link' from '~/components/Link' instead.",
          },
          {
            name: 'next/image',
            importNames: ['default'],
            message:
              "Please import 'Image' from '~/components/image' instead. This component handles CDN and static image optimization.",
          },
          {
            name: '~/i18n/routing',
            importNames: ['Link'],
            message: "Please import 'Link' from '~/components/Link' instead.",
          },
          {
            name: 'next/router',
            importNames: ['useRouter'],
            message: 'Please import from `~/i18n/routing` instead.',
          },
          {
            name: 'next/navigation',
            importNames: ['redirect', 'permanentRedirect', 'useRouter', 'usePathname'],
            message: 'Please import from `~/i18n/routing` instead.',
          },
        ],
      },
    ],
    'check-file/folder-naming-convention': [
      'error',
      {
        '**': 'NEXT_JS_APP_ROUTER_CASE',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
  ],
  ignorePatterns: [
    'client/generated/**/*.ts',
    'playwright-report/**',
    'test-results/**',
    '**/google_analytics4.js',
    'contentful/generated/**/*.ts',
  ],
};

module.exports = config;
