import { Command, Option } from 'commander';
import consola from 'consola';

import { action } from './action';

export type Options = ReturnType<typeof build.opts>;

export const build = new Command('build')
  .addOption(new Option('--verbose', 'Enable verbose output, useful for debugging').default(false))
  .addOption(
    new Option('--framework <framework>', 'The framework to use for the build').choices([
      'catalyst',
      'nextjs',
    ]),
  )
  .action(async (options) => {
    try {
      await action(options);
    } catch (error) {
      consola.error(error);
      if (!options.verbose) consola.box('For more information, run again with --verbose');
      process.exit(1);
    }
  });
