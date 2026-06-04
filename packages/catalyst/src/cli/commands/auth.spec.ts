import { password } from '@inquirer/prompts';
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
vi.mock('@inquirer/prompts', () => ({
  password: vi.fn(),
}));

const passwordMock = vi.mocked(password);

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

  test('reports an invalid or expired token on 401', async () => {
    const config = getProjectConfig();

    config.set('storeHash', 'test-store');
    config.set('accessToken', 'bad-token');

    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/settings/store/profile',
        () => new HttpResponse(null, { status: 401, statusText: 'Unauthorized' }),
      ),
    );

    await program.parseAsync(['node', 'catalyst', 'auth', 'whoami']);

    expect(consola.error).toHaveBeenCalledWith(
      'Not logged in: your access token is invalid or has expired. Run `catalyst auth login`.',
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

  test('prompts to fall back to manual login when device code request fails', async () => {
    server.use(
      http.post(
        'https://login.bigcommerce.com/device/token',
        () => new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
      ),
    );

    passwordMock.mockResolvedValueOnce('manual-access-token');

    const promptMock = vi
      .spyOn(consola, 'prompt')
      .mockImplementationOnce(async (message, opts) => {
        expect(message).toContain('Try logging in manually');
        expect(opts).toMatchObject({ type: 'confirm' });

        return Promise.resolve(true);
      })
      .mockImplementationOnce(async (message, opts) => {
        expect(message).toBe('Store hash:');
        expect(opts).toMatchObject({ type: 'text' });

        return Promise.resolve('manual-store-hash');
      });

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("Browser login didn't work"));
    expect(consola.success).toHaveBeenCalledWith('Logged in to store manual-store-hash.');
    expect(exitMock).toHaveBeenCalledWith(0);

    const config = getProjectConfig();

    expect(config.get('storeHash')).toBe('manual-store-hash');
    expect(config.get('accessToken')).toBe('manual-access-token');

    promptMock.mockRestore();
  });

  test('exits cleanly when user declines manual login fallback', async () => {
    server.use(
      http.post(
        'https://login.bigcommerce.com/device/token',
        () => new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
      ),
    );

    const promptMock = vi.spyOn(consola, 'prompt').mockResolvedValueOnce(false);

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("Browser login didn't work"));
    expect(consola.info).toHaveBeenCalledWith(
      'Login aborted. Re-run `catalyst auth login` when you have your credentials ready.',
    );
    expect(exitMock).toHaveBeenCalledWith(0);

    promptMock.mockRestore();
  });

  test('fails when manual credentials cannot be validated', async () => {
    server.use(
      http.post(
        'https://login.bigcommerce.com/device/token',
        () => new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
      ),
      http.get(
        'https://:apiHost/stores/:storeHash/v3/settings/store/profile',
        () => new HttpResponse(null, { status: 401, statusText: 'Unauthorized' }),
      ),
    );

    passwordMock.mockResolvedValueOnce('bad-token');

    const promptMock = vi
      .spyOn(consola, 'prompt')
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce('manual-store-hash');

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.error).toHaveBeenCalledWith(
      expect.stringContaining('Could not validate credentials'),
    );
    expect(exitMock).toHaveBeenCalledWith(1);

    promptMock.mockRestore();
  });

  test('rejects empty store hash during manual login', async () => {
    server.use(
      http.post(
        'https://login.bigcommerce.com/device/token',
        () => new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
      ),
    );

    const promptMock = vi
      .spyOn(consola, 'prompt')
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce('   ');

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.error).toHaveBeenCalledWith(expect.stringContaining('Store hash is required'));
    expect(exitMock).toHaveBeenCalledWith(1);

    promptMock.mockRestore();
  });

  test('rejects empty access token during manual login', async () => {
    server.use(
      http.post(
        'https://login.bigcommerce.com/device/token',
        () => new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
      ),
    );

    passwordMock.mockResolvedValueOnce('   ');

    const promptMock = vi
      .spyOn(consola, 'prompt')
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce('manual-store-hash');

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.error).toHaveBeenCalledWith(expect.stringContaining('Access token is required'));
    expect(exitMock).toHaveBeenCalledWith(1);

    promptMock.mockRestore();
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
