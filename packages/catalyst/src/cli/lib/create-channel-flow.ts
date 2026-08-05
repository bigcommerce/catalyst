import { checkbox, input, select } from '@inquirer/prompts';
import { colorize } from 'consola/utils';

import { createChannel, type CreatedChannel } from './channels';
import { UserActionableError } from './errors';
import { getAvailableLocales } from './localization';

// Human-readable summary of the allowed characters, reused in the prompt
// validation and the flag-path error so both surface the same guidance.
const ALLOWED_CHANNEL_NAME_CHARS = 'letters, numbers, spaces, hyphens (-), and underscores (_)';

// The Catalyst channels API rejects names containing other punctuation (e.g. an
// apostrophe in "Bob's Store") with an opaque server error. Validate up front so
// the user gets an immediate, actionable message instead. Letters/numbers are
// matched with Unicode classes so non-ASCII names (accents, other scripts) pass.
const CHANNEL_NAME_PATTERN = /^[\p{L}\p{N} _-]+$/u;

// Returns an error message when `name` is not a valid channel name, or
// `undefined` when it is. Shared by the interactive prompt and the `--name` flag.
export function getChannelNameError(name: string): string | undefined {
  if (name.trim().length === 0) {
    return 'Channel name cannot be empty.';
  }

  if (!CHANNEL_NAME_PATTERN.test(name)) {
    return `"${name}" is not a valid channel name. Channel names may contain only ${ALLOWED_CHANNEL_NAME_CHARS}.`;
  }

  return undefined;
}

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
// and `catalyst channels create` (on an existing project). Prompts for anything
// not provided as a flag, then POSTs to create the Catalyst channel.
export async function runCreateChannelFlow(
  options: CreateChannelFlowOptions,
): Promise<CreatedChannel> {
  const { storeHash, accessToken, apiHost, cliApiOrigin } = options;

  // A `--name` flag skips the prompt (and its validation), so check it here to
  // fail fast with the same clear message rather than an opaque API rejection.
  if (options.name !== undefined) {
    const nameError = getChannelNameError(options.name);

    if (nameError) {
      throw new UserActionableError(nameError);
    }
  }

  const name =
    options.name ??
    (await input({
      message: 'What would you like to name your new channel?',
      validate: (value) => getChannelNameError(value) ?? true,
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
