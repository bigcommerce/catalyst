import { Command } from 'commander';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, MockInstance, test, vi } from 'vitest';

import { buildWorkspacePackages } from '../lib/build-workspace-packages';
import { cloneCatalyst } from '../lib/clone-catalyst';
import { promptForCommerceHostingProject, setupCommerceHosting } from '../lib/commerce-hosting';
import { installDependencies } from '../lib/install-dependencies';
import { consola } from '../lib/logger';
import { login, LoginAbortedError } from '../lib/login';
import { mkTempDir } from '../lib/mk-temp-dir';
import { hasProjectsAccess } from '../lib/project';
import { setupCoreProject } from '../lib/setup-core-project';
import { writeEnv } from '../lib/write-env';
import { program } from '../program';

import { create } from './create';

// Mock all side-effecting modules so the action runs end-to-end without
// actually cloning, installing, writing files, or hitting the network.
vi.mock('child_process', () => ({ execSync: vi.fn() }));

vi.mock('@inquirer/prompts', () => ({
  input: vi.fn(),
  select: vi.fn(),
}));

const { MockLoginAbortedError } = vi.hoisted(() => ({
  MockLoginAbortedError: class extends Error {
    constructor() {
      super('Login aborted by user.');
      this.name = 'LoginAbortedError';
    }
  },
}));

vi.mock('../lib/login', () => ({
  login: vi.fn().mockResolvedValue({
    storeHash: 'login-store-hash',
    accessToken: 'login-access-token',
  }),
  LoginAbortedError: MockLoginAbortedError,
}));

