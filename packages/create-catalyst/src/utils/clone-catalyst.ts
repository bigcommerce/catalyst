import chalk from 'chalk';
import { copySync, ensureDir, readJsonSync, removeSync, writeJsonSync } from 'fs-extra/esm';
import { downloadTemplate } from 'giget';
import merge from 'lodash.merge';
import { join } from 'path';
import * as z from 'zod';

import { spinner } from './spinner';

export const cloneCatalyst = async ({
  codeEditor,
  projectDir,
  projectName,
  ghRef = 'main',
}: {
  codeEditor: string;
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

  await spinner(
    downloadTemplate(`github:bigcommerce/catalyst/packages/components#${ghRef}`, {
      dir: join(projectDir, 'tmp'),
      offline: false,
    }),
    {
      text: 'Cloning Catalyst components...',
      successText: 'Catalyst components cloned successfully',
      failText: (err) => chalk.red(`Failed to clone Catalyst components: ${err.message}`),
    },
  );

  copySync(join(projectDir, 'tmp/src/components'), join(projectDir, 'components', 'ui'));
  copySync(join(projectDir, 'tmp/tailwind.config.js'), join(projectDir, 'tailwind.config.js'));

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
      private: z.boolean().optional(),
      exports: z.object({}).passthrough().optional(),
      sideEffects: z.boolean().optional(),
      peerDependencies: z.object({}).passthrough().optional(),
    })
    .passthrough()
    .parse(
      merge(
        {},
        readJsonSync(join(projectDir, 'tmp/package.json')),
        readJsonSync(join(projectDir, 'package.json')),
        { name: projectName, description: '' },
      ),
    );

  delete packageJson.private;
  delete packageJson.exports;
  delete packageJson.sideEffects;
  delete packageJson.peerDependencies; // will go away
  delete packageJson.dependencies['@bigcommerce/components']; // will go away
  delete packageJson.dependencies['@bigcommerce/catalyst-client'];
  delete packageJson.devDependencies.react; // will go away
  delete packageJson.devDependencies['react-dom']; // will go away
  delete packageJson.devDependencies['@bigcommerce/eslint-config-catalyst'];

  writeJsonSync(join(projectDir, 'package.json'), packageJson, { spaces: 2 });

  const tsConfigJson = z
    .object({
      compilerOptions: z
        .object({
          declaration: z.boolean().optional(),
          declarationMap: z.boolean().optional(),
          paths: z
            .object({
              '@bigcommerce/components/*': z.string().array().optional(),
            })
            .passthrough(),
        })
        .passthrough(),
    })
    .passthrough()
    .parse(
      merge(
        {},
        readJsonSync(join(projectDir, 'tmp/tsconfig.json')),
        readJsonSync(join(projectDir, 'tsconfig.json')),
      ),
    );

  delete tsConfigJson.compilerOptions.declaration;
  delete tsConfigJson.compilerOptions.declarationMap;

  tsConfigJson.compilerOptions.paths['@bigcommerce/components/*'] = ['./components/ui/*'];

  writeJsonSync(join(projectDir, 'tsconfig.json'), tsConfigJson, { spaces: 2 });

  removeSync(join(projectDir, 'tmp'));
};
