import { input } from '@inquirer/prompts';
import { colorize } from 'consola/utils';

import PACKAGE_INFO from '../../../package.json';

import { FEEDBACK_SUBMIT_TIMEOUT_MS, MAX_DESCRIPTION_LENGTH, submitFeedback } from './feedback';
import { consola } from './logger';
import { isQuietPromptError, PROMPT_TIMEOUT_MS } from './prompt-context';
import { getUserConfig } from './user-config';

// Identifies survey answers in the filed issue, apart from `catalyst feedback`.
export const SURVEY_SOURCE = 'catalyst-cli-survey';

// After the survey is shown (answered or skipped), do not show it again on
// this machine for this long.
export const SURVEY_INTERVAL_MS = 90 * 24 * 60 * 60 * 1000;

const SURVEY_KEY_LAST_SHOWN_AT = 'survey.lastShownAt';

export const SCORE_QUESTION =
  'How was your experience using the Catalyst native hosting CLI? (0 = very poor, 10 = excellent, Enter to skip)';

export const COMMENT_QUESTION =
  'What went well, or what could be better? (optional, Enter to skip)';

export function isSurveyDue(now: number = Date.now()): boolean {
  const lastShownAt = getUserConfig().get<typeof SURVEY_KEY_LAST_SHOWN_AT, string>(
    SURVEY_KEY_LAST_SHOWN_AT,
  );

  if (!lastShownAt) {
    return true;
  }

  const lastShownMs = Date.parse(lastShownAt);

  // An unreadable value is treated as "never shown".
  return Number.isNaN(lastShownMs) || now - lastShownMs >= SURVEY_INTERVAL_MS;
}

export function markSurveyShown(now: number = Date.now()): void {
  getUserConfig().set(SURVEY_KEY_LAST_SHOWN_AT, new Date(now).toISOString());
}

// Returns the score, null for an empty answer (skip), or undefined when the
// answer is not a whole number from 0 to 10.
export function parseScore(value: string): number | null | undefined {
  const trimmed = value.trim();

  if (trimmed === '') {
    return null;
  }

  if (!/^\d{1,2}$/.test(trimmed)) {
    return undefined;
  }

  const score = Number(trimmed);

  return score <= 10 ? score : undefined;
}

export interface SurveyContext {
  commandName: string;
  storeHash: string;
  accessToken: string;
  apiHost: string;
}

// Asks for a 0-10 score and an optional comment, then sends them as feedback.
// The survey must never fail the command that triggered it, so all errors
// (including Ctrl+C at the prompt) are caught here.
export async function runSurvey(context: SurveyContext, now: number = Date.now()): Promise<void> {
  try {
    // Mark first, so the survey is not shown again soon even if the user
    // presses Ctrl+C or the request fails.
    markSurveyShown(now);

    consola.log('');
    consola.log(colorize('cyan', 'Help us improve Catalyst. One question, and you can skip it.'));

    const scoreAnswer = await input(
      {
        message: SCORE_QUESTION,
        validate: (value) =>
          parseScore(value) !== undefined ||
          'Enter a whole number from 0 to 10, or press Enter to skip.',
      },
      { signal: AbortSignal.timeout(PROMPT_TIMEOUT_MS) },
    );

    const score = parseScore(scoreAnswer);

    if (score === null || score === undefined) {
      consola.info('Skipped. We will not ask again for at least three months.');

      return;
    }

    const commentAnswer = await input(
      {
        message: COMMENT_QUESTION,
        validate: (value) =>
          value.trim().length <= MAX_DESCRIPTION_LENGTH ||
          `Use at most ${MAX_DESCRIPTION_LENGTH} characters.`,
      },
      { signal: AbortSignal.timeout(PROMPT_TIMEOUT_MS) },
    );

    const comment = commentAnswer.trim();

    await submitFeedback(
      {
        title: `CLI survey: ${score}/10`,
        description: comment || 'No comment.',
        diagnostics: [
          {
            title: 'Survey',
            body: [
              `Score: ${score}/10`,
              `CLI version: ${PACKAGE_INFO.version}`,
              `Command: ${context.commandName}`,
            ].join('\n'),
          },
        ],
      },
      context.storeHash,
      context.accessToken,
      context.apiHost,
      { source: SURVEY_SOURCE, signal: AbortSignal.timeout(FEEDBACK_SUBMIT_TIMEOUT_MS) },
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
