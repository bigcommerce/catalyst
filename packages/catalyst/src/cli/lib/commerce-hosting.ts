import { input, select, Separator } from '@inquirer/prompts';
import { colorize } from 'consola/utils';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { dirname, join } from 'path';
import { z } from 'zod';

import { consola } from './logger';
import {
  createProject,
  fetchProjects,
  InfrastructureProjectValidationError,
  type ProjectListItem,
} from './project';
import { sortPackageJsonFields } from './sort-package-json';

const OPENNEXT_CLOUDFLARE_VERSION = '1.17.3';

const corePackageJsonSchema = z.looseObject({
  dependencies: z.record(z.string(), z.string()).optional(),
});

const writeJson = (path: string, value: unknown) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};

const symlinkRootEnvToCore = (projectDir: string) => {
  const coreEnvPath = join(projectDir, 'core', '.env.local');

  if (lstatSync(coreEnvPath, { throwIfNoEntry: false })) return;

  try {
    symlinkSync('../.env.local', coreEnvPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';

    consola.warn(
      `Could not create symlink at core/.env.local: ${message}\n` +
        'On Windows, enable Developer Mode or run as administrator to allow symlinks.\n' +
        'You will need to keep .env.local and core/.env.local in sync manually.',
    );
  }
};

const convertProxyToMiddleware = (projectDir: string) => {
  const proxyPath = join(projectDir, 'core', 'proxy.ts');
  const middlewarePath = join(projectDir, 'core', 'middleware.ts');

  if (!existsSync(proxyPath)) return;

  const contents = readFileSync(proxyPath, 'utf-8')
    .replace('export const proxy', 'export const middleware')
    .replace('export const config = {', "export const config = {\n  runtime: 'experimental-edge',");

  writeFileSync(middlewarePath, contents);
  unlinkSync(proxyPath);
};

// The default `core/instrumentation.ts` registers `@vercel/otel`, whose node
// build OpenNext bundles into the worker chunk; workerd then throws on cold
// start with "Failed to prepare server". A Vercel-deploying user may have
// customized the hook though, so we prompt before removing it (and only drop
// `@vercel/otel` if the user agrees — their customization probably imports it).
// In non-TTY contexts (CI deploys, scripts), skip the cleanup with a warning so
// no customization is silently wiped. Exported because callers run this on
// already-transformed projects too, where `setupCommerceHosting` would
// short-circuit.
export const cleanupCloudflareIncompatibilities = async (projectDir: string) => {
  const instrumentationPath = join(projectDir, 'core', 'instrumentation.ts');

  if (!existsSync(instrumentationPath)) return;

  if (!process.stdin.isTTY) {
    consola.warn(
      'core/instrumentation.ts is present and may be incompatible with the Cloudflare Workers ' +
        'bundle (the default @vercel/otel scaffolding throws at cold start under workerd). ' +
        'Skipping automatic cleanup in non-interactive mode — re-run interactively to remove it, ' +
        'or delete/gate it manually.',
    );

    return;
  }

  const shouldRemove = await consola.prompt(
    'Catalyst found core/instrumentation.ts, which is incompatible with the Cloudflare Workers ' +
      'bundle when it uses @vercel/otel (causes "Failed to prepare server" at cold start). ' +
      'Remove it and drop @vercel/otel from core/package.json?',
    { type: 'confirm', initial: true },
  );

  if (!shouldRemove) {
    consola.info(
      'Leaving core/instrumentation.ts in place. The Cloudflare worker will continue to log ' +
        '"Failed to prepare server" at cold start until this is resolved manually.',
    );

    return;
  }

  unlinkSync(instrumentationPath);
  consola.info('Removed core/instrumentation.ts (incompatible with Cloudflare Workers).');

  const corePackageJsonPath = join(projectDir, 'core', 'package.json');

  if (existsSync(corePackageJsonPath)) {
    const pkg = corePackageJsonSchema.parse(JSON.parse(readFileSync(corePackageJsonPath, 'utf-8')));

    if (pkg.dependencies && '@vercel/otel' in pkg.dependencies) {
      const { '@vercel/otel': _removedVercelOtel, ...preservedDeps } = pkg.dependencies;

      pkg.dependencies = preservedDeps;
      writeJson(corePackageJsonPath, sortPackageJsonFields(pkg));
      consola.info('Dropped @vercel/otel from core/package.json.');
    }
  }
};

export const setupCommerceHosting = async ({
  projectDir,
  projectUuid,
  storeHash,
  accessToken,
}: {
  projectDir: string;
  projectUuid: string;
  storeHash?: string;
  accessToken?: string;
}) => {
  await cleanupCloudflareIncompatibilities(projectDir);

  const corePackageJsonPath = join(projectDir, 'core', 'package.json');
  const pkg = corePackageJsonSchema.parse(JSON.parse(readFileSync(corePackageJsonPath, 'utf-8')));

  pkg.dependencies = {
    ...pkg.dependencies,
    '@opennextjs/cloudflare': OPENNEXT_CLOUDFLARE_VERSION,
  };

  writeJson(corePackageJsonPath, sortPackageJsonFields(pkg));

  const projectJson: Record<string, string> = {
    projectUuid,
    framework: 'catalyst',
  };

  if (storeHash) projectJson.storeHash = storeHash;
  if (accessToken) projectJson.accessToken = accessToken;

  writeJson(join(projectDir, 'core', '.bigcommerce', 'project.json'), projectJson);

  symlinkRootEnvToCore(projectDir);
  convertProxyToMiddleware(projectDir);
};

interface CommerceHostingApiContext {
  storeHash: string;
  accessToken: string;
  apiHost: string;
}

// Thrown by `selectOrCreateInfrastructureProject` when the user declines the
// "Would you like to create one?" prompt that surfaces when no projects exist.
// Callers translate this into a context-appropriate error (e.g. "Cannot deploy
// without being linked to a project").
export class NoLinkedProjectError extends Error {
  constructor() {
    super('No infrastructure project linked: user declined to create one.');
    this.name = 'NoLinkedProjectError';
  }
}

async function promptForNewProjectName(api: CommerceHostingApiContext): Promise<ProjectListItem> {
  const newProjectName = await consola.prompt('Enter a name for the new project:', {
    type: 'text',
  });

  const data = await createProject(
    String(newProjectName),
    api.storeHash,
    api.accessToken,
    api.apiHost,
  );

  consola.success(`Project "${data.name}" created successfully.`);

  // Newly created — provisioning is async, hostnames not registered yet.
  return { uuid: data.uuid, name: data.name, deployment_hostnames: [] };
}

// Generic "select an existing project, or create a new one" prompt — used by
// `catalyst project link` and by `catalyst deploy` when its linked project is
// missing. Distinct from `promptForCommerceHostingProject` which has
// default-name + auto-create semantics tailored to `catalyst create`.
//
// Pass `linkedProjectUuid` to decorate the matching project's label with
// `[linked]` so the user can see which one is the current selection.
export async function selectOrCreateInfrastructureProject(
  api: CommerceHostingApiContext,
  linkedProjectUuid?: string,
): Promise<ProjectListItem> {
  consola.start('Fetching projects...');

  const existingProjects = await fetchProjects(api.storeHash, api.accessToken, api.apiHost);

  consola.success('Projects fetched.');

  // No existing projects on the store — skip the select prompt and offer
  // creation directly. Declining means we have nothing to link to.
  if (existingProjects.length === 0) {
    const shouldCreate = await consola.prompt(
      'There are not any hosting projects that you can link to yet. Would you like to create one?',
      { type: 'confirm', initial: true },
    );

    if (!shouldCreate) {
      throw new NoLinkedProjectError();
    }

    return promptForNewProjectName(api);
  }

  const promptOptions = [
    ...existingProjects.map((p) => ({
      label: p.uuid === linkedProjectUuid ? `${p.name} ${colorize('green', '[linked]')}` : p.name,
      value: p.uuid,
      hint: p.uuid,
    })),
    {
      label: 'Create a new project',
      value: 'create',
      hint: 'Create a new hosting project for this Catalyst storefront.',
    },
  ];

  const selected = await consola.prompt(
    'Select a project or create a new project (Press <enter> to select).',
    { type: 'select', options: promptOptions, cancel: 'reject' },
  );

  if (selected === 'create') {
    return promptForNewProjectName(api);
  }

  const matched = existingProjects.find((p) => p.uuid === selected);

  if (!matched) {
    throw new Error(`Selected project ${String(selected)} not found in fetched list.`);
  }

  return matched;
}

export async function promptForCommerceHostingProject(
  api: CommerceHostingApiContext,
  defaultName: string,
  autoUseDefaultName?: boolean,
  useExistingOnCollision?: boolean,
): Promise<ProjectListItem> {
  const existingProjects = await fetchProjects(api.storeHash, api.accessToken, api.apiHost);
  const takenNames = existingProjects.map((project) => project.name);

  if (autoUseDefaultName) {
    return autoCreateCommerceHostingProject(
      api,
      defaultName,
      existingProjects,
      useExistingOnCollision,
    );
  }

  const conflict = existingProjects.find(
    (project) => project.name.toLowerCase() === defaultName.toLowerCase(),
  );

  if (!conflict) {
    return autoCreateCommerceHostingProject(
      api,
      defaultName,
      existingProjects,
      useExistingOnCollision,
    );
  }

  type Action = 'use-named' | 'select-from-list' | 'create';

  const hasOtherProjects = existingProjects.length > 1;

  const choices: Array<{ name: string; value: Action }> = [
    { name: `Use "${conflict.name}"`, value: 'use-named' },
  ];

  if (hasOtherProjects) {
    choices.push({ name: 'Select from my projects', value: 'select-from-list' });
  }

  choices.push({ name: 'Create a new project', value: 'create' });

  const action = await select<Action>({
    message: hasOtherProjects
      ? `It looks like you already have an existing Commerce Hosting project named "${conflict.name}". Would you like to use it, select from your projects, or create a new one?`
      : `It looks like you already have an existing Commerce Hosting project named "${conflict.name}". Would you like to use it, or create a new one?`,
    choices,
  });

  if (action === 'use-named') {
    consola.success(`Using existing Commerce Hosting project "${conflict.name}"`);

    return conflict;
  }

  if (action === 'create') {
    return promptAndCreateCommerceHostingProject(api, takenNames, defaultName);
  }

  const selected = await select<ProjectListItem | 'create-new'>({
    message: 'Which Commerce Hosting project would you like to use?',
    choices: [
      ...existingProjects.map((project) => ({
        name: project.name,
        value: project,
        description: project.uuid,
      })),
      new Separator(),
      { name: 'Create a new project', value: 'create-new' as const },
    ],
  });

  if (selected === 'create-new') {
    return promptAndCreateCommerceHostingProject(api, takenNames, defaultName);
  }

  consola.success(`Using existing Commerce Hosting project "${selected.name}"`);

  return selected;
}

export async function promptAndCreateCommerceHostingProject(
  api: CommerceHostingApiContext,
  takenNames: readonly string[],
  defaultName?: string,
): Promise<ProjectListItem> {
  const projectName = await input({
    message: 'What would you like to name your Commerce Hosting project?',
    default: defaultName,
    validate: (value) => {
      const trimmed = value.trim();

      if (!trimmed) return 'Project name is required';

      const conflict = takenNames.find((taken) => taken.toLowerCase() === trimmed.toLowerCase());

      if (conflict) {
        return `A Commerce Hosting project named "${conflict}" already exists`;
      }

      return true;
    },
    theme: {
      style: {
        help: () =>
          colorize(
            'dim',
            '(The project that hosts your storefront on Commerce — often matches your folder name.)',
          ),
      },
    },
  });

  try {
    const created = await createProject(
      projectName.trim(),
      api.storeHash,
      api.accessToken,
      api.apiHost,
    );

    consola.success(`Commerce Hosting project "${created.name}" created successfully`);

    return { uuid: created.uuid, name: created.name, deployment_hostnames: [] };
  } catch (error) {
    if (error instanceof InfrastructureProjectValidationError) {
      consola.error(error.message);

      return promptAndCreateCommerceHostingProject(api, takenNames, defaultName);
    }

    throw error;
  }
}

async function resolveCollisionChoice(
  existingName: string,
  useExistingOnCollision: boolean | undefined,
): Promise<boolean> {
  if (useExistingOnCollision === true) return true;

  if (!process.stdin.isTTY) return false;

  return select<boolean>({
    message: `A Commerce Hosting project named "${existingName}" already exists. Use the existing project?`,
    choices: [
      { name: 'Yes', value: true },
      { name: 'No', value: false },
    ],
  });
}

async function autoCreateCommerceHostingProject(
  api: CommerceHostingApiContext,
  name: string,
  existingProjects: readonly ProjectListItem[],
  useExistingOnCollision?: boolean,
): Promise<ProjectListItem> {
  const existing = existingProjects.find(
    (project) => project.name.toLowerCase() === name.toLowerCase(),
  );

  if (existing) {
    const shouldUseExisting = await resolveCollisionChoice(existing.name, useExistingOnCollision);

    if (shouldUseExisting) {
      consola.success(`Using existing Commerce Hosting project "${existing.name}"`);

      return existing;
    }

    consola.error(
      'Not reusing the existing project. Re-run with a different --project-name, or pass --use-existing to reuse it.',
    );
    process.exit(1);
  }

  try {
    const created = await createProject(name, api.storeHash, api.accessToken, api.apiHost);

    consola.success(`Commerce Hosting project "${created.name}" created successfully`);

    return { uuid: created.uuid, name: created.name, deployment_hostnames: [] };
  } catch (error) {
    if (error instanceof InfrastructureProjectValidationError) {
      consola.error(
        `Failed to create Commerce Hosting project "${name}": ${error.message}\nRe-run with a different --project-name.`,
      );
      process.exit(1);
    }

    throw error;
  }
}

// Orchestrates prompt + file mutations. Callable from `catalyst create --hosting commerce`
// (eager) and `catalyst deploy` (lazy). Idempotent — safe to re-run.
export async function runCommerceHostingSetup({
  api,
  projectDir,
  defaultProjectName,
  autoUseProjectName,
  useExistingOnCollision,
}: {
  api: CommerceHostingApiContext;
  projectDir: string;
  defaultProjectName: string;
  autoUseProjectName?: boolean;
  useExistingOnCollision?: boolean;
}): Promise<ProjectListItem> {
  const project = await promptForCommerceHostingProject(
    api,
    defaultProjectName,
    autoUseProjectName,
    useExistingOnCollision,
  );

  await setupCommerceHosting({
    projectDir,
    projectUuid: project.uuid,
    storeHash: api.storeHash,
    accessToken: api.accessToken,
  });

  return project;
}
