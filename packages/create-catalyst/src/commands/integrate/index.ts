import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import { appendFileSync, readFileSync } from 'fs';
import { readJsonSync } from 'fs-extra/esm';
import { downloadTemplate } from 'giget';
import { addDependency, addDevDependency } from 'nypm';
import { oraPromise } from 'ora';

import { EnvironmentVariableOptionSchema, GitHubContentResponse, ManifestSchema } from './schemas';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function quit() {
  console.log('Quitting...');
  process.exit(1);
}

/**
 * @todo Implement "undo" functionality?
 * @todo Test cases:
 * 1. Missing provider name
 * 2. Provider name is not available
 * 3. Provider requires environment variables but none are passed
 * 4. Provider requires environment variables but not all are passed
 */

export const integrate = new Command('integrate')
  .argument('<provider>')
  .option('--env <env...>', 'Environment variables to set for the provider')
  .action(async (provider, { env: envRaw }) => {
    /**
     * Reaches out to GitHub to get a list of available providers based on
     * the folders in the integrations directory.
     *
     * @todo try/catch
     * @todo github rate limits for unauthenticated requests
     */
    const availableProvidersResponse = await fetch(
      'https://api.github.com/repos/bigcommerce/catalyst/contents/integrations?ref=integrate/algolia',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      },
    );

    const availableProviders = GitHubContentResponse.parse(
      await availableProvidersResponse.json(),
    ).map(({ name }) => name);

    if (!availableProviders.includes(provider)) {
      console.error(
        chalk.red(
          `ERROR: Provider "${provider}" not found. Available providers are: ${availableProviders.join(
            ', ',
          )}\n`,
        ),
      );
      process.exit(1);
    }

    /**
     * Ensure the integrate command is run from a Catalyst project directory
     *
     * @todo probably need a more reliable way to detect a Catalyst project
     */
    try {
      const file = readFileSync('.gitignore', 'utf-8');

      if (!file.includes('.catalyst')) {
        console.error(
          chalk.red('ERROR: You must run this command from a Catalyst project directory\n'),
        );
        process.exit(1);
      }
    } catch (err) {
      console.error(
        chalk.red('ERROR: You must run this command from a Catalyst project directory\n'),
      );
      process.exit(1);
    }

    /**
     * Download the provider template from the Catalyst repository
     *
     * @todo Implement provider selection
     * @todo Implement constant for dir at runtime
     */
    await oraPromise(
      downloadTemplate(`github:bigcommerce/catalyst/integrations/algolia#integrate/algolia`, {
        dir: 'integrations/algolia',
      }),
      {
        text: 'Cloning Algolia integration template...',
        successText: 'Algolia integration template cloned successfully',
        failText: 'Failed to clone Algolia integration template',
        spinner: 'triangle',
      },
    );

    const manifest = ManifestSchema.parse(readJsonSync('integrations/algolia/manifest.json'));

    /**
     * Set environment variables if any
     */
    const manifestEnvironmentVariables = manifest.environmentVariables;

    if (manifestEnvironmentVariables && manifestEnvironmentVariables.length > 0) {
      const env = EnvironmentVariableOptionSchema.parse(envRaw);

      const missingEnv = manifestEnvironmentVariables.filter(
        (variable) => !env.some((e) => e.includes(variable)),
      );

      if (missingEnv.length > 0) {
        console.error(
          chalk.red(
            `\nERROR: The provider "${provider}" requires the following environment variables:\n${missingEnv.join(
              '\n',
            )}\n`,
          ),
        );
        process.exit(1);
      }

      /**
       * @todo handle improperly formatted environment variables
       */
      appendFileSync(
        '.env.example',
        `\n# ${manifest.name} Environment Variables\n${env.map((e) => `${e.split('=')[0]}=`).join('\n')}\n`,
      );
      appendFileSync(
        '.env.local',
        `\n# ${manifest.name} Environment Variables\n${env.join('\n')}\n`,
      );
    }

    /**
     * Install dependencies if any
     */
    if (manifest.dependencies && manifest.dependencies.length > 0) {
      /**
       * @todo detect package manager
       */
      await oraPromise(
        addDependency(manifest.dependencies, { packageManager: 'pnpm', silent: true }),
        {
          text: 'Installing dependencies...',
          successText: 'Dependencies installed successfully',
          failText: 'Failed to install dependencies',
          spinner: 'triangle',
        },
      );
    }

    /**
     * Install development dependencies if any
     */
    if (manifest.devDependencies && manifest.devDependencies.length > 0) {
      /**
       * @todo detect package manager
       */
      await oraPromise(
        addDevDependency(manifest.devDependencies, { packageManager: 'pnpm', silent: true }),
        {
          text: 'Installing development dependencies...',
          successText: 'Development dependencies installed successfully',
          failText: 'Failed to install development dependencies',
          spinner: 'triangle',
        },
      );
    }
  });

