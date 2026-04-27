import { mkdtempSync, readFileSync, rmSync } from 'fs';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { tmpdir } from 'os';
import { join } from 'path';

jest.mock('../utils/telemetry/telemetry', () => ({
  Telemetry: jest.fn().mockImplementation(() => ({
    identify: jest.fn().mockResolvedValue(undefined),
    track: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../utils/login', () => ({
  login: jest.fn(),
  storeCredentials: jest.fn(),
}));

const mockSelect = jest.fn<Promise<unknown>, [unknown]>();

jest.mock('@inquirer/prompts', () => ({
  select: (config: unknown) => mockSelect(config),
}));

import { init } from './init';

const STORE_HASH = 'abc123';
const ACCESS_TOKEN = 'def456';
const BC_HOSTNAME = 'bigcommerce.test';
const CLI_API_ORIGIN = 'https://cli-api.bigcommerce.test';
const CHANNEL_ID = 9001;

const server = setupServer();

describe('init command', () => {
  let projectDir: string;
  let originalCwd: string;
  let logSpy: jest.SpiedFunction<typeof console.log>;
  let errorSpy: jest.SpiedFunction<typeof console.error>;

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  beforeEach(() => {
    projectDir = mkdtempSync(join(tmpdir(), 'create-catalyst-init-'));
    originalCwd = process.cwd();
    process.chdir(projectDir);

    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    mockSelect.mockResolvedValueOnce({
      id: CHANNEL_ID,
      name: 'Catalyst Storefront',
      platform: 'catalyst',
    });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(projectDir, { recursive: true, force: true });
    server.resetHandlers();
    logSpy.mockRestore();
    errorSpy.mockRestore();
    mockSelect.mockReset();
  });

  it('writes BIGCOMMERCE_STOREFRONT_UNAUTHENTICATED_TOKEN from the OCC init response into .env.local', async () => {
    server.use(
      http.get(`https://api.${BC_HOSTNAME}/stores/${STORE_HASH}/v3/channels`, () =>
        HttpResponse.json({
          data: [{ id: CHANNEL_ID, name: 'Catalyst Storefront', platform: 'catalyst' }],
        }),
      ),
      http.get(
        `${CLI_API_ORIGIN}/stores/${STORE_HASH}/cli-api/v3/channels/${CHANNEL_ID}/init`,
        () =>
          HttpResponse.json({
            data: {
              makeswift_dev_api_key: 'mk-key',
              storefront_api_token: 'authenticated-token',
              envVars: {
                BIGCOMMERCE_STORE_HASH: STORE_HASH,
                BIGCOMMERCE_CHANNEL_ID: String(CHANNEL_ID),
                BIGCOMMERCE_STOREFRONT_TOKEN: 'authenticated-token',
                BIGCOMMERCE_STOREFRONT_UNAUTHENTICATED_TOKEN: 'unauthenticated-token',
              },
            },
          }),
      ),
    );

    await init.parseAsync([
      'node',
      'init',
      '--store-hash',
      STORE_HASH,
      '--access-token',
      ACCESS_TOKEN,
      '--bigcommerce-hostname',
      BC_HOSTNAME,
      '--cli-api-origin',
      CLI_API_ORIGIN,
    ]);

    const envFile = readFileSync(join(projectDir, '.env.local'), 'utf-8');

    expect(envFile).toContain('BIGCOMMERCE_STOREFRONT_TOKEN=authenticated-token');
    expect(envFile).toContain('BIGCOMMERCE_STOREFRONT_UNAUTHENTICATED_TOKEN=unauthenticated-token');
    expect(envFile).toContain(`BIGCOMMERCE_STORE_HASH=${STORE_HASH}`);
    expect(envFile).toContain(`BIGCOMMERCE_CHANNEL_ID=${CHANNEL_ID}`);
  });
});
