import { Command } from 'commander';
import { http, HttpResponse } from 'msw';
import { realpath } from 'node:fs/promises';
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

import { server } from '../../../tests/mocks/node';
import { textHistory } from '../../../tests/mocks/spinner';
import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig } from '../lib/project-config';
import { program } from '../program';

import { auth } from './auth';

// eslint-disable-next-line import/dynamic-import-chunkname
vi.mock('yocto-spinner', () => import('../../../tests/mocks/spinner'));
vi.mock('open', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

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
});

afterEach(() => {
  vi.clearAllMocks();
  textHistory.length = 0;

  // Clean up config between tests
  try {
    const config = getProjectConfig();

    config.delete('storeHash');
    config.delete('accessToken');
  } catch {
    // ignore if config doesn't exist
  }
});

afterAll(async () => {
  await cleanup();
});

test('auth is a properly configured Command instance', () => {
  expect(auth).toBeInstanceOf(Command);
  expect(auth.name()).toBe('auth');
  expect(auth.description()).toBe('Manage authentication for the BigCommerce CLI.');

  const subcommands = auth.commands.map((cmd) => cmd.name());

  expect(subcommands).toContain('whoami');
  expect(subcommands).toContain('login');
  expect(subcommands).toContain('logout');
});

describe('whoami', () => {
  test('displays store info when credentials are valid', async () => {
    const config = getProjectConfig();

    config.set('storeHash', 'test-store');
    config.set('accessToken', 'test-token');

    await program.parseAsync(['node', 'catalyst', 'auth', 'whoami']);

    expect(consola.info).toHaveBeenCalledWith('Logged in to Test Store (test-store)');
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('reports no credentials found', async () => {
    await program.parseAsync(['node', 'catalyst', 'auth', 'whoami']);

    expect(consola.info).toHaveBeenCalledWith('Not logged in: no credentials found.');
    expect(consola.info).toHaveBeenCalledWith(
      'Run `catalyst auth login`, or provide --store-hash and --access-token flags (or set CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables).',
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('reports invalid credentials on 401', async () => {
    const config = getProjectConfig();

    config.set('storeHash', 'test-store');
    config.set('accessToken', 'bad-token');

    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/settings/store/profile',
        () => new HttpResponse(null, { status: 401, statusText: 'Unauthorized' }),
      ),
    );

    await expect(
      program.parseAsync(['node', 'catalyst', 'auth', 'whoami']),
    ).rejects.toThrow();

    expect(consola.error).toHaveBeenCalledWith(
      expect.stringContaining('Not logged in: invalid credentials'),
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});

describe('login', () => {
  test('completes OAuth device flow and stores credentials', async () => {
    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.info).toHaveBeenCalledWith(expect.stringContaining('MOCK-CODE'));
    expect(consola.success).toHaveBeenCalledWith('Logged in to store mock-store-hash.');
    expect(exitMock).toHaveBeenCalledWith(0);

    // Verify credentials were stored
    const config = getProjectConfig();

    expect(config.get('storeHash')).toBe('mock-store-hash');
    expect(config.get('accessToken')).toBe('mock-access-token');
  });

  test('exits early when already logged in', async () => {
    const config = getProjectConfig();

    config.set('storeHash', 'existing-store');
    config.set('accessToken', 'existing-token');

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.info).toHaveBeenCalledWith('Already logged in to store existing-store.');
    expect(consola.info).toHaveBeenCalledWith(
      'Run `catalyst auth logout` first to re-authenticate.',
    );
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('handles API error during device code request', async () => {
    server.use(
      http.post(
        'https://login.bigcommerce.com/device/token',
        () => new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
      ),
    );

    await expect(
      program.parseAsync(['node', 'catalyst', 'auth', 'login']),
    ).rejects.toThrow();

    expect(consola.error).toHaveBeenCalledWith(expect.stringContaining('Login failed'));
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('handles browser open failure gracefully', async () => {
    // eslint-disable-next-line import/dynamic-import-chunkname
    const openMock = await import('open');

    vi.mocked(openMock.default).mockRejectedValueOnce(new Error('No browser'));

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('Open https://login.bigcommerce.com/device in your browser'),
    );
    expect(consola.success).toHaveBeenCalledWith('Logged in to store mock-store-hash.');
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('shows spinner during authentication polling', async () => {
    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(textHistory).toContain('Waiting for authentication...');
    expect(textHistory).toContain('Authentication complete.');
  });
});

describe('logout', () => {
  test('clears stored credentials', async () => {
    const config = getProjectConfig();

    config.set('storeHash', 'test-store');
    config.set('accessToken', 'test-token');

    await program.parseAsync(['node', 'catalyst', 'auth', 'logout']);

    expect(consola.success).toHaveBeenCalledWith('Logged out from store test-store.');
    expect(exitMock).toHaveBeenCalledWith(0);

    expect(config.get('storeHash')).toBeUndefined();
    expect(config.get('accessToken')).toBeUndefined();
  });

  test('reports not logged in when no credentials exist', async () => {
    await program.parseAsync(['node', 'catalyst', 'auth', 'logout']);

    expect(consola.info).toHaveBeenCalledWith('Not logged in: no credentials found.');
    expect(exitMock).toHaveBeenCalledWith(0);
  });
});
