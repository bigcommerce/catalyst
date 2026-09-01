import { Command } from 'commander';
import { execa } from 'execa';
import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { reconcileOpenNextVersion } from '../lib/commerce-hosting';
import { installDependencies } from '../lib/install-dependencies';
import { consola } from '../lib/logger';
import { getProjectState } from '../lib/project-state';
import { program } from '../program';

import { build, WRANGLER_VERSION } from './build';

vi.mock('execa', () => ({
  execa: vi.fn(() => Promise.resolve({})),
  __esModule: true,
}));

vi.mock('../lib/project-state', () => ({
  getProjectState: vi.fn(),
}));

// The transformed build path shells out and touches the filesystem; stub the
// side effects so the tests can focus on how options are threaded through.
vi.mock('node:fs/promises', () => ({
  copyFile: vi.fn(() => Promise.resolve()),
  cp: vi.fn(() => Promise.resolve()),
  rm: vi.fn(() => Promise.resolve()),
  writeFile: vi.fn(() => Promise.resolve()),
}));

vi.mock('../lib/build-env', () => ({
  loadBuildEnv: vi.fn(),
}));

vi.mock('../lib/wrangler-config', () => ({
  getWranglerConfig: vi.fn(() => ({})),
}));

vi.mock('../lib/get-module-cli-path', () => ({
  getModuleCliPath: vi.fn(() => '/module/cli'),
}));

vi.mock('../lib/project-config', () => ({
  getProjectConfig: vi.fn(() => ({ get: vi.fn(() => 'mock-uuid') })),
}));

// The required-env check has its own unit tests; here we only care about
// command routing, so keep it a no-op regardless of the ambient environment.
vi.mock('../lib/commerce-hosting', () => ({
  reconcileOpenNextVersion: vi.fn(() => Promise.resolve(false)),
}));

vi.mock('../lib/install-dependencies', () => ({
  installDependencies: vi.fn(),
}));

vi.mock('../lib/detect-package-manager', () => ({
  detectProjectPackageManager: vi.fn(() => Promise.resolve('pnpm')),
}));

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

const transformedState = {
  projectUuid: 'mock-uuid',
  hasMiddleware: true,
  hasProxy: false,
  hasOpenNextDep: true,
  isLinked: true,
  isTransformed: true,
  isFullySetUp: true,
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
    expect.arrayContaining([
      expect.objectContaining({ long: '--project-uuid' }),
      expect.objectContaining({ long: '--wrangler-version' }),
    ]),
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

test('uses the pinned default Wrangler version when the flag is absent', async () => {
  vi.mocked(getProjectState).mockReturnValue(transformedState);

  await program.parseAsync(['node', 'catalyst', 'build']);

  expect(execa).toHaveBeenCalledWith(
    'pnpm',
    expect.arrayContaining(['dlx', `wrangler@${WRANGLER_VERSION}`]),
    expect.anything(),
  );
});

test('threads --wrangler-version into the wrangler invocation', async () => {
  vi.mocked(getProjectState).mockReturnValue(transformedState);

  await program.parseAsync(['node', 'catalyst', 'build', '--wrangler-version', '4.24.3']);

  expect(execa).toHaveBeenCalledWith(
    'pnpm',
    expect.arrayContaining(['dlx', 'wrangler@4.24.3']),
    expect.anything(),
  );
  expect(execa).not.toHaveBeenCalledWith(
    'pnpm',
    expect.arrayContaining(['dlx', `wrangler@${WRANGLER_VERSION}`]),
    expect.anything(),
  );
});

// Regression guard: `templates/public_headers` existed but was never copied,
// so `/_next/static/*` shipped with the Workers Assets default of
// `max-age=0, must-revalidate` and browsers revalidated every hashed asset on
// every repeat view. Nothing asserted the copy, which is why it went unnoticed.
test('writes _headers into the assets directory so static assets get immutable Cache-Control', async () => {
  vi.mocked(getProjectState).mockReturnValue(transformedState);

  await program.parseAsync(['node', 'catalyst', 'build']);

  expect(copyFile).toHaveBeenCalledWith(
    expect.stringContaining('public_headers'),
    expect.stringContaining(join('.open-next', 'assets', '_headers')),
  );
});

test('rejects an invalid --wrangler-version value', async () => {
  vi.mocked(getProjectState).mockReturnValue(transformedState);

  await expect(
    program.parseAsync(['node', 'catalyst', 'build', '--wrangler-version', 'foo; rm -rf /']),
  ).rejects.toThrow(/not a valid Wrangler version/);

  expect(execa).not.toHaveBeenCalled();
});

test('offers to move a stale adapter pin before the build, and installs when it moves', async () => {
  // `catalyst build` invokes the project's own adapter, so the pin has to be
  // reconciled before anything compiles against it.
  vi.mocked(reconcileOpenNextVersion).mockResolvedValueOnce(true);

  await program.parseAsync(['node', 'catalyst', 'build']);

  expect(reconcileOpenNextVersion).toHaveBeenCalledWith(expect.any(String), 'pnpm', {
    canUpgrade: true,
  });
  expect(installDependencies).toHaveBeenCalledWith(expect.any(String), 'pnpm');
});

test('does not install when the adapter pin is already current', async () => {
  vi.mocked(reconcileOpenNextVersion).mockResolvedValueOnce(false);

  await program.parseAsync(['node', 'catalyst', 'build']);

  expect(installDependencies).not.toHaveBeenCalled();
});
