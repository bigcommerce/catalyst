import { confirm, input, select, Separator } from '@inquirer/prompts';
import { colorize } from 'consola/utils';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
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

const OPENNEXT_CLOUDFLARE_VERSION = '1.20.3';

const corePackageJsonSchema = z.looseObject({
  dependencies: z.record(z.string(), z.string()).optional(),
});

// Loose on purpose: the point is to carry unknown keys through untouched, so
// this only asserts the file holds an object at all.
const projectJsonSchema = z.looseObject({});

// Existing contents of `.bigcommerce/project.json`, or an empty object if it is
// absent, unreadable, or not a JSON object. A corrupt file shouldn't fail setup
// -- the keys this helper writes are enough to rebuild a working project.
const readProjectJson = (path: string): Record<string, unknown> => {
  if (!existsSync(path)) return {};

  try {
    const parsed = projectJsonSchema.safeParse(JSON.parse(readFileSync(path, 'utf-8')));

    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
};

const writeJson = (path: string, value: unknown) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};

// The default `instrumentation.ts` registers `@vercel/otel`, whose node
// build OpenNext bundles into the worker chunk; workerd then throws on cold
// start with "Failed to prepare server". A Vercel-deploying user may have
// customized the hook though, so we prompt before removing it (and only drop
// `@vercel/otel` if the user agrees — their customization probably imports it).
// In non-TTY contexts (CI deploys, scripts), skip the cleanup with a warning so
// no customization is silently wiped. Exported because callers run this on
// already-transformed projects too, where `setupCommerceHosting` would
// short-circuit.
export const cleanupCloudflareIncompatibilities = async (projectDir: string) => {
  const instrumentationPath = join(projectDir, 'instrumentation.ts');

  if (!existsSync(instrumentationPath)) return;

  if (!process.stdin.isTTY) {
    consola.warn(
      'instrumentation.ts is present and may be incompatible with the Cloudflare Workers ' +
        'bundle (the default @vercel/otel scaffolding throws at cold start under workerd). ' +
        'Skipping automatic cleanup in non-interactive mode — re-run interactively to remove it, ' +
        'or delete/gate it manually.',
    );

    return;
  }

  const shouldRemove = await confirm({
    message:
      'Catalyst found instrumentation.ts, which is incompatible with the Cloudflare Workers ' +
      'bundle when it uses @vercel/otel (causes "Failed to prepare server" at cold start). ' +
      'Remove it and drop @vercel/otel from package.json?',
    default: true,
  });

  if (!shouldRemove) {
    consola.info(
      'Leaving instrumentation.ts in place. The Cloudflare worker will continue to log ' +
        '"Failed to prepare server" at cold start until this is resolved manually.',
    );

    return;
  }

  unlinkSync(instrumentationPath);
  consola.info('Removed instrumentation.ts (incompatible with Cloudflare Workers).');

  const corePackageJsonPath = join(projectDir, 'package.json');

  if (existsSync(corePackageJsonPath)) {
    const pkg = corePackageJsonSchema.parse(JSON.parse(readFileSync(corePackageJsonPath, 'utf-8')));

    if (pkg.dependencies && '@vercel/otel' in pkg.dependencies) {
      const { '@vercel/otel': _removedVercelOtel, ...preservedDeps } = pkg.dependencies;

      pkg.dependencies = preservedDeps;
      writeJson(corePackageJsonPath, sortPackageJsonFields(pkg));
      consola.info('Dropped @vercel/otel from package.json.');
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

  const corePackageJsonPath = join(projectDir, 'package.json');
  const pkg = corePackageJsonSchema.parse(JSON.parse(readFileSync(corePackageJsonPath, 'utf-8')));

  pkg.dependencies = {
    ...pkg.dependencies,
    '@opennextjs/cloudflare': OPENNEXT_CLOUDFLARE_VERSION,
  };

  writeJson(corePackageJsonPath, sortPackageJsonFields(pkg));

  const projectJsonPath = join(projectDir, '.bigcommerce', 'project.json');

  // Merge rather than rebuild. `catalyst env` stores deployment variables under
  // `env` in this same file and `apiHost` is persisted here too, so
  // constructing a fresh object silently dropped both. Losing `env` is the
  // costly one: those entries are sent as secrets on every `catalyst deploy`,
  // so a wipe means the next deploy ships a worker without its storefront
  // credentials, with nothing in the output mentioning env vars. `deploy` and
  // `projects link` both reach this on projects that already hold real values.
  const projectJson: Record<string, unknown> = {
    ...readProjectJson(projectJsonPath),
    projectUuid,
    framework: 'catalyst',
  };

  // Absent means "not supplied on this run", not "clear it" -- linking without
  // credentials must not drop credentials the project already had.
  if (storeHash) projectJson.storeHash = storeHash;
  if (accessToken) projectJson.accessToken = accessToken;

  writeJson(projectJsonPath, projectJson);
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
  const newProjectName = await input({ message: 'Enter a name for the new project:' });

  const data = await createProject(newProjectName, api.storeHash, api.accessToken, api.apiHost);

  consola.success(`Project "${data.name}" created successfully.`);

  // Newly created — provisioning is async, hostnames not registered yet.
  return { uuid: data.uuid, name: data.name, deployment_hostnames: [] };
}

// Generic "select an existing project, or create a new one" prompt — used by
// `catalyst projects link` and by `catalyst deploy` when its linked project is
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
    const shouldCreate = await confirm({
      message:
        'There are not any hosting projects that you can link to yet. Would you like to create one?',
      default: true,
    });

    if (!shouldCreate) {
      throw new NoLinkedProjectError();
    }

    return promptForNewProjectName(api);
  }

  const choices = [
    ...existingProjects.map((p) => ({
      name: p.uuid === linkedProjectUuid ? `${p.name} ${colorize('green', '[linked]')}` : p.name,
      value: p.uuid,
      description: p.uuid,
    })),
    {
      name: 'Create a new project',
      value: 'create',
      description: 'Create a new hosting project for this Catalyst storefront.',
    },
  ];

  const selected = await select({
    message: 'Select a project or create a new project (Press <enter> to select).',
    choices,
  });

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
