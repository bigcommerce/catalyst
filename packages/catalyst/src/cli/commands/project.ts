import { Command } from 'commander';
import { colorize } from 'consola/utils';
import { dirname } from 'node:path';

import {
  NoLinkedProjectError,
  selectOrCreateInfrastructureProject,
  setupCommerceHosting,
} from '../lib/commerce-hosting';
import { installDependencies } from '../lib/install-dependencies';
import { consola } from '../lib/logger';
import { createProject, deleteProject, fetchProjects } from '../lib/project';
import { getProjectConfig } from '../lib/project-config';
import { getProjectState } from '../lib/project-state';
import { resolveCredentials } from '../lib/resolve-credentials';
import {
  accessTokenOption,
  apiHostOption,
  projectUuidOption,
  storeHashOption,
} from '../lib/shared-options';
import { getTelemetry } from '../lib/telemetry';

// `catalyst project link` runs from inside `core/`, so the project root (which
// `setupCommerceHosting` and `installDependencies` expect) is one level up.
async function offerCommerceHostingSetup(
  projectUuid: string,
  credentials?: { storeHash: string; accessToken: string },
) {
  if (getProjectState().isTransformed) return;

  const shouldSetup = await consola.prompt(
    'Your project has been linked, but is not fully set up for Commerce Hosting deployments yet. Would you like to run the setup now?',
    { type: 'confirm', initial: true },
  );

  if (!shouldSetup) return;

  const projectDir = dirname(process.cwd());

  setupCommerceHosting({
    projectDir,
    projectUuid,
    storeHash: credentials?.storeHash,
    accessToken: credentials?.accessToken,
  });

  consola.success('Commerce Hosting setup complete.');

  await installDependencies(projectDir);
}

