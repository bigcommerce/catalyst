// @ts-check

require('@bigcommerce/eslint-config/patch');

/** @type {import('eslint').Linter.LegacyConfig} */
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
    'no-underscore-dangle': ['error', { allow: ['__typename', '_gre'] }],
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
          {
            name: '@playwright/test',
            importNames: ['expect', 'test'],
            message: 'Please import from `~/tests/fixtures` instead.',
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
                  'Please import `getTranslations` from `~/tests/lib/i18n` and `getFormatter` from `~/tests/lib/formatter` instead.',
              },
            ],
          },
        ],
      },
    },
    {
      // Disable strict linting rules for Vertex AI code
      // The Google Cloud Retail SDK has incomplete TypeScript types and requires `any` usage
      files: [
        '**/vertex-retail/**',
        '**/vertex-ga4/**',
        '**/vertex-pixel/**',
        '**/fetch-vertex-*.ts',
        '**/vertex-*.ts',
        '**/vertex-*.tsx',
        '**/*vertex*.ts',
        '**/*vertex*.tsx',
        '**/home-page-tracker.tsx',
        '**/product-vertex-tracker.tsx',
        '**/(faceted)/**/page.tsx',
        '**/(faceted)/**/*.ts',
      ],
      rules: {
        // JSDoc rules - Vertex AI code has minimal JSDoc for simplicity
        'valid-jsdoc': 'off',
        // TypeScript any rules - Google Cloud SDK types are incomplete
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        // Type assertions - needed for Google Cloud SDK types
        '@typescript-eslint/consistent-type-assertions': 'off',
        // Underscore dangle - Vertex AI uses `_gre` as their API convention
        'no-underscore-dangle': ['error', { allow: ['__typename', '_gre'] }],
        // Complexity - Vertex AI integration functions are complex by nature
        complexity: 'off',
        // Member ordering - not critical for integration code
        '@typescript-eslint/member-ordering': 'off',
        // Default params - sometimes needed for API compatibility
        '@typescript-eslint/default-param-last': 'off',
        // Other rules
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-dynamic-delete': 'off',
        '@typescript-eslint/consistent-indexed-object-style': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        'no-restricted-globals': 'off',
        'no-plusplus': 'off',
        'object-shorthand': 'off',
        // Prettier - allow some formatting flexibility for complex Vertex AI code
        'prettier/prettier': 'warn',
        // Import order - less critical for integration code
        'import/order': 'warn',
        'react/jsx-sort-props': 'warn',
      },
    },
  ],
};

module.exports = config;
