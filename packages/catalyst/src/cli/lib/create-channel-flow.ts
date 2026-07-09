import { checkbox, input, select } from '@inquirer/prompts';
import { colorize } from 'consola/utils';

import { createChannel, type CreatedChannel } from './channels';
import { getAvailableLocales } from './localization';

export interface CreateChannelFlowOptions {
  storeHash: string;
  accessToken: string;
  apiHost: string;
  cliApiOrigin: string;
  // Non-interactive overrides. When a value is supplied the corresponding
  // prompt is skipped, so a fully-flagged invocation runs headless.
  name?: string;
  locale?: string;
  additionalLocales?: string[];
  sampleData?: boolean;
}

// Shared channel-creation flow used by both `catalyst create` (while scaffolding)
// and `catalyst channel create` (on an existing project). Prompts for anything
// not provided as a flag, then POSTs to create the Catalyst channel.
export async function runCreateChannelFlow(
  options: CreateChannelFlowOptions,
): Promise<CreatedChannel> {
  const { storeHash, accessToken, apiHost, cliApiOrigin } = options;

  const name =
    options.name ??
    (await input({
      message: 'What would you like to name your new channel?',
    }));

  // The locale list backs both the default-locale and additional-locales
  // prompts. Fetch it lazily and once — a fully-flagged run skips the call.
  let availableLocales: Awaited<ReturnType<typeof getAvailableLocales>> | undefined;
  const loadLocales = async () => {
    availableLocales ??= await getAvailableLocales(storeHash, accessToken, apiHost);

    return availableLocales;
  };

  const storefrontLocale =
    options.locale ??
    (await select({
      message: 'Which default language would you like to set for your channel?',
      default: 'en',
      choices: await loadLocales(),
      theme: {
        style: {
          help: () => colorize('dim', '(Select locale from the list or start typing the name)'),
        },
      },
    }));

  let additionalLocales = options.additionalLocales;

  if (additionalLocales === undefined) {
    const shouldAddAdditionalLocales = await select({
      message: 'Would you like to add additional languages?',
      choices: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
    });

    additionalLocales = [];

    if (shouldAddAdditionalLocales) {
      const localeChoices = (await loadLocales())
        .filter(({ value }) => value !== storefrontLocale)
        .map(({ name: localeName, value }) => ({ name: localeName, value, description: value }));

      additionalLocales = await checkbox({
        message: 'Which additional languages would you like to add to your channel?',
        choices: localeChoices,
        validate: (items) =>
          items.length <= 4 || 'You can only select up to 4 additional languages.',
      });
    }
  }

  const shouldInstallSampleData =
    options.sampleData ??
    (await select({
      message: 'Would you like to install sample data?',
      choices: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
    }));

  return createChannel(
    name,
    storefrontLocale,
    additionalLocales,
    shouldInstallSampleData,
    storeHash,
    accessToken,
    cliApiOrigin,
  );
}
