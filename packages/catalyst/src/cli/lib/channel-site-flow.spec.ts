import { http, HttpResponse } from 'msw';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';

import { runChannelSiteUrlFlow } from './channel-site-flow';
import { NoLinkedProjectError } from './commerce-hosting';
import { consola } from './logger';

const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';
const linkedProjectUuid = 'a23f5785-fd99-4a94-9fb3-945551623923';

beforeAll(() => {
  consola.mockTypes(() => vi.fn());

  vi.mock('./telemetry', () => {
    const instance = {
      identify: vi.fn(),
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
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('runChannelSiteUrlFlow', () => {
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
      // First prompt — channel select; resolve with channel id (as string)
      .mockResolvedValueOnce('2')
      // Second prompt — hostname select
      .mockResolvedValueOnce('project-one.catalyst-sandbox.store');

    await runChannelSiteUrlFlow({
      storeHash,
      accessToken,
      apiHost,
      projectUuid: linkedProjectUuid,
    });

    expect(promptMock).toHaveBeenCalledTimes(2);
    expect(putChannelId).toBe('2');
    expect(putBody).toEqual({ url: 'https://project-one.catalyst-sandbox.store' });
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('Updated channel "Catalyst Storefront" (2) site URL'),
    );
  });

  test('--channel-id short-circuits the channel prompt', async () => {
    const promptMock = vi
      .spyOn(consola, 'prompt')
      .mockResolvedValueOnce('vanity.project-one.example.com');

    await runChannelSiteUrlFlow({
      storeHash,
      accessToken,
      apiHost,
      projectUuid: linkedProjectUuid,
      channelId: 99,
    });

    // Only the hostname prompt fires
    expect(promptMock).toHaveBeenCalledTimes(1);
    expect(promptMock).toHaveBeenCalledWith(
      'Select the hostname to point the channel at.',
      expect.any(Object),
    );
  });

  test('--hostname short-circuits the hostname prompt', async () => {
    const promptMock = vi.spyOn(consola, 'prompt').mockResolvedValueOnce('2');

    await runChannelSiteUrlFlow({
      storeHash,
      accessToken,
      apiHost,
      projectUuid: linkedProjectUuid,
      hostname: 'manual.example.com',
    });

    expect(promptMock).toHaveBeenCalledTimes(1);
    expect(promptMock).toHaveBeenCalledWith('Select the channel to update.', expect.any(Object));
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('https://manual.example.com'),
    );
  });

  test('both overrides skip all prompts', async () => {
    const promptMock = vi.spyOn(consola, 'prompt');

    await runChannelSiteUrlFlow({
      storeHash,
      accessToken,
      apiHost,
      projectUuid: linkedProjectUuid,
      channelId: 42,
      hostname: 'auto.example.com',
    });

    expect(promptMock).not.toHaveBeenCalled();
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('Updated channel 42 site URL to https://auto.example.com.'),
    );
  });

  test('preferHostname is placed first in the hostname options', async () => {
    let hostnameOptions: Array<{ label: string; value: string }> | undefined;

    vi.spyOn(consola, 'prompt')
      .mockResolvedValueOnce('1') // channel
      .mockImplementationOnce((_message, opts) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        hostnameOptions = (opts as { options: Array<{ label: string; value: string }> }).options;

        return Promise.resolve('vanity.project-one.example.com');
      });

    await runChannelSiteUrlFlow({
      storeHash,
      accessToken,
      apiHost,
      projectUuid: linkedProjectUuid,
      preferHostname: 'vanity.project-one.example.com',
    });

    expect(hostnameOptions?.[0]).toMatchObject({ value: 'vanity.project-one.example.com' });
  });

  test('throws when no storefront channels are available', async () => {
    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/channels', () =>
        HttpResponse.json({ data: [] }),
      ),
    );

    await expect(
      runChannelSiteUrlFlow({
        storeHash,
        accessToken,
        apiHost,
        projectUuid: linkedProjectUuid,
      }),
    ).rejects.toThrow('No available storefront channels found');
  });

  test('throws when the project has no deployment hostnames', async () => {
    // Project Two in the default handler has deployment_hostnames: []
    const projectTwo = 'b23f5785-fd99-4a94-9fb3-945551623924';

    vi.spyOn(consola, 'prompt').mockResolvedValueOnce('1');

    await expect(
      runChannelSiteUrlFlow({
        storeHash,
        accessToken,
        apiHost,
        projectUuid: projectTwo,
      }),
    ).rejects.toThrow('has no deployment hostnames yet');
  });

  test('falls back to selectOrCreateInfrastructureProject when projectUuid is unset', async () => {
    let getProjectsCalls = 0;

    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () => {
        getProjectsCalls += 1;

        return HttpResponse.json({
          data: [
            {
              uuid: linkedProjectUuid,
              name: 'Project One',
              deployment_hostnames: ['project-one.catalyst-sandbox.store'],
            },
          ],
        });
      }),
    );

    vi.spyOn(consola, 'prompt')
      // selectOrCreateInfrastructureProject prompt — pick the only project
      .mockResolvedValueOnce(linkedProjectUuid)
      // channel
      .mockResolvedValueOnce('2')
      // hostname
      .mockResolvedValueOnce('project-one.catalyst-sandbox.store');

    await runChannelSiteUrlFlow({ storeHash, accessToken, apiHost });

    expect(getProjectsCalls).toBeGreaterThanOrEqual(1);
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('Updated channel "Catalyst Storefront" (2) site URL'),
    );
  });

  test('throws NoLinkedProjectError when no projects exist and user declines to create', async () => {
    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({ data: [] }),
      ),
    );

    // The "create a new project?" confirm prompt — user says no
    vi.spyOn(consola, 'prompt').mockResolvedValueOnce(false);

    await expect(runChannelSiteUrlFlow({ storeHash, accessToken, apiHost })).rejects.toBeInstanceOf(
      NoLinkedProjectError,
    );
  });

  test('warns and re-prompts when the linked project no longer exists', async () => {
    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({
          data: [
            {
              uuid: 'different-uuid',
              name: 'Some Other Project',
              deployment_hostnames: ['other.example.com'],
            },
          ],
        }),
      ),
    );

    vi.spyOn(consola, 'prompt')
      // project picker
      .mockResolvedValueOnce('different-uuid')
      // channel
      .mockResolvedValueOnce('1')
      // hostname
      .mockResolvedValueOnce('other.example.com');

    await runChannelSiteUrlFlow({
      storeHash,
      accessToken,
      apiHost,
      projectUuid: 'a-uuid-that-does-not-exist',
    });

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('not found on this store'));
  });
});
