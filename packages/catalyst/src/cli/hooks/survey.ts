import type { CommandUnknownOpts } from '@commander-js/extra-typings';

import { canPrompt } from '../lib/can-prompt';
import { getCommandPath } from '../lib/command-path';
import { consola } from '../lib/logger';
import { hintsDisabled, resolveCommandCredentials } from '../lib/prompt-context';
import { isSurveyDue, runSurvey } from '../lib/survey';

// The survey is shown only after these commands succeed: the moment the user
// has just used native hosting.
export const SURVEY_COMMANDS = ['deploy'];

export const surveyPostHook = async (
  thisCommand: CommandUnknownOpts,
  actionCommand: CommandUnknownOpts,
) => {
  // The survey must never fail a command that has already succeeded.
  try {
    const commandName = getCommandPath(actionCommand);

    // Opt-outs: `--no-hints`, CATALYST_NO_HINTS, CI, or no TTY.
    if (
      !SURVEY_COMMANDS.includes(commandName) ||
      hintsDisabled(thisCommand) ||
      !canPrompt() ||
      !isSurveyDue()
    ) {
      return;
    }

    // The answer is sent with the user's token. Without one, there is nowhere to send it.
    const credentials = resolveCommandCredentials(actionCommand);

    if (!credentials) {
      return;
    }

    await runSurvey({ commandName, ...credentials });
  } catch (error) {
    consola.debug(error);
  }
};
