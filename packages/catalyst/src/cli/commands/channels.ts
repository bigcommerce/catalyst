import { select } from '@inquirer/prompts';
import { Command, InvalidArgumentError, Option } from 'commander';
import type Conf from 'conf';
import { colorize } from 'consola/utils';

import { resolveChannel, runChannelSiteUrlFlow } from '../lib/channel-site-flow';
import {
  channelPlatformLabel,
  type ChannelSiteDetails,
  checkChannelEligibility,
  deleteChannelCheckoutUrl,
  fetchAvailableChannels,
  findChannelSiteUrl,
  getChannelInit,
  getChannelSite,
  sortChannelsByPlatform,
  updateChannelCheckoutUrl,
} from '../lib/channels';
import { normalizeCheckoutUrl, warnOnCrossDomainCheckout } from '../lib/checkout-url';
import { NoLinkedProjectError } from '../lib/commerce-hosting';
import { runCreateChannelFlow } from '../lib/create-channel-flow';
import { parseEnvAssignment } from '../lib/env-config';
import { UserActionableError } from '../lib/errors';
import { consola } from '../lib/logger';
import { LoginAbortedError, login as runInteractiveLogin } from '../lib/login';
import { getProjectConfig, type ProjectConfigSchema } from '../lib/project-config';
import { resolveCredentials } from '../lib/resolve-credentials';
import {
  accessTokenOption,
  apiHostOption,
  loginUrlOption,
  projectUuidOption,
  resolveApiHost,
  storeHashOption,
} from '../lib/shared-options';
import { getTelemetry } from '../lib/telemetry';
import { writeEnv } from '../lib/write-env';

const parseChannelId = (value: string): number => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    throw new InvalidArgumentError(`"${value}" is not a valid channel ID (expected a number).`);
  }

  return parsed;
};

// Adapts the shared normalizer to commander, which formats InvalidArgumentError
// as an option-level usage error.
const parseCheckoutUrl = (value: string): string => {
  try {
    return normalizeCheckoutUrl(value);
  } catch (error) {
    throw new InvalidArgumentError(error instanceof Error ? error.message : String(error));
  }
};

// Resolve credentials from flags/env → persisted project config → interactive
// login (persisting on success). Returns null when the user aborts login.
// `channel link` is an onboarding command — a fresh clone has neither
// .env.local nor .bigcommerce/project.json — so it logs the user in like
// `catalyst projects create`, rather than erroring like the operational commands.
async function resolveCredentialsWithLogin(
  options: { storeHash?: string; accessToken?: string; loginUrl: string },
  config: Conf<ProjectConfigSchema>,
  apiHost: string,
): Promise<{ storeHash: string; accessToken: string } | null> {
  const storeHash = options.storeHash ?? config.get('storeHash');
  const accessToken = options.accessToken ?? config.get('accessToken');

  if (storeHash && accessToken) {
    return { storeHash, accessToken };
  }

  try {
    const credentials = await runInteractiveLogin(options.loginUrl, apiHost);

    config.set('storeHash', credentials.storeHash);
    config.set('accessToken', credentials.accessToken);

    return credentials;
  } catch (error) {
    if (error instanceof LoginAbortedError) {
      return null;
    }

    throw error;
  }
}

const update = new Command('update')
  .configureHelp({ showGlobalOptions: true })
  .description(
    "Update a BigCommerce channel's site URL to point at one of your project's deployment hostnames.",
  )
  .addHelpText(
    'after',
    `
Examples:
  # Pick a channel and hostname interactively
  $ catalyst channels update

  # Skip both prompts
  $ catalyst channels update --channel-id 123 --hostname my-storefront.example.com`,
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
    const apiHost = resolveApiHost(options, config);
    const { storeHash, accessToken } = resolveCredentials(options, config);

    await getTelemetry().identify(storeHash);

    try {
      await runChannelSiteUrlFlow({
        storeHash,
        accessToken,
        apiHost,
        projectUuid: options.projectUuid ?? config.get('projectUuid'),
        channelId: options.channelId,
        hostname: options.hostname,
      });
    } catch (error) {
      if (error instanceof NoLinkedProjectError) {
        consola.info(
          "When you're ready to create a project, run `catalyst projects create` or re-run `catalyst channels update`.",
        );
        process.exit(0);

        // Unreachable in production; prevents continuation when process.exit is mocked in tests.
        return;
      }

      throw error;
    }

    process.exit(0);
  });

