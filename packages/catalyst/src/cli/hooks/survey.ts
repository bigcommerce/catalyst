import type { CommandUnknownOpts } from '@commander-js/extra-typings';

import { canPrompt } from '../lib/can-prompt';
import { getCommandPath } from '../lib/command-path';
import { consola } from '../lib/logger';
import { hintsDisabled, resolveCommandCredentials } from '../lib/prompt-context';
import { isSurveyDue, runSurvey } from '../lib/survey';

// The survey is shown only after these commands succeed: the moment the user
// has just used Storefront Hosting.
const SURVEY_COMMANDS = new Set(['deploy']);

export const surveyPostHook = async (
  program: CommandUnknownOpts,
  actionCommand: CommandUnknownOpts,
) => {
  // The survey must never fail a command that has already succeeded.
  try {
    const commandName = getCommandPath(actionCommand);

    if (
      !SURVEY_COMMANDS.has(commandName) ||
      hintsDisabled(program) ||
      !canPrompt() ||
      !isSurveyDue()
    ) {
      return;
    }

    // The answer is sent with the user's token. Without one, there is nowhere to send it.
    const credentials = resolveCommandCredentials(actionCommand);

    if (credentials) {
      await runSurvey({ commandName, ...credentials });
    }
  } catch (error) {
    consola.debug(error);
  }
};
