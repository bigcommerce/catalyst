import { Command } from '@commander-js/extra-typings';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { canPrompt } from '../lib/can-prompt';
import { isSurveyDue, runSurvey } from '../lib/survey';

import { surveyPostHook } from './survey';

vi.mock('../lib/can-prompt', () => ({ canPrompt: vi.fn() }));
vi.mock('../lib/survey', () => ({ isSurveyDue: vi.fn(), runSurvey: vi.fn() }));
// No linked project: credentials come only from the flags.
vi.mock('../lib/project-config', () => ({ getProjectConfig: () => ({ get: () => undefined }) }));

const runSurveyMock = vi.mocked(runSurvey);

// A small program with the same option shapes as the real CLI.
function makeProgram() {
  const action = () => undefined;

  return new Command()
    .exitOverride()
    .option('--no-hints')
    .addCommand(
      new Command('deploy')
        .option('--store-hash <hash>')
        .option('--access-token <token>')
        .action(action),
    )
    .addCommand(new Command('projects').addCommand(new Command('list').action(action)))
    .hook('postAction', surveyPostHook);
}

const credentials = ['--store-hash', 'test-store', '--access-token', 'test-token'];

const run = (...args: string[]) => makeProgram().parseAsync(args, { from: 'user' });

beforeEach(() => {
  vi.mocked(canPrompt).mockReturnValue(true);
  vi.mocked(isSurveyDue).mockReturnValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

test('shows the survey after deploy, with the credentials deploy used', async () => {
  await run('deploy', ...credentials);

  expect(runSurveyMock).toHaveBeenCalledWith({
    commandName: 'deploy',
    storeHash: 'test-store',
    accessToken: 'test-token',
    apiHost: 'api.bigcommerce.com',
  });
});

test('does not show the survey after other commands', async () => {
  await run('projects', 'list');

  expect(runSurveyMock).not.toHaveBeenCalled();
});

test.each([
  ['--no-hints before the command', () => run('--no-hints', 'deploy', ...credentials)],
  ['--no-hints after the command', () => run('deploy', ...credentials, '--no-hints')],
  [
    'CATALYST_NO_HINTS',
    () => {
      vi.stubEnv('CATALYST_NO_HINTS', '1');

      return run('deploy', ...credentials);
    },
  ],
  [
    'no TTY or CI',
    () => {
      vi.mocked(canPrompt).mockReturnValue(false);

      return run('deploy', ...credentials);
    },
  ],
  [
    'shown in the last 90 days',
    () => {
      vi.mocked(isSurveyDue).mockReturnValue(false);

      return run('deploy', ...credentials);
    },
  ],
  ['no credentials', () => run('deploy')],
])('does not show the survey with %s', async (_name, runCase) => {
  await runCase();

  expect(runSurveyMock).not.toHaveBeenCalled();
});

test('an error in the hook does not fail the command', async () => {
  vi.mocked(isSurveyDue).mockImplementation(() => {
    throw new Error('corrupt user config');
  });

  await expect(run('deploy', ...credentials)).resolves.toBeDefined();
});
