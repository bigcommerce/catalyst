import base from '@bigcommerce/eslint-config-catalyst/oxlint/base';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base],
  options: { typeAware: true, maxWarnings: 0 },
  ignorePatterns: ['dist/**'],
  overrides: [
    {
      files: ['**/*'],
      rules: {
        'no-console': 'off',
        'import/no-named-as-default': 'off',
      },
    },
  ],
});
