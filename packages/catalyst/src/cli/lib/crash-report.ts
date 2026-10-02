import type { CommandUnknownOpts } from '@commander-js/extra-typings';
import { confirm } from '@inquirer/prompts';

import PACKAGE_INFO from '../../../package.json';

import { canPrompt } from './can-prompt';
import { getCommandPath } from './command-path';
import { diagnosticsReportSection, redactHome } from './diagnostics-section';
import {
  FEEDBACK_SUBMIT_TIMEOUT_MS,
  type FeedbackInput,
  MAX_DESCRIPTION_LENGTH,
  MAX_DIAGNOSTICS_BODY_LENGTH,
  MAX_TITLE_LENGTH,
  submitFeedback,
} from './feedback';
import { consola } from './logger';
import {
  hintsDisabled,
  isQuietPromptError,
  PROMPT_TIMEOUT_MS,
  resolveCommandCredentials,
} from './prompt-context';

// Identifies error reports in the filed issue.
export const CRASH_REPORT_SOURCE = 'catalyst-cli-crash';

export const CRASH_REPORT_QUESTION =
  'Send an error report to BigCommerce? It includes the error, the CLI version, and the `catalyst debug` report (no secret values).';

const REPORT_HINT = 'To report this error, run `catalyst feedback`.';

// The command that is running, recorded by a preAction hook. The fatal error
// handler has no other way to get the command and its credential options.
let activeCommand: CommandUnknownOpts | undefined;

export const recordActiveCommand = (_program: CommandUnknownOpts, command: CommandUnknownOpts) => {
  activeCommand = command;
};

export const resetActiveCommand = () => {
  activeCommand = undefined;
};

// Cuts text to at most `max` characters (not UTF-16 code units).
const truncate = (text: string, max: number): string => {
  const chars = Array.from(text);

  return chars.length > max ? `${chars.slice(0, max - 1).join('')}…` : text;
};

export function buildCrashReport(
  error: unknown,
  commandName: string,
  correlationId: string,
): FeedbackInput {
  const message = redactHome(error instanceof Error ? error.message : String(error)).trim();
  const stack = error instanceof Error && error.stack ? redactHome(error.stack) : message;
  const firstLine = message.split('\n')[0] || 'Unknown error';
  const prefix = commandName ? `CLI error in \`${commandName}\`` : 'CLI error';

  return {
    title: truncate(`${prefix}: ${firstLine}`, MAX_TITLE_LENGTH),
    description: truncate(message || 'Unknown error', MAX_DESCRIPTION_LENGTH),
    diagnostics: [
      {
        title: 'Error',
        body: truncate(
          [
            `Command: ${commandName || '(none)'}`,
            `Correlation ID: ${correlationId}`,
            `CLI version: ${PACKAGE_INFO.version}`,
            '',
            stack,
          ].join('\n'),
          MAX_DIAGNOSTICS_BODY_LENGTH,
        ),
      },
      diagnosticsReportSection(),
    ],
  };
}

interface OfferCrashReportOptions {
  error: unknown;
  program: CommandUnknownOpts;
  correlationId: string;
}

// After an unexpected error, asks the user to send an error report. The
// default answer is No, because the report contains the error text and stack.
// It must never throw: the fatal error handler still has to exit.
export async function offerCrashReport({
  error,
  program,
  correlationId,
}: OfferCrashReportOptions): Promise<void> {
  try {
    // Ctrl+C at a prompt is not a crash. `--no-hints` turns off the prompt and the hint.
    if (isQuietPromptError(error) || hintsDisabled(program)) {
      return;
    }

    const credentials = resolveCommandCredentials(activeCommand);

    if (!canPrompt() || !credentials) {
      consola.info(REPORT_HINT);

      return;
    }

    const send = await confirm(
      { message: CRASH_REPORT_QUESTION, default: false },
      { signal: AbortSignal.timeout(PROMPT_TIMEOUT_MS) },
    );

    if (!send) {
      return;
    }

    const commandName = activeCommand ? getCommandPath(activeCommand) : '';

    await submitFeedback(
      buildCrashReport(error, commandName, correlationId),
      credentials.storeHash,
      credentials.accessToken,
      credentials.apiHost,
      { source: CRASH_REPORT_SOURCE, signal: AbortSignal.timeout(FEEDBACK_SUBMIT_TIMEOUT_MS) },
    );

    consola.success('Error report sent. Thank you!');
  } catch (reportError) {
    if (isQuietPromptError(reportError)) {
      return;
    }

    consola.debug(reportError);
    consola.warn(`Could not send the error report. ${REPORT_HINT}`);
  }
}
