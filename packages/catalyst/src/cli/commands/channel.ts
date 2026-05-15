import { Command, Option } from 'commander';

import { runChannelSiteUrlFlow } from '../lib/channel-site-flow';
import { NoLinkedProjectError } from '../lib/commerce-hosting';
import { consola } from '../lib/logger';
import { getProjectConfig } from '../lib/project-config';
import { resolveCredentials } from '../lib/resolve-credentials';
import {
  accessTokenOption,
  apiHostOption,
  projectUuidOption,
  storeHashOption,
} from '../lib/shared-options';
import { getTelemetry } from '../lib/telemetry';

const updateSiteUrl = new Command('update-site-url')
  .configureHelp({ showGlobalOptions: true })
  .description(
    "Update a BigCommerce channel's site URL to point at one of your project's deployment hostnames.",
  )
  .addHelpText(
    'after',
    `
Examples:
  # Pick a channel and hostname interactively
  $ catalyst channel update-site-url

  # Skip both prompts
  $ catalyst channel update-site-url --channel-id 123 --hostname my-storefront.example.com`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .addOption(
    new Option(
      '--channel-id <id>',
      'Skip the channel prompt and target this channel directly.',
    ).argParser((value: string) => Number(value)),
  )
  .addOption(
    new Option(
      '--hostname <hostname>',
      "Skip the hostname prompt and use this hostname directly. Must be one of the project's deployment_hostnames.",
    ),
  )
  .action(async (options) => {
    const config = getProjectConfig();
    const { storeHash, accessToken } = resolveCredentials(options, config);

    await getTelemetry().identify(storeHash);

    try {
      await runChannelSiteUrlFlow({
        storeHash,
        accessToken,
        apiHost: options.apiHost,
        projectUuid: options.projectUuid ?? config.get('projectUuid'),
        channelId: options.channelId,
        hostname: options.hostname,
      });
    } catch (error) {
      if (error instanceof NoLinkedProjectError) {
        consola.info(
          "When you're ready to create a project, run `catalyst project create` or re-run `catalyst channel update-site-url`.",
        );
        process.exit(0);

        // Unreachable in production; prevents continuation when process.exit is mocked in tests.
        return;
      }

      throw error;
    }

    process.exit(0);
  });

export const channel = new Command('channel')
  .configureHelp({ showGlobalOptions: true })
  .description('Manage BigCommerce channels.')
  .addCommand(updateSiteUrl);
