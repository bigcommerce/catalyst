import chalk from 'chalk';
import { copySync, readJsonSync, removeSync, writeJsonSync } from 'fs-extra/esm';
import { downloadTemplate } from 'giget';
import merge from 'lodash.merge';
import set from 'lodash.set';
import unset from 'lodash.unset';
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
    .object({})
    .passthrough()
    .parse(
      merge(
        {},
        readJsonSync(join(projectDir, 'tmp/package.json')),
        readJsonSync(join(projectDir, 'package.json')),
        { name: projectName, description: '' },
      ),
    );

  unset(packageJson, 'private');
  unset(packageJson, 'exports');
  unset(packageJson, 'sideEffects');
  unset(packageJson, 'peerDependencies'); // will go away
  unset(packageJson, 'dependencies.@bigcommerce/components'); // will go away
  unset(packageJson, 'devDependencies.react'); // will go away
  unset(packageJson, 'devDependencies.react-dom'); // will go away

  set(packageJson, 'dependencies.@bigcommerce/catalyst-client', `^0.1.0`);
  set(packageJson, 'devDependencies.@bigcommerce/eslint-config-catalyst', `^0.1.0`);

  writeJsonSync(join(projectDir, 'package.json'), packageJson, { spaces: 2 });

  const tsConfigJson = z
    .object({})
    .passthrough()
    .parse(
      merge(
        {},
        readJsonSync(join(projectDir, 'tmp/tsconfig.json')),
        readJsonSync(join(projectDir, 'tsconfig.json')),
      ),
    );

  unset(tsConfigJson, 'compilerOptions.declaration');
  unset(tsConfigJson, 'compilerOptions.declarationMap');

  set(tsConfigJson, 'compilerOptions.paths.@bigcommerce/components/*', ['./components/ui/*']);

  writeJsonSync(join(projectDir, 'tsconfig.json'), tsConfigJson, { spaces: 2 });

  removeSync(join(projectDir, 'tmp'));
};
