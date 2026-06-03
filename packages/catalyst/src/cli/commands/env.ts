import { Command } from 'commander';

import { getStoredEnv, parseEnvAssignment } from '../lib/env-config';
import { consola } from '../lib/logger';
import { getProjectConfig } from '../lib/project-config';

// Values are secrets, so we never print them back. A fixed-width mask avoids
// leaking the length of the stored value.
const MASK = '••••••';

const add = new Command('add')
  .configureHelp({ showGlobalOptions: true })
  .description(
    'Add or update one or more deployment environment variables. Stored in .bigcommerce/project.json and sent as secrets on every `catalyst deploy`.',
  )
  .argument('<vars...>', 'One or more environment variables in KEY=VALUE format.')
  .addHelpText(
    'after',
    `
Example:
  $ catalyst env add BIGCOMMERCE_STORE_HASH=abc123 BIGCOMMERCE_STOREFRONT_TOKEN=ey...`,
  )
  .action((vars: string[]) => {
    const config = getProjectConfig();
    const stored = { ...getStoredEnv(config) };

    // Parse everything before writing so a single invalid entry doesn't leave a
    // partial update behind.
    const parsed = vars.map((entry) => parseEnvAssignment(entry));

    parsed.forEach(({ key, value }) => {
      stored[key] = value;
    });

    config.set('env', stored);

    const keys = parsed.map(({ key }) => key);

    consola.success(
      `Saved ${keys.length} environment variable${keys.length === 1 ? '' : 's'} to .bigcommerce/project.json:`,
    );
    keys.forEach((key) => consola.log(`  ${key}=${MASK}`));

    process.exit(0);
  });

const remove = new Command('remove')
  .configureHelp({ showGlobalOptions: true })
  .description('Remove one or more stored deployment environment variables.')
  .argument('<keys...>', 'One or more environment variable names to remove.')
  .addHelpText(
    'after',
    `
Example:
  $ catalyst env remove BIGCOMMERCE_STORE_HASH BIGCOMMERCE_STOREFRONT_TOKEN`,
  )
  .action((keys: string[]) => {
    const config = getProjectConfig();
    const stored = getStoredEnv(config);
    const toRemove = new Set<string>();

    keys.forEach((key) => {
      if (key in stored) {
        toRemove.add(key);
      } else {
        consola.warn(`No stored environment variable named "${key}". Skipping.`);
      }
    });

    const next = Object.fromEntries(Object.entries(stored).filter(([key]) => !toRemove.has(key)));

    config.set('env', next);

    const removed = Array.from(toRemove);

    if (removed.length > 0) {
      consola.success(
        `Removed ${removed.length} environment variable${removed.length === 1 ? '' : 's'}: ${removed.join(', ')}.`,
      );
    }

    process.exit(0);
  });

const list = new Command('list')
  .configureHelp({ showGlobalOptions: true })
  .description('List stored deployment environment variables (values are masked).')
  .addHelpText(
    'after',
    `
Example:
  $ catalyst env list`,
  )
  .action(() => {
    const config = getProjectConfig();
    const stored = getStoredEnv(config);
    const keys = Object.keys(stored).sort();

    if (keys.length === 0) {
      consola.info('No environment variables stored. Add one with `catalyst env add KEY=VALUE`.');
      process.exit(0);

      return;
    }

    keys.forEach((key) => consola.log(`${key}=${MASK}`));

    process.exit(0);
  });

export const env = new Command('env')
  .configureHelp({ showGlobalOptions: true })
  .description(
    'Manage persistent deployment environment variables. These are sent as secrets on every `catalyst deploy`, so you no longer need to pass `--secret` each time.',
  )
  .addCommand(add)
  .addCommand(remove)
  .addCommand(list);