const link = new Command('link')
  .configureHelp({ showGlobalOptions: true })
  .description(
    'Link this Catalyst project to a BigCommerce channel and write its credentials to .env.local.',
  )
  .addHelpText(
    'after',
    `
Examples:
  # Pick a channel interactively (logs you in if needed)
  $ catalyst channels link

  # Non-interactive
  $ catalyst channels link --store-hash <hash> --access-token <token> --channel-id 123

  # Append extra environment variables to .env.local
  $ catalyst channels link --channel-id 123 --env MY_FLAG=1`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(loginUrlOption())
  .addOption(
    new Option('--channel-id <id>', 'Link this channel directly, skipping the picker.').argParser(
      parseChannelId,
    ),
  )
  .option(
    '--env <vars...>',
    'Arbitrary environment variables to set in .env.local. Format: KEY=VALUE (repeatable).',
  )
  .addOption(
    new Option('--cli-api-origin <origin>', 'Catalyst CLI API origin')
      .default('https://cxm-prd.bigcommerceapp.com')
      .hideHelp(),
  )
  .action(async (options) => {
    const config = getProjectConfig();
    const apiHost = resolveApiHost(options, config);

    const credentials = await resolveCredentialsWithLogin(options, config, apiHost);

    if (!credentials) {
      consola.info(
        'Login aborted. Re-run `catalyst channels link` when you have your credentials ready.',
      );
      process.exit(0);

      return;
    }

    const { storeHash, accessToken } = credentials;

    await getTelemetry().identify(storeHash);

    let channelId = options.channelId;
    let channelName: string | undefined;

    if (channelId === undefined) {
      const availableChannels = await fetchAvailableChannels(storeHash, accessToken, apiHost);

      if (availableChannels.length === 0) {
        consola.info(
          'No storefront channels found on this store. Create one with `catalyst create` and try again.',
        );
        process.exit(0);

        return;
      }

      channelId = await select({
        message: 'Which channel would you like to link?',
        choices: sortChannelsByPlatform(availableChannels).map((c) => ({
          name: c.name,
          value: c.id,
          description: channelPlatformLabel(c.platform),
        })),
      });

      channelName = availableChannels.find((c) => c.id === channelId)?.name;
    }

    const initData = await getChannelInit(channelId, storeHash, accessToken, options.cliApiOrigin);

    const envVars: Record<string, string> = { ...initData.envVars };

    // Inline `--env KEY=VALUE` overrides win over the channel-provided values.
    if (options.env) {
      options.env.forEach((entry) => {
        const { key, value } = parseEnvAssignment(entry);

        envVars[key] = value;
      });
    }

    // Writes .env.local in the current working directory — `channel link`
    // runs from inside `core/`, the same place `dev`/`build`/`deploy` run.
    writeEnv(process.cwd(), envVars);

    const label = channelName ? `"${channelName}" (${channelId})` : `${channelId}`;

    consola.success(
      `Linked to channel ${label} and wrote ${colorize('cyanBright', '.env.local')}.`,
    );
    consola.log(`Next steps:\n\n  ${colorize('yellow', 'pnpm run dev')}`);

    process.exit(0);
  });

const create = new Command('create')
  .configureHelp({ showGlobalOptions: true })
  .description('Create a new Catalyst storefront channel on your BigCommerce store.')
  .addHelpText(
    'after',
    `
Examples:
  # Create a channel interactively (logs you in if needed)
  $ catalyst channels create

  # Non-interactive, and link it to this project afterwards
  $ catalyst channels create --name "My Store" --locale en --no-sample-data --link

  # Add additional storefront languages (max 4)
  $ catalyst channels create --name "My Store" --additional-locales es fr`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(loginUrlOption())
  .option('--name <name>', 'Name for the new channel. Skips the name prompt.')
  .option(
    '--locale <locale>',
    'Default storefront locale (e.g. "en"). Skips the default-language prompt.',
  )
  .option(
    '--additional-locales <locales...>',
    'Additional storefront locales, max 4 (e.g. --additional-locales es fr). Skips the additional-languages prompt.',
  )
  .addOption(new Option('--sample-data', 'Install sample data on the new channel.'))
  .addOption(new Option('--no-sample-data', 'Create the channel without sample data.'))
  .option(
    '--link',
    'Link the new channel to this project — write its credentials to .env.local without prompting.',
  )
  .addOption(
    new Option('--cli-api-origin <origin>', 'Catalyst CLI API origin')
      .default('https://cxm-prd.bigcommerceapp.com')
      .hideHelp(),
  )
  .action(async (options) => {
    if (options.additionalLocales && options.additionalLocales.length > 4) {
      consola.error('You can only set up to 4 additional locales.');
      process.exit(1);

      return;
    }

    const config = getProjectConfig();
    const apiHost = resolveApiHost(options, config);

    const credentials = await resolveCredentialsWithLogin(options, config, apiHost);

    if (!credentials) {
      consola.info(
        'Login aborted. Re-run `catalyst channels create` when you have your credentials ready.',
      );
      process.exit(0);

      return;
    }

    const { storeHash, accessToken } = credentials;

    await getTelemetry().identify(storeHash);

    const eligibility = await checkChannelEligibility(storeHash, accessToken, options.cliApiOrigin);

    if (!eligibility.eligible) {
      consola.warn(eligibility.message);
      process.exit(0);

      return;
    }

    const channelData = await runCreateChannelFlow({
      storeHash,
      accessToken,
      apiHost,
      cliApiOrigin: options.cliApiOrigin,
      name: options.name,
      locale: options.locale,
      additionalLocales: options.additionalLocales,
      sampleData: options.sampleData,
    });

    consola.success(`Created channel ${channelData.channelId}.`);
    consola.warn(
      'A preview storefront has been deployed in your BigCommerce control panel. This preview may look different from your local environment as it may be running different code. Additionally, it may take a few minutes for the channel storefront to be accessible.',
    );

    // `--link` opts in non-interactively; otherwise ask before touching .env.local.
    const shouldLink = options.link
      ? true
      : await select({
          message: 'Would you like to link this channel to your project?',
          choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
          ],
        });

    if (shouldLink) {
      // Same write path as `channel link`: write the channel's credentials to
      // .env.local in the current working directory (where `dev`/`build`/`deploy` run).
      writeEnv(process.cwd(), channelData.envVars);

      consola.success(
        `Linked to channel ${channelData.channelId} and wrote ${colorize('cyanBright', '.env.local')}.`,
      );
      consola.log(`Next steps:\n\n  ${colorize('yellow', 'pnpm run dev')}`);
    }

    process.exit(0);
  });

const CHECKOUT_LABEL_WIDTH = 'Storefront'.length;

const row = (label: string, value: string) => `  ${label.padEnd(CHECKOUT_LABEL_WIDTH)}  ${value}`;

// Renders the site's addresses by role. `primary` is the merchant-facing
// storefront, `canonical` is BigCommerce's own permanent address, and
// `checkout` is where hosted checkout lives — three distinct things that are
// easy to conflate when debugging a checkout redirect.
function reportChannelSite(site: ChannelSiteDetails): void {
  const canonical = findChannelSiteUrl(site, 'canonical');
  const checkout = findChannelSiteUrl(site, 'checkout');

  consola.log(row('Storefront', findChannelSiteUrl(site, 'primary') ?? site.url));

  if (canonical) {
    consola.log(row('Canonical', canonical));
  }

  consola.log(row('Checkout', checkout ?? '(none)'));

  if (!site.isCheckoutUrlCustomized) {
    consola.info(
      'This channel has no checkout URL of its own, so BigCommerce falls back to the default ' +
        "channel's primary URL. That may be a different domain than the storefront above.",
    );
  }
}

const checkoutUrl = new Command('checkout-url')
  .configureHelp({ showGlobalOptions: true })
  .description("Show, set, or remove a BigCommerce channel's checkout URL.")
  .addHelpText(
    'after',
    `
Checkout is hosted by BigCommerce, so the checkout URL must be a domain you have
pointed at BigCommerce with a certificate provisioned there — not one added with
\`catalyst domains add\`, which only routes traffic to this project.

BigCommerce also requires the checkout URL to share a main domain with the
channel's storefront URL, so that sessions carry between the two. This means a
custom checkout URL is only possible on a custom storefront domain; channels on
an auto-generated deployment hostname use the shared checkout domain.

Examples:
  # Show the channel's storefront, canonical and checkout URLs
  $ catalyst channels checkout-url

  # Set the checkout URL
  $ catalyst channels checkout-url --channel-id 123 --url https://checkout.example.com

  # Drop back to the shared checkout domain
  $ catalyst channels checkout-url --channel-id 123 --unset`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .addOption(
    new Option(
      '--channel-id <id>',
      'Skip the channel prompt and target this channel directly.',
    ).argParser(parseChannelId),
  )
  .addOption(
    new Option(
      '--url <url>',
      'Checkout URL to set. Must share a main domain with the channel storefront URL.',
    ).argParser(parseCheckoutUrl),
  )
  .option('--unset', "Remove the channel's custom checkout URL and use the shared checkout domain.")
  .action(async (options) => {
    if (options.url !== undefined && options.unset) {
      throw new UserActionableError('Pass either --url or --unset, not both.');
    }

    const config = getProjectConfig();
    const apiHost = resolveApiHost(options, config);
    const { storeHash, accessToken } = resolveCredentials(options, config);

    await getTelemetry().identify(storeHash);

    const channel = await resolveChannel({
      storeHash,
      accessToken,
      apiHost,
      channelId: options.channelId,
    });
    const label = channel.name ? `"${channel.name}" (${channel.id})` : String(channel.id);

    // Resolving the project is only needed to tailor the cross-domain guidance,
    // so it stays optional on every path below.
    const diagnosticContext = {
      storeHash,
      accessToken,
      apiHost,
      projectUuid: options.projectUuid ?? config.get('projectUuid'),
    };

    if (options.unset) {
      await deleteChannelCheckoutUrl(channel.id, storeHash, accessToken, apiHost);

      consola.success(
        `Removed the custom checkout URL from channel ${label}. Checkout now uses the shared checkout domain.`,
      );

      // Unsetting is the one path that *creates* the inherited-checkout state
      // the rest of this command warns about, and the domain it falls back to
      // is the default channel's — not this one's — so it can't be predicted
      // beforehand. Re-read the site to show where checkout actually landed and
      // warn if that is a different domain than the storefront.
      const reverted = await getChannelSite(channel.id, storeHash, accessToken, apiHost);

      reportChannelSite(reverted);
      await warnOnCrossDomainCheckout(reverted, diagnosticContext);

      process.exit(0);

      // Unreachable in production; prevents continuation when process.exit is mocked in tests.
      return;
    }

    if (options.url !== undefined) {
      const updated = await updateChannelCheckoutUrl(
        channel.id,
        options.url,
        storeHash,
        accessToken,
        apiHost,
      );

      consola.success(`Updated channel ${label} checkout URL to ${options.url}.`);
      reportChannelSite(updated);
      process.exit(0);

      return;
    }

    consola.start('Fetching channel site...');

    const site = await getChannelSite(channel.id, storeHash, accessToken, apiHost);

    consola.success(`Channel ${label}:`);
    reportChannelSite(site);

    await warnOnCrossDomainCheckout(site, diagnosticContext);

    process.exit(0);
  });

// Resource commands are plural; the singular form stays as an alias so existing
// scripts and muscle memory keep working.
export const channels = new Command('channels')
  .alias('channel')
  .configureHelp({ showGlobalOptions: true })
  .description('Manage BigCommerce channels.')
  .addCommand(create)
  .addCommand(link)
  .addCommand(update)
  .addCommand(checkoutUrl);
