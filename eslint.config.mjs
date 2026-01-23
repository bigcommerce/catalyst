import configPromise from '@bigcommerce/eslint-config';
import nextPlugin from '@next/eslint-plugin-next';
import checkFile from 'eslint-plugin-check-file';
import globals from 'globals';

const baseConfig = await configPromise;

export default [
  ...(Array.isArray(baseConfig) ? baseConfig : []),
  {
    plugins: {
      '@next/next': nextPlugin,
      'check-file': checkFile,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: ['./core/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './core/tsconfig.json',
        },
      },
    },
    rules: {
      // Catalyst-specific rules
      '@typescript-eslint/naming-convention': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      'import/dynamic-import-chunkname': 'off',
      'no-underscore-dangle': ['error', { allow: ['__typename'] }],
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      // Disable check-file for now as it requires more configuration
      'check-file/folder-naming-convention': 'off',
      'check-file/filename-naming-convention': 'off',
    },
  },
  // Test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      'core/client/generated/**',
      'playwright-report/**',
      'test-results/**',
      '**/google_analytics4.js',
      'packages/**',
    ],
  },
];
