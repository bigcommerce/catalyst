import { Command } from 'commander';
import Conf from 'conf';
import { http, HttpResponse } from 'msw';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, MockInstance, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';
import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig, ProjectConfigSchema } from '../lib/project-config';
import { program } from '../program';

import { channel } from './channel';

// `channel connect` can trigger the interactive device-code login (browser +
// spinner); stub both so the no-credentials path runs headless in tests.
vi.mock('open', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
// eslint-disable-next-line import/dynamic-import-chunkname
vi.mock('yocto-spinner', () => import('../../../tests/mocks/spinner'));

let exitMock: MockInstance;

let tmpDir: string;
let cleanup: () => Promise<void>;
let config: Conf<ProjectConfigSchema>;

const { mockIdentify } = vi.hoisted(() => ({
  mockIdentify: vi.fn(),
}));

const linkedProjectUuid = 'a23f5785-fd99-4a94-9fb3-945551623923';
const storeHash = 'test-store';
const accessToken = 'test-token';

beforeAll(async () => {
  consola.mockTypes(() => vi.fn());

  vi.mock('../lib/telemetry', () => {
    const instance = {
      identify: mockIdentify,
      isEnabled: vi.fn(() => true),
      track: vi.fn(),
      correlationId: 'test-session-uuid',
      commandName: 'unknown',
      durationMs: vi.fn().mockReturnValue(0),
      analytics: {
        closeAndFlush: vi.fn().mockResolvedValue(undefined),
      },
    };

    return {
      Telemetry: vi.fn().mockImplementation(() => instance),
      getTelemetry: vi.fn(() => instance),
      resetTelemetry: vi.fn(),
    };
  });

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  exitMock = vi.spyOn(process, 'exit').mockImplementation(() => null as never);

  [tmpDir, cleanup] = await mkTempDir();

  vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);

  config = getProjectConfig();
});

afterEach(() => {
  vi.clearAllMocks();
  config.delete('storeHash');
  config.delete('accessToken');
  config.delete('projectUuid');
});

afterAll(async () => {
  vi.restoreAllMocks();
  exitMock.mockRestore();

  await cleanup();
});

describe('channel', () => {
  test('has the update subcommand', () => {
    expect(channel).toBeInstanceOf(Command);
    expect(channel.name()).toBe('channel');

    const update = channel.commands.find((cmd) => cmd.name() === 'update');

    expect(update).toBeDefined();
    expect(update?.description()).toContain('Update a BigCommerce channel');
  });

  test('has the connect subcommand', () => {
    const connect = channel.commands.find((cmd) => cmd.name() === 'connect');

    expect(connect).toBeDefined();
    expect(connect?.description()).toContain(
      'Connect this Catalyst project to a BigCommerce channel',
    );
  });
});

