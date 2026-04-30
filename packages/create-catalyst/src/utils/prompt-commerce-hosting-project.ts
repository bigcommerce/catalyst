import { input, select, Separator } from '@inquirer/prompts';
import { colorize } from 'consola/utils';

import { CliApi, type InfrastructureProject } from './cli-api';
import { InfrastructureProjectValidationError } from './cli-api-errors';

export async function promptForCommerceHostingProject(
  cliApi: CliApi,
  defaultName: string,
  autoUseDefaultName?: boolean,
  useExistingOnCollision?: boolean,
): Promise<InfrastructureProject> {
  const existingProjects = await cliApi.listInfrastructureProjects();
  const takenNames = existingProjects.map((project) => project.name);

  if (autoUseDefaultName) {
    return autoCreateCommerceHostingProject(
      cliApi,
      defaultName,
      existingProjects,
      useExistingOnCollision,
    );
  }

  // If the project directory name doesn't collide with an existing Commerce Hosting project,
  // reuse it as the project name and skip the prompt entirely. (When no projects exist, this
  // path also fires — `find` returns undefined, which is exactly what we want.)
  const conflict = existingProjects.find(
    (project) => project.name.toLowerCase() === defaultName.toLowerCase(),
  );

  if (!conflict) {
    return autoCreateCommerceHostingProject(
      cliApi,
      defaultName,
      existingProjects,
      useExistingOnCollision,
    );
  }

  type Action = 'use-named' | 'select-from-list' | 'create';

  // Only offer the list selection if there's actually another project to pick.
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
    console.log(colorize('green', `Using existing Commerce Hosting project "${conflict.name}"`));

    return conflict;
  }

  if (action === 'create') {
    return promptAndCreateCommerceHostingProject(cliApi, takenNames, defaultName);
  }

  const selected = await select<InfrastructureProject | 'create-new'>({
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
    return promptAndCreateCommerceHostingProject(cliApi, takenNames, defaultName);
  }

  console.log(colorize('green', `Using existing Commerce Hosting project "${selected.name}"`));

  return selected;
}

export async function promptAndCreateCommerceHostingProject(
  cliApi: CliApi,
  takenNames: readonly string[],
  defaultName?: string,
): Promise<InfrastructureProject> {
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
    const created = await cliApi.createInfrastructureProject(projectName.trim());

    console.log(
      colorize('green', `Commerce Hosting project "${created.name}" created successfully`),
    );

    return created;
  } catch (error) {
    if (error instanceof InfrastructureProjectValidationError) {
      console.error(colorize('red', `\n${error.message}\n`));

      return promptAndCreateCommerceHostingProject(cliApi, takenNames, defaultName);
    }

    throw error;
  }
}

async function resolveCollisionChoice(
  existingName: string,
  useExistingOnCollision: boolean | undefined,
): Promise<boolean> {
  if (useExistingOnCollision === true) return true;

  // Without the flag and no interactive terminal (CI, piped scripts), default to "No" so the
  // CLI doesn't hang waiting for input that will never arrive.
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
  cliApi: CliApi,
  name: string,
  existingProjects: readonly InfrastructureProject[],
  useExistingOnCollision?: boolean,
): Promise<InfrastructureProject> {
  const existing = existingProjects.find(
    (project) => project.name.toLowerCase() === name.toLowerCase(),
  );

  if (existing) {
    const shouldUseExisting = await resolveCollisionChoice(existing.name, useExistingOnCollision);

    if (shouldUseExisting) {
      console.log(colorize('green', `Using existing Commerce Hosting project "${existing.name}"`));

      return existing;
    }

    console.error(
      colorize(
        'red',
        '\nNot reusing the existing project. Re-run with a different --project-name, or pass --use-existing to reuse it.\n',
      ),
    );
    process.exit(1);
  }

  try {
    const created = await cliApi.createInfrastructureProject(name);

    console.log(
      colorize('green', `Commerce Hosting project "${created.name}" created successfully`),
    );

    return created;
  } catch (error) {
    if (error instanceof InfrastructureProjectValidationError) {
      console.error(
        colorize(
          'red',
          `\nFailed to create Commerce Hosting project "${name}": ${error.message}\nRe-run with a different --project-name.\n`,
        ),
      );
      process.exit(1);
    }

    throw error;
  }
}
