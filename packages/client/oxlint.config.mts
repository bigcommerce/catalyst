import base from '@bigcommerce/eslint-config-catalyst/oxlint/base';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base],
  options: { typeAware: true, maxWarnings: 0 },
  ignorePatterns: ['dist/**', 'src/generated/**'],
  overrides: [
    {
      files: ['**/*'],
      rules: {
        'typescript/consistent-type-assertions': 'off',
        'no-underscore-dangle': ['error', { allow: ['__typename'] }],
        'check-file/filename-naming-convention': 'off',
      },
    },
    {
      // oxlint's `complexity` also counts optional chaining and default values (as ESLint 9 does).
      files: ['src/client.ts'],
      rules: {
        complexity: 'off',
      },
    },
  ],
});
