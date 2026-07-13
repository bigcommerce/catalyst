import { Command } from 'commander';
import { execa } from 'execa';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { consola } from '../lib/logger';
import { getProjectState } from '../lib/project-state';
import { program } from '../program';

import { build } from './build';

vi.mock('execa', () => ({
  execa: vi.fn(() => Promise.resolve({})),
  __esModule: true,
}));

vi.mock('../lib/project-state', () => ({
  getProjectState: vi.fn(),
}));

// The required-env check has its own unit tests; here we only care about
// command routing, so keep it a no-op regardless of the ambient environment.
vi.mock('../lib/required-build-env', () => ({
  assertRequiredBuildEnv: vi.fn(),
}));

const untransformedState = {
  projectUuid: undefined,
  hasMiddleware: false,
  hasProxy: true,
  hasOpenNextDep: false,
  isLinked: false,
  isTransformed: false,
  isFullySetUp: false,
};

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
vi.spyOn(process, 'exit').mockImplementation(() => null as never);

beforeAll(() => {
  consola.wrapAll();
});

beforeEach(() => {
  consola.mockTypes(() => vi.fn());
});

afterEach(() => {
  vi.clearAllMocks();
});

test('properly configured Command instance', () => {
  expect(build).toBeInstanceOf(Command);
  expect(build.name()).toBe('build');
  expect(build.options).toEqual(
    expect.arrayContaining([expect.objectContaining({ long: '--project-uuid' })]),
  );
});

test('falls through to `next build` when project is not transformed', async () => {
  vi.mocked(getProjectState).mockReturnValue(untransformedState);

  await program.parseAsync(['node', 'catalyst', 'build']);

  expect(execa).toHaveBeenCalledWith(
    'pnpm',
    ['exec', 'next', 'build'],
    expect.objectContaining({ stdio: 'inherit', cwd: process.cwd() }),
  );
});
