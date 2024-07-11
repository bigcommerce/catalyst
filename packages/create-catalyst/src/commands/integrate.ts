import { Command } from '@commander-js/extra-typings';
import { outputFileSync, writeJsonSync } from 'fs-extra/esm';
import { simpleGit, SimpleGit } from 'simple-git';
import * as z from 'zod';

interface Manifest {
  name: string;
  dependencies: string[];
  devDependencies: string[];
  environmentVariables: string[];
}

export const integrate = new Command('integrate')
  .requiredOption('--integration-name <name>', 'Formatted name of the integration')
  .requiredOption('--source <branch>', 'The branch containing your integration source code')
  .action(async (options) => {
    const manifest: Manifest = {
      name: options.integrationName,
      dependencies: [],
      devDependencies: [],
      environmentVariables: [],
    };

    const git: SimpleGit = simpleGit();

    const { all: localBranches } = await git.branchLocal();

    if (!localBranches.includes(options.source)) {
      console.log(`Branch "${options.source}" does not exist in your local repository.`);
      process.exit(1);
    }

    const packagesDiff = await git.diff([`main...${options.source}`, '--', 'core/package.json']);

    if (packagesDiff.length > 0) {
      const packages: string[] = [];
      const lines = packagesDiff.split('\n');
      const packagePattern = /^\+ {4}"([^"]+)":/;

      lines.forEach((line) => {
        const match = line.match(packagePattern);

        if (match) {
          packages.push(match[1]);
        }
      });

      if (packages.length > 0) {
        const integrationPackageJsonRaw = await git.show([`${options.source}:core/package.json`]);
        const integrationPackageJson = z
          .object({
            dependencies: z.object({}).passthrough(),
            devDependencies: z.object({}).passthrough(),
          })
          .parse(JSON.parse(integrationPackageJsonRaw));

        manifest.dependencies = packages.filter((pkg) => integrationPackageJson.dependencies[pkg]);
        manifest.devDependencies = packages.filter(
          (pkg) => integrationPackageJson.devDependencies[pkg],
        );
      }
    }

    const envVarDiff = await git.diff([`main...${options.source}`, '--', 'core/.env.example']);

    if (envVarDiff.length > 0) {
      const envVars: string[] = [];
      const lines = envVarDiff.split('\n');
      const envPattern = /^\+([A-Z_]+)=/;

      lines.forEach((line) => {
        const match = line.match(envPattern);

        if (match) {
          envVars.push(match[1]);
        }
      });

      if (envVars.length > 0) {
        manifest.environmentVariables = envVars;
      }
    }

    const integrationNameNormalized = options.integrationName.toLowerCase().replace(/\s/g, '-');

    const integrationDiff = await git.diff([
      `main...${options.source}`,
      '--',
      ':(exclude)core/package.json',
      ':(exclude)pnpm-lock.yaml',
    ]);

    outputFileSync(`integrations/${integrationNameNormalized}/integration.patch`, integrationDiff);
    writeJsonSync(`integrations/${integrationNameNormalized}/manifest.json`, manifest, {
      spaces: 2,
    });
  });
