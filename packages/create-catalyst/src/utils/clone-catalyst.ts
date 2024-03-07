import chalk from 'chalk';
import { copySync, readJsonSync, removeSync, writeJsonSync } from 'fs-extra/esm';
import { downloadTemplate } from 'giget';
import merge from 'lodash.merge';
import { join } from 'path';
import * as z from 'zod';

import { spinner } from './spinner';

export const cloneCatalyst = async ({
  projectDir,
  projectName,
  ghRef = 'main',
}: {
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

  const packageJson = z
    .object({
      private: z.boolean().optional(),
      exports: z.object({}).passthrough().optional(),
      sideEffects: z.boolean().optional(),
      peerDependencies: z.object({}).passthrough().optional(),
      dependencies: z
        .object({
          '@bigcommerce/components': z.string().optional(),
          '@bigcommerce/catalyst-client': z.string().optional(),
        })
        .passthrough(),
      devDependencies: z
        .object({
          react: z.string().optional(),
          'react-dom': z.string().optional(),
          '@bigcommerce/eslint-config-catalyst': z.string().optional(),
        })
        .passthrough(),
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
  delete packageJson.devDependencies.react; // will go away
  delete packageJson.devDependencies['react-dom']; // will go away

  packageJson.dependencies['@bigcommerce/catalyst-client'] = `^0.1.1`;
  packageJson.devDependencies['@bigcommerce/eslint-config-catalyst'] = `^0.1.0`;

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
