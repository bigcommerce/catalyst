import { input } from '@inquirer/prompts';
import { colorize } from 'consola/utils';

import PACKAGE_INFO from '../../../package.json';

import { submitFeedback, validateFeedbackField } from './feedback';
import { consola } from './logger';
import {
  type Credentials,
  isQuietPromptError,
  PROMPT_TIMEOUT_MS,
  SUBMIT_TIMEOUT_MS,
} from './prompt-context';
import { getUserConfig } from './user-config';

// After the survey is shown (answered or skipped), do not show it again on
// this machine for this long.
const SURVEY_INTERVAL_MS = 90 * 24 * 60 * 60 * 1000;

// A whole number from 0 to 10, or nothing (skip).
const SCORE_ANSWER = /^\s*(?:10|\d)?\s*$/;

export interface SurveyContext extends Credentials {
  commandName: string;
}

export function isSurveyDue(): boolean {
  const lastShownAt = getUserConfig().get('survey')?.lastShownAt;

  return lastShownAt === undefined || Date.now() - lastShownAt >= SURVEY_INTERVAL_MS;
}

const ask = async (message: string, validate: (value: string) => boolean | string) =>
  (await input({ message, validate }, { signal: AbortSignal.timeout(PROMPT_TIMEOUT_MS) })).trim();

// Asks for a 0-10 score and an optional comment, then sends them as feedback.
// The survey must never fail the command that triggered it, so all errors
// (including Ctrl+C at the prompt) are caught here.
export async function runSurvey({
  commandName,
  storeHash,
  accessToken,
  apiHost,
}: SurveyContext): Promise<void> {
  try {
    // Mark first, so the survey is not shown again soon even if the user
    // presses Ctrl+C or the request fails.
    getUserConfig().set('survey', { lastShownAt: Date.now() });

    consola.log('');
    consola.log(colorize('cyan', 'Help us improve Catalyst. One question, and you can skip it.'));

    const score = await ask(
      'How was your experience using the Catalyst CLI with Storefront Hosting? (0 = very poor, 10 = excellent, Enter to skip)',
      (value) =>
        SCORE_ANSWER.test(value) || 'Enter a whole number from 0 to 10, or press Enter to skip.',
    );

    if (!score) {
      consola.info('Skipped. We will not ask again for at least three months.');

      return;
    }

    const comment = await ask(
      'What went well, or what could be better? (optional, Enter to skip)',
      (value) => !value.trim() || (validateFeedbackField('Description', value) ?? true),
    );

    await submitFeedback(
      {
        title: `CLI survey: ${score}/10`,
        description: comment || 'No comment.',
        diagnostics: [
          {
            title: 'Survey',
            body: `Score: ${score}/10\nCLI version: ${PACKAGE_INFO.version}\nCommand: ${commandName}`,
          },
        ],
      },
      storeHash,
      accessToken,
      apiHost,
      { source: 'catalyst-cli-survey', signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS) },
    );

    consola.success('Thank you for your feedback!');
  } catch (error) {
    if (isQuietPromptError(error)) {
      return;
    }

    consola.debug(error);
    consola.warn('Could not send your survey answer. Use `catalyst feedback` to send feedback.');
  }
}