// import { Command } from '@commander-js/extra-typings';
// import chalk from 'chalk';
// import { readFileSync } from 'fs';
// import { addDependency } from 'nypm';
// import * as z from 'zod';

// const Providers = z.enum(['algolia']);

// const providerOptions = Providers.options;

// type ProvidersConfig = {
//   [key in (typeof providerOptions)[number]]: {
//     name: string;
//     dependencies?: string[];
//   };
// };

// const providersConfig: ProvidersConfig = {
//   algolia: {
//     name: 'Algolia',
//     dependencies: ['algoliasearch', 'react-instantsearch', 'react-instantsearch-nextjs'],
//   },
// };

// export const integrate = new Command('integrate')
//   .argument('<provider>', 'The provider to integrate with.')
//   .action(async (providerArg) => {
//     /**
//      * Ensure the command is run from a Catalyst project directory
//      */
//     try {
//       const file = readFileSync('.gitignore', 'utf-8');

//       if (!file.includes('.catalyst')) {
//         console.error(
//           chalk.red('ERROR: You must run this command from a Catalyst project directory\n'),
//         );
//         process.exit(1);
//       }
//     } catch (err) {
//       console.error(
//         chalk.red('ERROR: You must run this command from a Catalyst project directory\n'),
//       );
//       process.exit(1);
//     }

//     const cwd = process.cwd();
//     const provider = Providers.parse(providerArg);
//     const config = providersConfig[provider];

//     console.dir({ cwd, ...providersConfig }, { depth: null });

//     /**
//      * Install dependencies if any
//      */
//     if (config.dependencies && config.dependencies.length > 0) {
//       /**
//        * @todo detect package manager
//        */
//       await addDependency(config.dependencies, { packageManager: 'pnpm' });
//     }
// });

// const tsconfig = z
//   .object({
//     compilerOptions: z
//       .object({
//         plugins: z.array(
//           z.object({
//             name: z.string(),
//             schema: z.string().optional(),
//             tadaOutputLocation: z.string().optional(),
//             schemas: z.array(z.object({}).passthrough()).optional(),
//           }),
//         ),
//       })
//       .passthrough(),
//   })
//   .passthrough()
//   .parse(readJsonSync('tsconfig.json'));

// tsconfig.compilerOptions.plugins.forEach((plugin) => {
//   if (plugin.name === '@0no-co/graphqlsp') {
//     plugin.schemas = plugin.schemas ?? [];

//     if (plugin.schema && plugin.tadaOutputLocation) {
//       plugin.schemas.push({
//         name: 'bigcommerce',
//         schema: plugin.schema,
//         tadaOutputLocation: plugin.tadaOutputLocation,
//       });

//       delete plugin.schema;
//       delete plugin.tadaOutputLocation;
//     }

//     plugin.schemas.push({
//       name: provider,
//       schema: `./${provider}.graphql`,
//       tadaOutputLocation: `./${provider}-graphql.d.ts`,
//     });
//   }
// });
