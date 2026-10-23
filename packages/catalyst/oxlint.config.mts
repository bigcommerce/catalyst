import base from '@bigcommerce/eslint-config-catalyst/oxlint/base';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base],
  options: { typeAware: true, maxWarnings: 0 },
  ignorePatterns: ['dist/**'],
  overrides: [
    {
      files: ['src/cli/**'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      // oxlint's `complexity` also counts optional chaining and default values (as ESLint 9 does).
      files: ['src/cli/commands/logs.ts'],
      rules: {
        complexity: 'off',
      },
    },
  ],
});