vi.mock('../lib/clone-catalyst', () => ({ cloneCatalyst: vi.fn() }));
vi.mock('../lib/setup-core-project', () => ({ setupCoreProject: vi.fn() }));
vi.mock('../lib/install-dependencies', () => ({
  installDependencies: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../lib/build-workspace-packages', () => ({ buildWorkspacePackages: vi.fn() }));
vi.mock('../lib/write-env', () => ({ writeEnv: vi.fn() }));

vi.mock('../lib/commerce-hosting', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/commerce-hosting')>();

  return {
    ...actual,
    setupCommerceHosting: vi.fn(),
    promptForCommerceHostingProject: vi.fn().mockResolvedValue({
      uuid: 'commerce-project-uuid',
      name: 'commerce-project',
    }),
  };
});

vi.mock('../lib/project', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/project')>();

  return {
    ...actual,
    hasProjectsAccess: vi.fn().mockResolvedValue(true),
  };
});

vi.mock('../lib/localization', () => ({
  getAvailableLocales: vi.fn().mockResolvedValue([
    { name: 'English', value: 'en' },
    { name: 'Spanish', value: 'es' },
  ]),
}));

const { mockIdentify } = vi.hoisted(() => ({ mockIdentify: vi.fn() }));

vi.mock('../lib/telemetry', () => {
  const instance = {
    identify: mockIdentify,
    isEnabled: vi.fn(() => true),
    track: vi.fn(),
    correlationId: 'test-session-uuid',
    commandName: 'create',
    durationMs: vi.fn().mockReturnValue(0),
    analytics: { closeAndFlush: vi.fn().mockResolvedValue(undefined) },
  };

  return {
    Telemetry: vi.fn().mockImplementation(() => instance),
    getTelemetry: vi.fn(() => instance),
    resetTelemetry: vi.fn(),
  };
});

let exitMock: MockInstance;
let tmpDir: string;
let cleanup: () => Promise<void>;
let testCounter = 0;

const storeHash = 'flag-store-hash';
const accessToken = 'flag-access-token';

// Each test gets a unique --project-name so the computed projectDir
// (`${tmpDir}/${name}`) doesn't collide with prior tests' directories
// when cloneCatalyst's mock creates them.
const uniqueProjectName = () => `test-project-${(testCounter += 1)}`;

beforeAll(async () => {
  consola.mockTypes(() => vi.fn());
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  exitMock = vi.spyOn(process, 'exit').mockImplementation(() => null as never);

  [tmpDir, cleanup] = await mkTempDir();
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(async () => {
  vi.restoreAllMocks();
  exitMock.mockRestore();

  await cleanup();
});

test('properly configured Command instance', () => {
  expect(create).toBeInstanceOf(Command);
  expect(create.name()).toBe('create');
  expect(create.description()).toBe(
    'Scaffold and connect a Catalyst storefront to your BigCommerce store.',
  );
});

describe('happy paths', () => {
  test('scaffolds with full creds + flag-provided channel info (no commerce hosting)', async () => {
    const projectName = uniqueProjectName();

    await program.parseAsync([
      'node',
      'catalyst',
      'create',
      '--project-name',
      projectName,
      '--project-dir',
      tmpDir,
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--channel-id',
      '42',
      '--storefront-token',
      'flag-storefront-token',
    ]);

    expect(login).not.toHaveBeenCalled();
    expect(mockIdentify).toHaveBeenCalledWith(storeHash);
    expect(cloneCatalyst).toHaveBeenCalled();
    expect(setupCoreProject).toHaveBeenCalled();
    expect(setupCommerceHosting).not.toHaveBeenCalled();
    expect(installDependencies).toHaveBeenCalled();
    expect(buildWorkspacePackages).toHaveBeenCalled();
    expect(writeEnv).toHaveBeenCalledWith(
      join(tmpDir, projectName),
      expect.objectContaining({
        BIGCOMMERCE_STORE_HASH: storeHash,
        BIGCOMMERCE_CHANNEL_ID: '42',
        BIGCOMMERCE_STOREFRONT_TOKEN: 'flag-storefront-token',
        CATALYST_ACCESS_TOKEN: accessToken,
      }),
    );
  });

  test('--hosting commerce sets up commerce hosting and writes BIGCOMMERCE_ACCESS_TOKEN', async () => {
    const projectName = uniqueProjectName();

    await program.parseAsync([
      'node',
      'catalyst',
      'create',
      '--project-name',
      projectName,
      '--project-dir',
      tmpDir,
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--channel-id',
      '42',
      '--storefront-token',
      'flag-storefront-token',
      '--hosting',
      'commerce',
    ]);

    expect(hasProjectsAccess).toHaveBeenCalledWith(storeHash, accessToken, 'api.bigcommerce.com');
    expect(promptForCommerceHostingProject).toHaveBeenCalled();
    expect(setupCommerceHosting).toHaveBeenCalledWith({
      projectDir: join(tmpDir, projectName),
      projectUuid: 'commerce-project-uuid',
      storeHash,
      accessToken,
    });
    expect(writeEnv).toHaveBeenCalledWith(
      join(tmpDir, projectName),
      expect.objectContaining({ BIGCOMMERCE_ACCESS_TOKEN: accessToken }),
    );
  });

  test('login is invoked when creds are missing — channel info alone is insufficient', async () => {
    // Regression test for edge case #1: previously, providing channel info via
    // flags caused the login gate to be skipped, leaving BIGCOMMERCE_STORE_HASH
    // unset and the storefront unable to start.
    const projectName = uniqueProjectName();

    await program.parseAsync([
      'node',
      'catalyst',
      'create',
      '--project-name',
      projectName,
      '--project-dir',
      tmpDir,
      '--channel-id',
      '42',
      '--storefront-token',
      'flag-storefront-token',
    ]);

    expect(login).toHaveBeenCalled();
    expect(writeEnv).toHaveBeenCalledWith(
      join(tmpDir, projectName),
      expect.objectContaining({
        BIGCOMMERCE_STORE_HASH: 'login-store-hash',
        BIGCOMMERCE_CHANNEL_ID: '42',
        BIGCOMMERCE_STOREFRONT_TOKEN: 'flag-storefront-token',
      }),
    );
  });

  test('warns when --use-existing is passed without --hosting commerce', async () => {
    await program.parseAsync([
      'node',
      'catalyst',
      'create',
      '--project-name',
      uniqueProjectName(),
      '--project-dir',
      tmpDir,
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--channel-id',
      '42',
      '--storefront-token',
      'flag-storefront-token',
      '--use-existing',
    ]);

    expect(consola.warn).toHaveBeenCalledWith(
      '--use-existing has no effect without --hosting commerce. Ignoring.',
    );
  });
});

describe('parser validation', () => {
  test('--channel-id with non-numeric value throws InvalidArgumentError', async () => {
    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'create',
        '--project-name',
        uniqueProjectName(),
        '--project-dir',
        tmpDir,
        '--channel-id',
        'abc',
      ]),
    ).rejects.toThrow(/not a valid channel ID/);
  });

  test('--env without = throws InvalidArgumentError', async () => {
    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'create',
        '--project-name',
        uniqueProjectName(),
        '--project-dir',
        tmpDir,
        '--env',
        'BAD_VALUE',
      ]),
    ).rejects.toThrow(/Expected KEY=VALUE/);
  });

  test('--env with KEY=VAL=UE preserves the full value past the first =', async () => {
    const projectName = uniqueProjectName();

    await program.parseAsync([
      'node',
      'catalyst',
      'create',
      '--project-name',
      projectName,
      '--project-dir',
      tmpDir,
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--channel-id',
      '42',
      '--storefront-token',
      'flag-storefront-token',
      '--env',
      'CONNECTION_STRING=postgres://user:pass@host/db?ssl=true',
    ]);

    expect(writeEnv).toHaveBeenCalledWith(
      join(tmpDir, projectName),
      expect.objectContaining({
        CONNECTION_STRING: 'postgres://user:pass@host/db?ssl=true',
      }),
    );
  });
});

