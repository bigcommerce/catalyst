import { Command } from '@commander-js/extra-typings';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { canPrompt } from '../lib/can-prompt';
import { isSurveyDue, runSurvey } from '../lib/survey';

import { SURVEY_COMMANDS, surveyPostHook } from './survey';

vi.mock('../lib/can-prompt', () => ({ canPrompt: vi.fn() }));
vi.mock('../lib/survey', () => ({ isSurveyDue: vi.fn(), runSurvey: vi.fn() }));

const projectConfig = new Map<string, string>();

vi.mock('../lib/project-config', () => ({
  getProjectConfig: () => ({ get: (key: string) => projectConfig.get(key) }),
}));

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
        .option('--api-host <host>')
        .action(action),
    )
    .addCommand(new Command('projects').addCommand(new Command('list').action(action)))
    .hook('postAction', surveyPostHook);
}

const run = (...args: string[]) => makeProgram().parseAsync(args, { from: 'user' });

beforeEach(() => {
  vi.mocked(canPrompt).mockReturnValue(true);
  vi.mocked(isSurveyDue).mockReturnValue(true);
  projectConfig.set('storeHash', 'config-store');
  projectConfig.set('accessToken', 'config-token');
});

afterEach(() => {
  vi.clearAllMocks();
  projectConfig.clear();
  delete process.env.CATALYST_NO_HINTS;
});

test('the survey follows deploy', () => {
  expect(SURVEY_COMMANDS).toEqual(['deploy']);
});

test('shows the survey after deploy with credentials from the project config', async () => {
  await run('deploy');

  expect(runSurveyMock).toHaveBeenCalledWith({
    commandName: 'deploy',
    storeHash: 'config-store',
    accessToken: 'config-token',
    apiHost: 'api.bigcommerce.com',
  });
});

test('flag credentials win over the project config', async () => {
  await run(
    'deploy',
    '--store-hash',
    'flag-store',
    '--access-token',
    'flag-token',
    '--api-host',
    'api.example.com',
  );

  expect(runSurveyMock).toHaveBeenCalledWith({
    commandName: 'deploy',
    storeHash: 'flag-store',
    accessToken: 'flag-token',
    apiHost: 'api.example.com',
  });
});

test('does not show the survey after other commands', async () => {
  await run('projects', 'list');

  expect(runSurveyMock).not.toHaveBeenCalled();
});

test('--no-hints turns the survey off, before or after the command', async () => {
  await run('--no-hints', 'deploy');
  await run('deploy', '--no-hints');

  expect(runSurveyMock).not.toHaveBeenCalled();
});

test('CATALYST_NO_HINTS turns the survey off', async () => {
  process.env.CATALYST_NO_HINTS = '1';

  await run('deploy');

  expect(runSurveyMock).not.toHaveBeenCalled();
});

test('does not show the survey when the CLI cannot prompt', async () => {
  vi.mocked(canPrompt).mockReturnValue(false);

  await run('deploy');

  expect(runSurveyMock).not.toHaveBeenCalled();
});

test('does not show the survey when it is not due', async () => {
  vi.mocked(isSurveyDue).mockReturnValue(false);

  await run('deploy');

  expect(runSurveyMock).not.toHaveBeenCalled();
});

test('does not show the survey without credentials', async () => {
  projectConfig.clear();

  await run('deploy');

  expect(runSurveyMock).not.toHaveBeenCalled();
});

test('an error in the hook does not fail the command', async () => {
  vi.mocked(isSurveyDue).mockImplementation(() => {
    throw new Error('corrupt user config');
  });

  await expect(run('deploy')).resolves.toBeDefined();

  expect(runSurveyMock).not.toHaveBeenCalled();
});
