import { exec as execCallback } from 'child_process';
import { readJsonSync } from 'fs-extra/esm';
import { downloadTemplate } from 'giget';
import { addDependency, addDevDependency } from 'nypm';
import { join } from 'path';
import { promisify } from 'util';
import * as z from 'zod';

import { PackageManager } from './pm';
import { spinner } from './spinner';

const exec = promisify(execCallback);

export async function applyIntegration(
  integration: string | undefined,
  { projectDir, packageManager }: { projectDir: string; packageManager: PackageManager },
) {
  if (!integration) {
    return;
  }

  const integrationDir = join(projectDir, 'integrations', integration);

  await spinner(
    downloadTemplate(`github:bigcommerce/catalyst/integrations/${integration}#main`, {
      dir: integrationDir,
      offline: false,
    }),
    {
      text: `Cloning ${integration} integration...`,
      successText: `${integration} integration cloned successfully`,
      failText: (err) => `Failed to clone ${integration} integration: ${err.message}`,
    },
  );

  try {
    readJsonSync(join(integrationDir, 'manifest.json'));
  } catch (err) {
    console.error(
      `\nNo manifest.json found in the ${integration} integration folder. Please check that the integration exists in the Catalyst monorepo: https://github.com/bigcommerce/catalyst`,
    );

    return;
  }

  const manifest = z
    .object({
      dependencies: z.array(z.string()),
      devDependencies: z.array(z.string()),
      environmentVariables: z.array(z.string()),
    })
    .parse(readJsonSync(join(integrationDir, 'manifest.json')));

  if (manifest.dependencies.length) {
    await spinner(
      addDependency(manifest.dependencies, {
        cwd: projectDir,
        silent: true,
        packageManager,
      }),
      {
        text: 'Installing integration dependencies...',
        successText: 'Integration dependencies installed successfully',
        failText: (err) => `Failed to install dependencies: ${err.message}`,
      },
    );
  }

  if (manifest.devDependencies.length) {
    await spinner(
      addDevDependency(manifest.devDependencies, {
        cwd: projectDir,
        silent: true,
        packageManager,
      }),
      {
        text: 'Installing integration development dependencies...',
        successText: 'Integration development dependencies installed successfully',
        failText: (err) => `Failed to install integration development dependencies: ${err.message}`,
      },
    );
  }

  await spinner(
    exec(`git apply -p2 ${join(integrationDir, 'integration.patch')}`, { cwd: projectDir }),
    {
      text: 'Applying integration patch...',
      successText: 'Integration patch applied successfully',
      failText: (err) => `Failed to apply integration patch: ${err.message}`,
    },
  );

  console.log('\nIntegration applied successfully! Feel free to delete the `integrations` folder.');
}
