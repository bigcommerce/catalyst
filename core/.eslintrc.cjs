// @ts-check

require('@bigcommerce/eslint-config/patch');

/** @type {import(''eslint'').Linter.LegacyConfig} */
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
    'import/namespace': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'no-underscore-dangle': ['error', { allow: ['__typename'] }],
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/no-unsafe-enum-comparison': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
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
            message: 'Please import from ~/i18n/routing instead.',
          },
          {
            name: 'next/navigation',
            importNames: ['redirect', 'permanentRedirect', 'useRouter', 'usePathname'],
            message: 'Please import from ~/i18n/routing instead.',
          },
          {
            name: '@playwright/test',
            importNames: ['expect', 'test'],
            message: 'Please import from ~/tests/fixtures instead.',
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
      files: ['**/*.spec.ts', '**/*.test.ts'],
      rules: {
        '@typescript-eslint/no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'next-intl/server',
                importNames: ['getTranslations', 'getFormatter'],
                message:
                  'Please import getTranslations from ~/tests/lib/i18n and getFormatter from ~/tests/lib/formatter instead.',
              },
            ],
          },
        ],
      },
    },
  ],
  ignorePatterns: [
    'client/generated/**/*.ts',
    'playwright-report/**',
    'test-results/**',
    '.tests/**',
    '**/google_analytics4.js',
  ],
};

module.exports = config;