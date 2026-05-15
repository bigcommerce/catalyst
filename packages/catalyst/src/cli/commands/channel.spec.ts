import { Command } from 'commander';
import Conf from 'conf';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, MockInstance, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';
import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig, ProjectConfigSchema } from '../lib/project-config';
import { program } from '../program';

import { channel } from './channel';

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
  test('has the update-site-url subcommand', () => {
    expect(channel).toBeInstanceOf(Command);
    expect(channel.name()).toBe('channel');

    const updateSiteUrl = channel.commands.find((cmd) => cmd.name() === 'update-site-url');

    expect(updateSiteUrl).toBeDefined();
    expect(updateSiteUrl?.description()).toContain('Update a BigCommerce channel');
  });
});

describe('channel update-site-url', () => {
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
      'update-site-url',
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
      .mockResolvedValueOnce('1')
      .mockResolvedValueOnce('vanity.project-one.example.com');

    await program.parseAsync([
      'node',
      'catalyst',
      'channel',
      'update-site-url',
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
      'update-site-url',
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
      'update-site-url',
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
      .mockResolvedValueOnce('1')
      .mockResolvedValueOnce('project-one.catalyst-sandbox.store');

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'channel',
        'update-site-url',
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
