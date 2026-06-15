import { select } from '@inquirer/prompts';
import { Command } from 'commander';
import { outputFileSync } from 'fs-extra/esm';
import { realpath } from 'node:fs/promises';
import { join } from 'node:path';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  MockInstance,
  test,
  vi,
} from 'vitest';

import { fetchAvailableChannels, getChannelInit } from '../lib/channels';
import { consola } from '../lib/logger';
import { login } from '../lib/login';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig } from '../lib/project-config';
import { program } from '../program';

import { init } from './init';

vi.mock('@inquirer/prompts', () => ({ select: vi.fn() }));
vi.mock('fs-extra/esm', () => ({ outputFileSync: vi.fn() }));

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

vi.mock('../lib/channels', () => ({
  fetchAvailableChannels: vi.fn(),
  getChannelInit: vi.fn(),
}));

const { mockIdentify } = vi.hoisted(() => ({ mockIdentify: vi.fn() }));

vi.mock('../lib/telemetry', () => {
  const instance = {
    identify: mockIdentify,
    isEnabled: vi.fn(() => true),
    track: vi.fn(),
    correlationId: 'test-session-uuid',
    commandName: 'init',
    durationMs: vi.fn().mockReturnValue(0),
    analytics: { closeAndFlush: vi.fn().mockResolvedValue(undefined) },
  };

  return {
    Telemetry: vi.fn().mockImplementation(() => instance),
    getTelemetry: vi.fn(() => instance),
    resetTelemetry: vi.fn(),
  };
});

const storeHash = 'flag-store-hash';
const accessToken = 'flag-access-token';

const sampleChannels = [
  { id: 1, name: 'Catalyst Store', platform: 'catalyst' },
  { id: 2, name: 'Legacy Store', platform: 'bigcommerce' },
];

let exitMock: MockInstance;
let tmpDir: string;
let cleanup: () => Promise<void>;

beforeAll(async () => {
  consola.mockTypes(() => vi.fn());
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  exitMock = vi.spyOn(process, 'exit').mockImplementation(() => null as never);

  [tmpDir, cleanup] = await mkTempDir();
  tmpDir = await realpath(tmpDir);
});

beforeEach(() => {
  process.chdir(tmpDir);

  // Default happy-path stubs; individual tests override as needed.
  vi.mocked(fetchAvailableChannels).mockResolvedValue(sampleChannels);
  vi.mocked(select).mockResolvedValue(sampleChannels[0]);
  vi.mocked(getChannelInit).mockResolvedValue({
    storefrontToken: 'sample-storefront-token',
    envVars: {
      BIGCOMMERCE_STORE_HASH: storeHash,
      BIGCOMMERCE_CHANNEL_ID: '1',
      BIGCOMMERCE_STOREFRONT_TOKEN: 'sample-storefront-token',
    },
  });
});

afterEach(() => {
  vi.clearAllMocks();

  try {
    const config = getProjectConfig();

    config.delete('storeHash');
    config.delete('accessToken');
  } catch {
    // ignore if config doesn't exist
  }
});

afterAll(async () => {
  vi.restoreAllMocks();
  exitMock.mockRestore();

  await cleanup();
});

test('properly configured Command instance', () => {
  expect(init).toBeInstanceOf(Command);
  expect(init.name()).toBe('init');
  expect(init.description()).toBe(
    'Connect a BigCommerce store and channel to an existing Catalyst project.',
  );
});

describe('credential resolution', () => {
  test('uses flag-provided credentials without logging in', async () => {
    await program.parseAsync([
      'node',
      'catalyst',
      'init',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(login).not.toHaveBeenCalled();
    expect(mockIdentify).toHaveBeenCalledWith(storeHash);
    expect(fetchAvailableChannels).toHaveBeenCalledWith(
      storeHash,
      accessToken,
      'api.bigcommerce.com',
    );
    expect(getChannelInit).toHaveBeenCalledWith(
      1,
      storeHash,
      accessToken,
      'https://cxm-prd.bigcommerceapp.com',
    );
    expect(outputFileSync).toHaveBeenCalledWith(
      join(tmpDir, '.env.local'),
      expect.stringContaining(`BIGCOMMERCE_STORE_HASH=${storeHash}`),
    );
    expect(consola.success).toHaveBeenCalledWith(
      '.env.local file created for channel Catalyst Store!',
    );
  });

  test('falls back to persisted project config credentials', async () => {
    const config = getProjectConfig();

    config.set('storeHash', 'config-store-hash');
    config.set('accessToken', 'config-access-token');

    await program.parseAsync(['node', 'catalyst', 'init']);

    expect(login).not.toHaveBeenCalled();
    expect(fetchAvailableChannels).toHaveBeenCalledWith(
      'config-store-hash',
      'config-access-token',
      'api.bigcommerce.com',
    );
  });

  test('logs in interactively and persists credentials when none are available', async () => {
    await program.parseAsync(['node', 'catalyst', 'init']);

    expect(login).toHaveBeenCalled();
    expect(fetchAvailableChannels).toHaveBeenCalledWith(
      'login-store-hash',
      'login-access-token',
      'api.bigcommerce.com',
    );

    const config = getProjectConfig();

    expect(config.get('storeHash')).toBe('login-store-hash');
    expect(config.get('accessToken')).toBe('login-access-token');
  });

  test('exits cleanly when the user aborts login', async () => {
    vi.mocked(login).mockRejectedValueOnce(new MockLoginAbortedError());

    await program.parseAsync(['node', 'catalyst', 'init']);

    expect(consola.info).toHaveBeenCalledWith(
      'Login aborted. Re-run `catalyst init` when you have your credentials ready.',
    );
    expect(exitMock).toHaveBeenCalledWith(0);
    expect(fetchAvailableChannels).not.toHaveBeenCalled();
  });

  test('propagates non-abort login failures', async () => {
    vi.mocked(login).mockRejectedValueOnce(new Error('network down'));

    await expect(program.parseAsync(['node', 'catalyst', 'init'])).rejects.toThrow('network down');

    expect(fetchAvailableChannels).not.toHaveBeenCalled();
  });
});

describe('env file', () => {
  test('merges --env overrides over channel-provided values', async () => {
    await program.parseAsync([
      'node',
      'catalyst',
      'init',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--env',
      'BIGCOMMERCE_STORE_HASH=overridden',
      '--env',
      'EXTRA_FLAG=on',
    ]);

    const [, contents] = vi.mocked(outputFileSync).mock.calls[0];

    expect(contents).toContain('BIGCOMMERCE_STORE_HASH=overridden');
    expect(contents).toContain('EXTRA_FLAG=on');
  });

  test('rejects malformed --env values', async () => {
    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'init',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
        '--env',
        'NOT_AN_ASSIGNMENT',
      ]),
    ).rejects.toThrow(/Expected format: KEY=VALUE/);
  });
});
