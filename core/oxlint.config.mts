import base from '@bigcommerce/eslint-config-catalyst/oxlint/base';
import next from '@bigcommerce/eslint-config-catalyst/oxlint/next';
import react from '@bigcommerce/eslint-config-catalyst/oxlint/react';
import { defineConfig } from 'oxlint';

const restrictedImports = [
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
    message:
      'Please import `useRouter`/`usePathname` from `~/i18n/routing`, and `redirect`/`permanentRedirect` from `~/i18n/navigation-server`, so that merchant-configured locale subfolders are applied.',
  },
  {
    name: '@playwright/test',
    importNames: ['expect', 'test'],
    message: 'Please import from `~/tests/fixtures` instead.',
  },
];

export default defineConfig({
  extends: [base, react, next],
  options: { typeAware: true },
  settings: {
    ...base.settings,
    // eslint-plugin-import can't resolve tsconfig paths under oxlint, so name the aliases.
    'import/internal-regex': '^(~|@/vibes)/',
  },
  ignorePatterns: [
    '.next/**',
    '.wrangler/**',
    '.open-next/**',
    'out/**',
    'build/**',
    'messages/*.d.json.ts',
    'next-env.d.ts',
    '*-graphql.d.ts',
  ],
  overrides: [
    {
      files: ['**/*'],
      rules: {
        'nextjs/no-html-link-for-pages': 'off',
        // Pages Router only; App Router's root layout is the right place for beforeInteractive.
        'nextjs/no-before-interactive-script-outside-document': 'off',
        'no-underscore-dangle': ['error', { allow: ['__typename'] }],
        'typescript/prefer-nullish-coalescing': 'off',
        'typescript/no-unsafe-enum-comparison': 'off',
        'no-restricted-imports': ['error', { paths: restrictedImports }],
        'check-file/folder-naming-convention': ['error', { '**': 'NEXT_JS_APP_ROUTER_CASE' }],
      },
    },
    {
      // oxlint's `complexity` also counts optional chaining and default values (as ESLint 9
      // does); these were under the limit with ESLint 8. Remove entries as they are refactored.
      files: [
        'app/[[]locale]/(default)/cart/_actions/update-shipping-info.ts',
        'app/[[]locale]/(default)/cart/page.tsx',
        'app/[[]locale]/(default)/product/[[]slug]/page.tsx',
        'data-transformers/prices-transformer.ts',
        'data-transformers/product-options-transformer.ts',
        'vibes/soul/form/range-input/index.tsx',
        'vibes/soul/primitives/navigation/index.tsx',
        'vibes/soul/primitives/product-card/index.tsx',
        'vibes/soul/sections/cart/client.tsx',
        'vibes/soul/sections/cart/shipping-form/index.tsx',
        'vibes/soul/sections/product-detail/product-detail-form.tsx',
      ],
      rules: {
        complexity: 'off',
      },
    },
    {
      files: ['**/*.spec.ts', '**/*.test.ts'],
      rules: {
        'no-restricted-imports': [
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
  ],
});
