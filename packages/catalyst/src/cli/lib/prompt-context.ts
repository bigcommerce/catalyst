import type { CommandUnknownOpts } from '@commander-js/extra-typings';

import { getProjectConfig } from './project-config';
import { resolveApiHost } from './shared-options';

// Helpers for prompts that run outside a command action (the survey after a
// command, the error report after a crash).

// Close an unanswered prompt, in case the CLI runs with a TTY but nobody is
// there (some runners allocate a pseudo-terminal without setting CI).
export const PROMPT_TIMEOUT_MS = 2 * 60 * 1000;

// Prompt errors from @inquirer/prompts that mean "the user did not answer":
// Ctrl+C (Exit) and a prompt timeout (Abort). Handle them without a message.
export const QUIET_PROMPT_ERRORS = new Set(['ExitPromptError', 'AbortPromptError']);

export const isQuietPromptError = (error: unknown): boolean =>
  error instanceof Error && QUIET_PROMPT_ERRORS.has(error.name);

// Opt-outs for optional prompts: the global `--no-hints` flag or CATALYST_NO_HINTS.
export function hintsDisabled(program: CommandUnknownOpts | undefined): boolean {
  const options: Record<string, unknown> = program?.opts() ?? {};

  return options.hints === false || Boolean(process.env.CATALYST_NO_HINTS);
}

// Commander option values are untyped outside an action.
const stringOption = (options: Record<string, unknown>, key: string): string | undefined => {
  const value = options[key];

  return typeof value === 'string' ? value : undefined;
};

export interface Credentials {
  storeHash: string;
  accessToken: string;
  apiHost: string;
}

// Resolves credentials the same way commands do (flags and env bindings, then
// .bigcommerce/project.json). Returns undefined when there is no token.
export function resolveCommandCredentials(
  command: CommandUnknownOpts | undefined,
): Credentials | undefined {
  const options: Record<string, unknown> = command?.opts() ?? {};
  const config = getProjectConfig();
  const storeHash =
    stringOption(options, 'storeHash') ??
    process.env.CATALYST_STORE_HASH ??
    config.get('storeHash');
  const accessToken =
    stringOption(options, 'accessToken') ??
    process.env.CATALYST_ACCESS_TOKEN ??
    config.get('accessToken');

  if (!storeHash || !accessToken) {
    return undefined;
  }

  const apiHost = resolveApiHost(
    { apiHost: stringOption(options, 'apiHost') ?? process.env.CATALYST_API_HOST },
    config,
  );

  return { storeHash, accessToken, apiHost };
}