describe('ordering invariants', () => {
  test('writeEnv runs before installDependencies and buildWorkspacePackages', async () => {
    // Regression test for edge case #2: previously env vars were written after
    // install/build, which would break any future workspace build script that
    // reads env vars.
    await program.parseAsync([
      'node',
      'catalyst',
      'create',
      '--project-name',
      uniqueProjectName(),
      '--project-dir',
      tmpDir,
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--channel-id',
      '42',
      '--storefront-token',
      'flag-storefront-token',
    ]);

    const [writeEnvOrder] = vi.mocked(writeEnv).mock.invocationCallOrder;
    const [installOrder] = vi.mocked(installDependencies).mock.invocationCallOrder;
    const [buildOrder] = vi.mocked(buildWorkspacePackages).mock.invocationCallOrder;

    expect(writeEnvOrder).toBeLessThan(installOrder);
    expect(writeEnvOrder).toBeLessThan(buildOrder);
  });
});

describe('failure handling', () => {
  test('mid-flow failure surfaces cleanup warning when projectDir exists', async () => {
    // Regression test for edge case #5. cloneCatalyst's mock creates the dir
    // so the cleanup-warning's pathExistsSync check passes; installDependencies
    // then throws to simulate a mid-flow failure.
    const projectName = uniqueProjectName();
    const projectDir = join(tmpDir, projectName);

    vi.mocked(cloneCatalyst).mockImplementationOnce(() => {
      mkdirSync(projectDir, { recursive: true });
    });
    vi.mocked(installDependencies).mockRejectedValueOnce(new Error('install failed'));

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'create',
        '--project-name',
        projectName,
        '--project-dir',
        tmpDir,
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
        '--channel-id',
        '42',
        '--storefront-token',
        'flag-storefront-token',
      ]),
    ).rejects.toThrow('install failed');

    expect(consola.warn).toHaveBeenCalledWith(
      expect.stringContaining(`'${projectDir}' may be in a partial state`),
    );
  });

  test('mid-flow failure does not log cleanup warning if projectDir does not exist', async () => {
    // cloneCatalyst is mocked but does NOT create the dir, so pathExistsSync
    // returns false and the cleanup warning is suppressed.
    vi.mocked(cloneCatalyst).mockImplementationOnce(() => {
      throw new Error('clone failed before creating directory');
    });

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'create',
        '--project-name',
        uniqueProjectName(),
        '--project-dir',
        tmpDir,
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
        '--channel-id',
        '42',
        '--storefront-token',
        'flag-storefront-token',
      ]),
    ).rejects.toThrow('clone failed before creating directory');

    expect(consola.warn).not.toHaveBeenCalledWith(expect.stringContaining('partial state'));
  });

  test('exits cleanly when the user aborts the interactive login', async () => {
    vi.mocked(login).mockRejectedValueOnce(new LoginAbortedError());

    await program.parseAsync([
      'node',
      'catalyst',
      'create',
      '--project-name',
      uniqueProjectName(),
      '--project-dir',
      tmpDir,
    ]);

    expect(consola.info).toHaveBeenCalledWith(
      'Login aborted. Re-run `catalyst create` when you have your credentials ready.',
    );
    expect(exitMock).toHaveBeenCalledWith(0);
    expect(cloneCatalyst).not.toHaveBeenCalled();
  });

  test('propagates non-LoginAbortedError login failures', async () => {
    vi.mocked(login).mockRejectedValueOnce(new Error('network down'));

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'create',
        '--project-name',
        uniqueProjectName(),
        '--project-dir',
        tmpDir,
      ]),
    ).rejects.toThrow('network down');

    expect(cloneCatalyst).not.toHaveBeenCalled();
  });
});

describe('--hosting commerce preconditions', () => {
  test('exits with error when hasProjectsAccess returns false', async () => {
    vi.mocked(hasProjectsAccess).mockResolvedValueOnce(false);

    // The promptForCommerceHostingProject mock would normally return a project,
    // but after process.exit (mocked) the action falls through. Make it throw
    // so we can verify the precondition fired before reaching the prompt.
    vi.mocked(promptForCommerceHostingProject).mockRejectedValueOnce(
      new Error('should not have prompted after access denied'),
    );

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'create',
        '--project-name',
        uniqueProjectName(),
        '--project-dir',
        tmpDir,
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
        '--channel-id',
        '42',
        '--storefront-token',
        'flag-storefront-token',
        '--hosting',
        'commerce',
      ]),
    ).rejects.toThrow(/should not have prompted/);

    expect(consola.error).toHaveBeenCalledWith(
      expect.stringContaining('does not have access to the Infrastructure Projects API'),
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
