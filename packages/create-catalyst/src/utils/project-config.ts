import { input } from '@inquirer/prompts';
import { pathExistsSync } from 'fs-extra/esm';
import kebabCase from 'lodash.kebabcase';
import { join } from 'path';

export const projectConfig = async (opts: { projectDir?: string; projectName?: string }) => {
  let projectName = kebabCase(opts.projectName);
  let projectDir = opts.projectDir && projectName ? join(opts.projectDir, projectName) : undefined;

  if (projectDir && projectName) {
    return { projectDir, projectName };
  }

  const validateProjectName = (i: string) => {
    const formattedInput = kebabCase(i);

    if (!formattedInput) return 'Project name is required';

    const targetDir = join(process.cwd(), formattedInput);

    return pathExistsSync(targetDir) ? `Destination '${targetDir}' already exists` : true;
  };

  const rawProjectName = await input({
    message: 'What is the name of your project?',
    validate: validateProjectName,
  });

  projectName = kebabCase(rawProjectName);
  projectDir = join(process.cwd(), projectName);

  return { projectName, projectDir };
};
