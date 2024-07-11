import { exec as execCallback } from 'child_process';
import { readJsonSync } from 'fs-extra/esm';
import { downloadTemplate } from 'giget';
import { addDependency, addDevDependency } from 'nypm';
import { join } from 'path';
import { promisify } from 'util';
import * as z from 'zod';

import { spinner } from './spinner';

const exec = promisify(execCallback);

export async function applyIntegrations(
  integrations: string[] | undefined,
  { projectDir }: { projectDir: string },
) {
  if (!integrations) {
    console.log('No integrations to apply');

    return;
  }

  if (integrations.length > 1) {
    console.warn('Applying multiple integrations is not supported yet');
  }

  const integration = integrations[0];
  const integrationDir = join(projectDir, 'integrations', integration);

  await spinner(
    downloadTemplate(
      // @todo point to main branch
      `github:bigcommerce/catalyst/integrations/${integration}#wip/integrations-cli`,
      {
        dir: integrationDir,
        offline: false,
      },
    ),
    {
      text: `Cloning ${integration} integration...`,
      successText: `${integration} integration cloned successfully`,
      failText: (err) => `Failed to clone ${integration} integration: ${err.message}`,
    },
  );

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
        // @todo: get package manager from project
        packageManager: 'pnpm',
      }),
      {
        text: 'Installing integration dependencies...',
        successText: 'Integration Dependencies installed successfully',
        failText: (err) => `Failed to install dependencies: ${err.message}`,
      },
    );
  }

  if (manifest.devDependencies.length) {
    await spinner(
      addDevDependency(manifest.devDependencies, {
        cwd: projectDir,
        silent: true,
        // @todo get package manager from project
        packageManager: 'pnpm',
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
}
