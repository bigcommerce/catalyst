import type { CommandUnknownOpts } from '@commander-js/extra-typings';

import { canPrompt } from '../lib/can-prompt';
import { getCommandPath } from '../lib/command-path';
import { consola } from '../lib/logger';
import { getProjectConfig } from '../lib/project-config';
import { resolveApiHost } from '../lib/shared-options';
import { isSurveyDue, runSurvey } from '../lib/survey';

// The survey is shown only after these commands succeed: the moment the user
// has just used native hosting.
export const SURVEY_COMMANDS = ['deploy'];

// Commander option values are untyped in a hook.
const stringOption = (options: Record<string, unknown>, key: string): string | undefined => {
  const value = options[key];

  return typeof value === 'string' ? value : undefined;
};

// Opt-outs: `--no-hints`, CATALYST_NO_HINTS, CI, or no TTY.
function hintsDisabled(program: CommandUnknownOpts): boolean {
  const options: Record<string, unknown> = program.opts();

  return options.hints === false || Boolean(process.env.CATALYST_NO_HINTS);
}

export const surveyPostHook = async (
  thisCommand: CommandUnknownOpts,
  actionCommand: CommandUnknownOpts,
) => {
  // The survey must never fail a command that has already succeeded.
  try {
    const commandName = getCommandPath(actionCommand);

    if (
      !SURVEY_COMMANDS.includes(commandName) ||
      hintsDisabled(thisCommand) ||
      !canPrompt() ||
      !isSurveyDue()
    ) {
      return;
    }

    const options: Record<string, unknown> = actionCommand.opts();
    const config = getProjectConfig();
    const storeHash = stringOption(options, 'storeHash') ?? config.get('storeHash');
    const accessToken = stringOption(options, 'accessToken') ?? config.get('accessToken');
    const apiHost = resolveApiHost({ apiHost: stringOption(options, 'apiHost') }, config);

    // The answer is sent with the user's token. Without one, there is nowhere to send it.
    if (!storeHash || !accessToken) {
      return;
    }

    await runSurvey({ commandName, storeHash, accessToken, apiHost });
  } catch (error) {
    consola.debug(error);
  }
};