const list = new Command('list')
  .configureHelp({ showGlobalOptions: true })
  .description('List BigCommerce infrastructure projects for your store.')
  .addHelpText(
    'after',
    `
Example:
  $ catalyst project list`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .action(async (options) => {
    const config = getProjectConfig();
    const { storeHash, accessToken } = resolveCredentials(options, config);

    await getTelemetry().identify(storeHash);

    consola.start('Fetching projects...');

    const projects = await fetchProjects(storeHash, accessToken, options.apiHost);

    consola.success('Projects fetched.');

    if (projects.length === 0) {
      consola.info('No projects found.');
      process.exit(0);

      return;
    }

    const linkedProjectUuid = config.get('projectUuid');

    projects.forEach((p) => {
      const marker = p.uuid === linkedProjectUuid ? ` ${colorize('green', '[linked]')}` : '';

      consola.log(`${p.name} (${p.uuid})${marker}`);
    });

    process.exit(0);
  });

const create = new Command('create')
  .configureHelp({ showGlobalOptions: true })
  .description(
    'Create a new BigCommerce infrastructure project and link it to your local Catalyst project.',
  )
  .addHelpText(
    'after',
    `
Example:
  $ catalyst project create`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .action(async (options) => {
    const config = getProjectConfig();
    const { storeHash, accessToken } = resolveCredentials(options, config);

    await getTelemetry().identify(storeHash);

    const newProjectName = await consola.prompt('Enter a name for the new project:', {
      type: 'text',
    });

    const data = await createProject(newProjectName, storeHash, accessToken, options.apiHost);

    consola.success(`Project "${data.name}" created successfully.`);

    consola.start('Writing project UUID to .bigcommerce/project.json...');
    config.set('projectUuid', data.uuid);
    config.set('storeHash', storeHash);
    config.set('accessToken', accessToken);
    consola.success('Project UUID written to .bigcommerce/project.json.');

    process.exit(0);
  });

export const link = new Command('link')
  .configureHelp({ showGlobalOptions: true })
  .description(
    'Link your local Catalyst project to a BigCommerce infrastructure project. You can provide a project UUID directly, or fetch and select from available projects using your store credentials.',
  )
  .addHelpText(
    'after',
    `
Examples:
  # Link interactively (prompts to select or create)
  $ catalyst project link

  # Link using a project UUID directly
  $ catalyst project link --project-uuid <UUID>`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .action(async (options) => {
    const config = getProjectConfig();

    const writeProjectConfig = (
      uuid: string,
      credentials?: { storeHash: string; accessToken: string },
    ) => {
      consola.start('Writing project UUID to .bigcommerce/project.json...');
      config.set('projectUuid', uuid);

      if (credentials) {
        config.set('storeHash', credentials.storeHash);
        config.set('accessToken', credentials.accessToken);
      }

      consola.success('Project UUID written to .bigcommerce/project.json.');
    };

    if (options.projectUuid) {
      writeProjectConfig(options.projectUuid);
      await offerCommerceHostingSetup(options.projectUuid);

      process.exit(0);

      return;
    }

    const { storeHash, accessToken } = resolveCredentials(options, config);

    await getTelemetry().identify(storeHash);

    let selected;

    try {
      selected = await selectOrCreateInfrastructureProject(
        { storeHash, accessToken, apiHost: options.apiHost },
        config.get('projectUuid'),
      );
    } catch (error) {
      if (error instanceof NoLinkedProjectError) {
        consola.info(
          "When you're ready to create a project, run `catalyst project create` or re-run `catalyst project link`.",
        );
        process.exit(0);

        // Unreachable in production; prevents continuation when process.exit is mocked in tests.
        throw error;
      }

      throw error;
    }

    writeProjectConfig(selected.uuid, { storeHash, accessToken });
    await offerCommerceHostingSetup(selected.uuid, { storeHash, accessToken });

    process.exit(0);
  });

const del = new Command('delete')
  .configureHelp({ showGlobalOptions: true })
  .description(
    'Permanently delete a BigCommerce infrastructure project. This action is irreversible.',
  )
  .addHelpText(
    'after',
    `
Examples:
  # Select a project to delete interactively
  $ catalyst project delete

  # Delete a specific project (still prompts for confirmation)
  $ catalyst project delete --project-uuid <UUID>

  # Skip the confirmation prompt
  $ catalyst project delete --project-uuid <UUID> --force`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .option('--force', 'Skip the confirmation prompt before deleting.')
  .action(async (options) => {
    const config = getProjectConfig();
    const { storeHash, accessToken } = resolveCredentials(options, config);

    await getTelemetry().identify(storeHash);

    let targetUuid: string | undefined = options.projectUuid;
    let targetName: string | undefined;

    if (!targetUuid) {
      consola.start('Fetching projects...');

      const projects = await fetchProjects(storeHash, accessToken, options.apiHost);

      consola.success('Projects fetched.');

      if (projects.length === 0) {
        consola.info('No projects found.');
        process.exit(0);

        return;
      }

      const linkedProjectUuid = config.get('projectUuid');

      const selected = await consola.prompt(
        'Select a project to delete (Press <enter> to select).',
        {
          type: 'select',
          options: [
            ...projects.map((p) => ({
              label:
                p.uuid === linkedProjectUuid
                  ? `${p.name} ${colorize('green', '[linked]')}`
                  : p.name,
              value: p.uuid,
              hint: p.uuid,
            })),
            { label: 'Cancel', value: 'cancel', hint: 'Exit without deleting any project.' },
          ],
          cancel: 'reject',
        },
      );

      if (selected === 'cancel') {
        consola.info('Aborted. No project was deleted.');
        process.exit(0);

        return;
      }

      const matched = projects.find((p) => p.uuid === selected);

      if (!matched) {
        throw new Error(`Selected project ${String(selected)} not found in fetched list.`);
      }

      targetUuid = matched.uuid;
      targetName = matched.name;
    }

    if (!options.force) {
      const label = targetName ? `"${targetName}" (${targetUuid})` : targetUuid;

      const confirmed = await consola.prompt(
        `Are you sure you want to delete project ${label}? This action is irreversible and will permanently destroy the project and all of its data.`,
        { type: 'confirm', initial: false },
      );

      if (!confirmed) {
        consola.info('Aborted. No project was deleted.');
        process.exit(0);

        return;
      }
    }

    consola.start(`Deleting project ${targetUuid}...`);

    await deleteProject(targetUuid, storeHash, accessToken, options.apiHost);

    consola.success(`Project ${targetUuid} deleted.`);

    if (config.get('projectUuid') === targetUuid) {
      config.delete('projectUuid');
      consola.info('Removed project UUID from .bigcommerce/project.json.');
    }

    process.exit(0);
  });

export const project = new Command('project')
  .configureHelp({ showGlobalOptions: true })
  .description('Manage your BigCommerce infrastructure project.')
  .addCommand(create)
  .addCommand(list)
  .addCommand(link)
  .addCommand(del);
