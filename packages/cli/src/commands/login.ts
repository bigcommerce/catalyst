import { Command, Option } from 'commander';
import Conf from 'conf';
import consola from 'consola';
import path from 'node:path';
import * as z from 'zod/v4';

const config = new Conf({
  cwd: path.join(process.cwd(), '.bigcommerce'),
  projectSuffix: '',
  configName: 'project',
});

const AuthSchema = z.object({
  storeHash: z.string().min(1),
  accessToken: z.string().min(1),
});

export const login = new Command('login')
  .description(
    'Authenticate with a single BigCommerce store. ' +
      'Your credentials will be stored in your home directory.',
  )
  .addOption(
    new Option(
      '--store-hash <hash>',
      'BigCommerce store hash. Can be found in the URL of your store Control Panel.',
    ).env('BIGCOMMERCE_STORE_HASH'),
  )
  .addOption(
    new Option(
      '--access-token <token>',
      'BigCommerce access token. Can be found after creating a store-level API account.',
    ).env('BIGCOMMERCE_ACCESS_TOKEN'),
  )
  .action((opts) => {
    try {
      const auth = AuthSchema.parse({
        storeHash: opts.storeHash,
        accessToken: opts.accessToken,
      });

      config.set('auth', auth);
      consola.success('Authentication successful');
    } catch (error) {
      if (error instanceof z.ZodError) {
        consola.fatal(z.prettifyError(error));
        process.exit(1);
      }

      consola.fatal(error);
      process.exit(1);
    }
  });
