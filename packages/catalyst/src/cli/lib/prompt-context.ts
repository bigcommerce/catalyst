import type { CommandUnknownOpts } from '@commander-js/extra-typings';

import { getProjectConfig } from './project-config';
import { resolveApiHost } from './shared-options';

// Helpers for prompts that run outside a command action (the survey after a
// command, the error report after a crash).

// Close an unanswered prompt, in case the CLI runs with a TTY but nobody is
// there (some runners allocate a pseudo-terminal without setting CI).
export const PROMPT_TIMEOUT_MS = 2 * 60 * 1000;

// Do not hold up the terminal for a slow endpoint.
export const SUBMIT_TIMEOUT_MS = 5000;

// Prompt errors from @inquirer/prompts that mean "the user did not answer":
// Ctrl+C (Exit) and a prompt timeout (Abort).
const QUIET_PROMPT_ERRORS = new Set(['ExitPromptError', 'AbortPromptError']);

export const isQuietPromptError = (error: unknown): boolean =>
  error instanceof Error && QUIET_PROMPT_ERRORS.has(error.name);

// The global `--no-hints` flag or CATALYST_NO_HINTS.
export function hintsDisabled(program: CommandUnknownOpts): boolean {
  const options: Record<string, unknown> = program.opts();

  return options.hints === false || Boolean(process.env.CATALYST_NO_HINTS);
}

export interface Credentials {
  storeHash: string;
  accessToken: string;
  apiHost: string;
}

// Commander option values are untyped outside an action.
const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

// Resolves credentials the same way commands do: the command's options (flags
// and their env bindings), then .bigcommerce/project.json. Returns undefined
// when there is no store hash or token.
export function resolveCommandCredentials(
  command: CommandUnknownOpts | undefined,
): Credentials | undefined {
  const options: Record<string, unknown> = command?.opts() ?? {};
  const config = getProjectConfig();
  const storeHash = asString(options.storeHash) ?? config.get('storeHash');
  const accessToken = asString(options.accessToken) ?? config.get('accessToken');

  if (!storeHash || !accessToken) {
    return undefined;
  }

  return {
    storeHash,
    accessToken,
    apiHost: resolveApiHost({ apiHost: asString(options.apiHost) }, config),
  };
}
