import { confirm, input, password } from '@inquirer/prompts';
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
  confirm: vi.fn(),
  input: vi.fn(),
  password: vi.fn(),
}));

const confirmMock = vi.mocked(confirm);
const inputMock = vi.mocked(input);
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
  vi.unstubAllEnvs();
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

  test('exits early when already logged in with credentials that still work', async () => {
    const config = getProjectConfig();

    config.set('storeHash', 'existing-store');
    config.set('accessToken', 'existing-token');

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.info).toHaveBeenCalledWith('Already logged in to Test Store (existing-store).');
    expect(consola.info).toHaveBeenCalledWith(
      'Run `catalyst auth logout` first to re-authenticate, or `catalyst auth login --force` to skip this check.',
    );
    expect(exitMock).toHaveBeenCalledWith(0);

    // Untouched — the stored credentials were fine.
    expect(config.get('accessToken')).toBe('existing-token');
  });

  test('re-authenticates in place when the stored token has expired', async () => {
    const config = getProjectConfig();

    config.set('storeHash', 'expired-store');
    config.set('accessToken', 'expired-token');

    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/settings/store/profile',
        () => new HttpResponse(null, { status: 401, statusText: 'Unauthorized' }),
      ),
    );

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.warn).toHaveBeenCalledWith(
      'Stored credentials for store expired-store are no longer valid — re-authenticating.',
    );
    // No logout required — the device flow ran and replaced them.
    expect(consola.info).not.toHaveBeenCalledWith(
      expect.stringContaining('Run `catalyst auth logout` first'),
    );
    expect(consola.success).toHaveBeenCalledWith('Logged in to store mock-store-hash.');
    expect(exitMock).toHaveBeenCalledWith(0);
    expect(config.get('storeHash')).toBe('mock-store-hash');
    expect(config.get('accessToken')).toBe('mock-access-token');
  });

  test('keeps unverifiable credentials instead of discarding them', async () => {
    const config = getProjectConfig();

    config.set('storeHash', 'existing-store');
    config.set('accessToken', 'existing-token');

    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/settings/store/profile',
        () => new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
      ),
    );

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.warn).toHaveBeenCalledWith(
      expect.stringContaining("couldn't verify them: 500 Internal Server Error"),
    );
    expect(exitMock).toHaveBeenCalledWith(0);
    expect(config.get('accessToken')).toBe('existing-token');
  });

  test('re-authenticates without a check under --force', async () => {
    const config = getProjectConfig();

    config.set('storeHash', 'existing-store');
    config.set('accessToken', 'existing-token');

    // Would report "already logged in" if --force consulted the API at all.
    await program.parseAsync(['node', 'catalyst', 'auth', 'login', '--force']);

    expect(consola.info).not.toHaveBeenCalledWith(expect.stringContaining('Already logged in to'));
    expect(consola.success).toHaveBeenCalledWith('Logged in to store mock-store-hash.');
    expect(config.get('accessToken')).toBe('mock-access-token');
  });

  test('reports rejected credentials passed on the command line', async () => {
    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/settings/store/profile',
        () => new HttpResponse(null, { status: 401, statusText: 'Unauthorized' }),
      ),
    );

    await program.parseAsync([
      'node',
      'catalyst',
      'auth',
      'login',
      '--store-hash',
      'typo-store',
      '--access-token',
      'typo-token',
    ]);

    expect(consola.error).toHaveBeenCalledWith(
      'The credentials provided for store typo-store were rejected.',
    );
    expect(consola.success).not.toHaveBeenCalled();
    expect(exitMock).toHaveBeenCalledWith(1);

    const config = getProjectConfig();

    expect(config.get('accessToken')).toBeUndefined();
  });

  test('verifies and stores credentials passed on the command line', async () => {
    await program.parseAsync([
      'node',
      'catalyst',
      'auth',
      'login',
      '--store-hash',
      'flag-store',
      '--access-token',
      'flag-token',
    ]);

    expect(consola.success).toHaveBeenCalledWith('Logged in to store flag-store.');
    expect(exitMock).toHaveBeenCalledWith(0);

    const config = getProjectConfig();

    expect(config.get('storeHash')).toBe('flag-store');
    expect(config.get('accessToken')).toBe('flag-token');
  });

  test('replaces stored credentials with ones passed on the command line', async () => {
    const config = getProjectConfig();

    config.set('storeHash', 'existing-store');
    config.set('accessToken', 'existing-token');

    await program.parseAsync([
      'node',
      'catalyst',
      'auth',
      'login',
      '--store-hash',
      'flag-store',
      '--access-token',
      'flag-token',
    ]);

    // No "already logged in" refusal — the user named the credentials to use.
    expect(consola.info).not.toHaveBeenCalledWith(expect.stringContaining('Already logged in to'));
    expect(config.get('storeHash')).toBe('flag-store');
    expect(config.get('accessToken')).toBe('flag-token');
  });

  test('treats env-var credentials as config, not as a non-interactive login', async () => {
    vi.stubEnv('CATALYST_STORE_HASH', 'env-store');
    vi.stubEnv('CATALYST_ACCESS_TOKEN', 'env-token');

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    // An exported env var must not silently write credentials to the project.
    expect(consola.success).not.toHaveBeenCalled();
    expect(consola.info).toHaveBeenCalledWith('Already logged in to Test Store (env-store).');

    const config = getProjectConfig();

    expect(config.get('storeHash')).toBeUndefined();
  });

  test('--force still re-authenticates when env-var credentials are present', async () => {
    vi.stubEnv('CATALYST_STORE_HASH', 'env-store');
    vi.stubEnv('CATALYST_ACCESS_TOKEN', 'env-token');

    await program.parseAsync(['node', 'catalyst', 'auth', 'login', '--force']);

    expect(consola.success).toHaveBeenCalledWith('Logged in to store mock-store-hash.');

    const config = getProjectConfig();

    expect(config.get('storeHash')).toBe('mock-store-hash');
  });

  test('does not take the non-interactive path on a single flag', async () => {
    const config = getProjectConfig();

    config.set('storeHash', 'existing-store');
    config.set('accessToken', 'existing-token');

    // Only one half given, so this is not "log in with these" — the flag just
    // overrides that field for the check.
    await program.parseAsync(['node', 'catalyst', 'auth', 'login', '--store-hash', 'flag-store']);

    expect(consola.success).not.toHaveBeenCalled();
    expect(config.get('storeHash')).toBe('existing-store');
  });

  test('stores unverifiable command-line credentials with a warning', async () => {
    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/settings/store/profile',
        () => new HttpResponse(null, { status: 503, statusText: 'Service Unavailable' }),
      ),
    );

    await program.parseAsync([
      'node',
      'catalyst',
      'auth',
      'login',
      '--store-hash',
      'flag-store',
      '--access-token',
      'flag-token',
    ]);

    expect(consola.warn).toHaveBeenCalledWith(
      "Couldn't verify the credentials provided: 503 Service Unavailable",
    );
    expect(consola.success).toHaveBeenCalledWith('Logged in to store flag-store.');

    const config = getProjectConfig();

    expect(config.get('accessToken')).toBe('flag-token');
  });

  test('prompts to fall back to manual login when device code request fails', async () => {
    server.use(
      http.post(
        'https://login.bigcommerce.com/device/token',
        () => new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
      ),
    );

    confirmMock.mockResolvedValueOnce(true);
    inputMock.mockResolvedValueOnce('manual-store-hash');
    passwordMock.mockResolvedValueOnce('manual-access-token');

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(confirmMock).toHaveBeenCalledOnce();
    expect(confirmMock.mock.calls[0]?.[0].message).toContain('Try logging in manually');
    expect(inputMock).toHaveBeenCalledWith(expect.objectContaining({ message: 'Store hash:' }));

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("Browser login didn't work"));
    expect(consola.success).toHaveBeenCalledWith('Logged in to store manual-store-hash.');
    expect(exitMock).toHaveBeenCalledWith(0);

    const config = getProjectConfig();

    expect(config.get('storeHash')).toBe('manual-store-hash');
    expect(config.get('accessToken')).toBe('manual-access-token');
  });

  test('exits cleanly when user declines manual login fallback', async () => {
    server.use(
      http.post(
        'https://login.bigcommerce.com/device/token',
        () => new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
      ),
    );

    confirmMock.mockResolvedValueOnce(false);

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("Browser login didn't work"));
    expect(consola.info).toHaveBeenCalledWith(
      'Login aborted. Re-run `catalyst auth login` when you have your credentials ready.',
    );
    expect(exitMock).toHaveBeenCalledWith(0);
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

    confirmMock.mockResolvedValueOnce(true);
    inputMock.mockResolvedValueOnce('manual-store-hash');
    passwordMock.mockResolvedValueOnce('bad-token');

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.error).toHaveBeenCalledWith(
      expect.stringContaining('Could not validate credentials'),
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('rejects empty store hash during manual login', async () => {
    server.use(
      http.post(
        'https://login.bigcommerce.com/device/token',
        () => new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
      ),
    );

    confirmMock.mockResolvedValueOnce(true);
    inputMock.mockResolvedValueOnce('   ');

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.error).toHaveBeenCalledWith(expect.stringContaining('Store hash is required'));
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('rejects empty access token during manual login', async () => {
    server.use(
      http.post(
        'https://login.bigcommerce.com/device/token',
        () => new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
      ),
    );

    confirmMock.mockResolvedValueOnce(true);
    inputMock.mockResolvedValueOnce('manual-store-hash');
    passwordMock.mockResolvedValueOnce('   ');

    await program.parseAsync(['node', 'catalyst', 'auth', 'login']);

    expect(consola.error).toHaveBeenCalledWith(expect.stringContaining('Access token is required'));
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