describe('channel update', () => {
  test('happy path: prompts for channel and hostname, then PUTs', async () => {
    let putBody: unknown;
    let putChannelId: string | undefined;

    server.use(
      http.put(
        'https://:apiHost/stores/:storeHash/v3/channels/:channelId/site',
        async ({ request, params }) => {
          putBody = await request.json();
          putChannelId = String(params.channelId);

          return HttpResponse.json({
            data: {
              id: 1,
              url: 'https://project-one.catalyst-sandbox.store',
              channel_id: 2,
            },
          });
        },
      ),
    );

    const promptMock = vi
      .spyOn(consola, 'prompt')
      .mockResolvedValueOnce('2')
      .mockResolvedValueOnce('project-one.catalyst-sandbox.store');

    await program.parseAsync([
      'node',
      'catalyst',
      'channel',
      'update',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--project-uuid',
      linkedProjectUuid,
    ]);

    expect(promptMock).toHaveBeenCalledTimes(2);
    expect(putChannelId).toBe('2');
    expect(putBody).toEqual({ url: 'https://project-one.catalyst-sandbox.store' });
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('Updated channel "Catalyst Storefront" (2) site URL'),
    );
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('reads project UUID from .bigcommerce/project.json when no flag is passed', async () => {
    config.set('projectUuid', linkedProjectUuid);

    const promptMock = vi
      .spyOn(consola, 'prompt')
      .mockResolvedValueOnce('2')
      .mockResolvedValueOnce('vanity.project-one.example.com');

    await program.parseAsync([
      'node',
      'catalyst',
      'channel',
      'update',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(promptMock).toHaveBeenCalledTimes(2);
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('https://vanity.project-one.example.com'),
    );
  });

  test('--channel-id and --hostname skip both prompts', async () => {
    let putBody: unknown;
    let putChannelId: string | undefined;

    server.use(
      http.put(
        'https://:apiHost/stores/:storeHash/v3/channels/:channelId/site',
        async ({ request, params }) => {
          putBody = await request.json();
          putChannelId = String(params.channelId);

          return HttpResponse.json({
            data: { id: 1, url: 'https://override.example', channel_id: 5 },
          });
        },
      ),
    );

    const promptMock = vi.spyOn(consola, 'prompt');

    await program.parseAsync([
      'node',
      'catalyst',
      'channel',
      'update',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--project-uuid',
      linkedProjectUuid,
      '--channel-id',
      '5',
      '--hostname',
      'override.example',
    ]);

    expect(promptMock).not.toHaveBeenCalled();
    expect(putChannelId).toBe('5');
    expect(putBody).toEqual({ url: 'https://override.example' });
  });

  test('exits gracefully when no projects exist and user declines to create one', async () => {
    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({ data: [] }),
      ),
    );

    // First prompt: "Would you like to create one?" — user says no
    vi.spyOn(consola, 'prompt').mockResolvedValueOnce(false);

    await program.parseAsync([
      'node',
      'catalyst',
      'channel',
      'update',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(consola.info).toHaveBeenCalledWith(expect.stringContaining('catalyst project create'));
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('propagates errors from the channel-site PUT', async () => {
    server.use(
      http.put('https://:apiHost/stores/:storeHash/v3/channels/:channelId/site', () =>
        HttpResponse.json({}, { status: 401 }),
      ),
    );

    vi.spyOn(consola, 'prompt')
      .mockResolvedValueOnce('2')
      .mockResolvedValueOnce('project-one.catalyst-sandbox.store');

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'channel',
        'update',
        '--store-hash',
        storeHash,
        '--access-token',
        accessToken,
        '--project-uuid',
        linkedProjectUuid,
      ]),
    ).rejects.toThrow('Re-run `catalyst auth login`');
  });
});

describe('channel connect', () => {
  const initUrl =
    'https://cxm-prd.bigcommerceapp.com/stores/:storeHash/cli-api/v3/channels/:channelId/init';

  test('connects a channel by id and writes .env.local', async () => {
    let initChannelId: string | undefined;

    server.use(
      http.get(initUrl, ({ params }) => {
        initChannelId = String(params.channelId);

        return HttpResponse.json({
          data: {
            storefront_api_token: 'sft-token',
            envVars: {
              BIGCOMMERCE_STORE_HASH: storeHash,
              BIGCOMMERCE_CHANNEL_ID: '2',
              BIGCOMMERCE_STOREFRONT_TOKEN: 'sft-token',
            },
          },
        });
      }),
    );

    await program.parseAsync([
      'node',
      'catalyst',
      'channel',
      'connect',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--channel-id',
      '2',
    ]);

    expect(initChannelId).toBe('2');
    expect(mockIdentify).toHaveBeenCalledWith(storeHash);

    const envLocal = readFileSync(join(tmpDir, '.env.local'), 'utf8');

    expect(envLocal).toContain(`BIGCOMMERCE_STORE_HASH=${storeHash}`);
    expect(envLocal).toContain('BIGCOMMERCE_STOREFRONT_TOKEN=sft-token');
    expect(consola.success).toHaveBeenCalledWith(expect.stringContaining('Connected to channel 2'));
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('prompts for a channel when --channel-id is omitted', async () => {
    let initChannelId: string | undefined;

    server.use(
      http.get(initUrl, ({ params }) => {
        initChannelId = String(params.channelId);

        return HttpResponse.json({
          data: { storefront_api_token: 'sft-token', envVars: { BIGCOMMERCE_CHANNEL_ID: '2' } },
        });
      }),
    );

    const promptMock = vi.spyOn(consola, 'prompt').mockResolvedValueOnce('2');

    await program.parseAsync([
      'node',
      'catalyst',
      'channel',
      'connect',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(promptMock).toHaveBeenCalledTimes(1);
    expect(initChannelId).toBe('2');
    // id 2 in the default channels handler is "Catalyst Storefront".
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('Connected to channel "Catalyst Storefront" (2)'),
    );
  });

  test('merges --env overrides into .env.local', async () => {
    server.use(
      http.get(initUrl, () =>
        HttpResponse.json({
          data: {
            storefront_api_token: 'sft-token',
            envVars: { BIGCOMMERCE_STORE_HASH: storeHash },
          },
        }),
      ),
    );

    await program.parseAsync([
      'node',
      'catalyst',
      'channel',
      'connect',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--channel-id',
      '2',
      '--env',
      'EXTRA_FLAG=on',
      '--env',
      'BIGCOMMERCE_STORE_HASH=overridden',
    ]);

    const envLocal = readFileSync(join(tmpDir, '.env.local'), 'utf8');

    expect(envLocal).toContain('EXTRA_FLAG=on');
    expect(envLocal).toContain('BIGCOMMERCE_STORE_HASH=overridden');
  });

  test('exits when the store has no storefront channels', async () => {
    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/channels', () =>
        HttpResponse.json({ data: [] }),
      ),
    );

    await program.parseAsync([
      'node',
      'catalyst',
      'channel',
      'connect',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('No storefront channels found'),
    );
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('logs in and persists credentials when none are available', async () => {
    server.use(
      http.get(initUrl, () =>
        HttpResponse.json({
          data: { storefront_api_token: 'sft-token', envVars: { BIGCOMMERCE_CHANNEL_ID: '2' } },
        }),
      ),
    );

    await program.parseAsync(['node', 'catalyst', 'channel', 'connect', '--channel-id', '2']);

    expect(config.get('storeHash')).toBe('mock-store-hash');
    expect(config.get('accessToken')).toBe('mock-access-token');
    expect(mockIdentify).toHaveBeenCalledWith('mock-store-hash');
  });
});
