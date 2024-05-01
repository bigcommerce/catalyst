import chalk from 'chalk';
import { readFile, writeFile } from 'fs/promises';
import { ensureDir, readJsonSync, removeSync, writeJsonSync } from 'fs-extra/esm';
import { downloadTemplate } from 'giget';
import merge from 'lodash.merge';
import { join } from 'path';
import * as z from 'zod';

import { spinner } from './spinner';

export const cloneCatalyst = async ({
  codeEditor,
  includeFunctionalTests,
  projectDir,
  projectName,
  ghRef = 'main',
}: {
  codeEditor: string;
  includeFunctionalTests: boolean;
  projectDir: string;
  projectName: string;
  ghRef?: string;
}) => {
  await spinner(
    downloadTemplate(`github:bigcommerce/catalyst/apps/core#${ghRef}`, {
      dir: projectDir,
      offline: false,
    }),
    {
      text: 'Cloning Catalyst template...',
      successText: 'Catalyst template cloned successfully',
      failText: (err) => chalk.red(`Failed to clone Catalyst template: ${err.message}`),
    },
  );

  switch (codeEditor) {
    case 'vscode':
      await ensureDir(join(projectDir, '.vscode'));

      writeJsonSync(
        join(projectDir, '.vscode/settings.json'),
        { 'typescript.tsdk': 'node_modules/typescript/lib' },
        { spaces: 2 },
      );
      break;

    default:
      break;
  }

  const packageJson = z
    .object({
      name: z.string(),
      description: z.string(),
      version: z.string(),
      scripts: z.object({}).passthrough().optional(),
      dependencies: z.object({}).passthrough(),
      devDependencies: z.object({}).passthrough(),
    })
    .passthrough()
    .parse(
      merge({}, readJsonSync(join(projectDir, 'package.json')), {
        name: projectName,
        description: '',
      }),
    );

  delete packageJson.dependencies['@bigcommerce/catalyst-client'];
  delete packageJson.devDependencies['@bigcommerce/eslint-config-catalyst'];

  if (!includeFunctionalTests) {
    delete packageJson.devDependencies['@faker-js/faker'];
    delete packageJson.devDependencies['@playwright/test'];
  }

  writeJsonSync(join(projectDir, 'package.json'), packageJson, { spaces: 2 });

  if (!includeFunctionalTests) {
    const tsConfigJson = z
      .object({
        include: z.array(z.string()).optional(),
      })
      .passthrough()
      .parse(readJsonSync(join(projectDir, 'tsconfig.json')));

    tsConfigJson.include = tsConfigJson.include?.filter(
      (include) => !['tests/**/*', 'playwright.config.ts'].includes(include),
    );

    writeJsonSync(join(projectDir, 'tsconfig.json'), tsConfigJson, { spaces: 2 });
  }

  if (!includeFunctionalTests) {
    const eslint = (await readFile(join(projectDir, '.eslintrc.cjs'), { encoding: 'utf-8' }))
      .replace(/['"]playwright-report\/\*\*['"],?/, '')
      .replace(/['"]test-results\/\*\*['"],?/, '');

    await writeFile(join(projectDir, '.eslintrc.cjs'), eslint);

    removeSync(join(projectDir, 'tests'));
    removeSync(join(projectDir, 'playwright.config.ts'));
  }
};
