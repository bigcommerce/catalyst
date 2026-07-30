import { confirm, input, select } from '@inquirer/prompts';
import { http, HttpResponse } from 'msw';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';

import { runChannelSiteUrlFlow } from './channel-site-flow';
import { NoLinkedProjectError } from './commerce-hosting';
import { consola } from './logger';

vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  confirm: vi.fn(),
  input: vi.fn(),
}));

const selectMock = vi.mocked(select);
const confirmMock = vi.mocked(confirm);
const inputMock = vi.mocked(input);

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

    selectMock
      // First select — channel select; resolves with the channel id (a number)
      .mockResolvedValueOnce(2)
      // Second select — hostname select (a string)
      .mockResolvedValueOnce('project-one.catalyst-sandbox.store');

    await runChannelSiteUrlFlow({
      storeHash,
      accessToken,
      apiHost,
      projectUuid: linkedProjectUuid,
    });

    expect(selectMock).toHaveBeenCalledTimes(2);
    expect(putChannelId).toBe('2');
    expect(putBody).toEqual({ url: 'https://project-one.catalyst-sandbox.store' });
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('Updated channel "Catalyst Storefront" (2) site URL'),
    );
  });

  test('--channel-id short-circuits the channel prompt', async () => {
    selectMock.mockResolvedValueOnce('vanity.project-one.example.com');

    await runChannelSiteUrlFlow({
      storeHash,
      accessToken,
      apiHost,
      projectUuid: linkedProjectUuid,
      channelId: 99,
    });

    // Only the hostname select fires
    expect(selectMock).toHaveBeenCalledTimes(1);
    expect(selectMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Select the hostname to point the channel at.' }),
    );
  });

  test('--hostname short-circuits the hostname prompt', async () => {
    selectMock.mockResolvedValueOnce(2);

    await runChannelSiteUrlFlow({
      storeHash,
      accessToken,
      apiHost,
      projectUuid: linkedProjectUuid,
      hostname: 'manual.example.com',
    });

    expect(selectMock).toHaveBeenCalledTimes(1);
    expect(selectMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Select the channel to update.' }),
    );
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('https://manual.example.com'),
    );
  });

  test('both overrides skip all prompts', async () => {
    await runChannelSiteUrlFlow({
      storeHash,
      accessToken,
      apiHost,
      projectUuid: linkedProjectUuid,
      channelId: 42,
      hostname: 'auto.example.com',
    });

    expect(selectMock).not.toHaveBeenCalled();
    expect(confirmMock).not.toHaveBeenCalled();
    expect(inputMock).not.toHaveBeenCalled();
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('Updated channel 42 site URL to https://auto.example.com.'),
    );
  });

  test('preferHostname is placed first in the hostname options', async () => {
    selectMock
      .mockResolvedValueOnce(2) // channel (the catalyst one)
      .mockResolvedValueOnce('vanity.project-one.example.com'); // hostname

    await runChannelSiteUrlFlow({
      storeHash,
      accessToken,
      apiHost,
      projectUuid: linkedProjectUuid,
      preferHostname: 'vanity.project-one.example.com',
    });

    // The hostname select is the second call; inspect the choices passed to it.
    const hostnameCall = selectMock.mock.calls[1][0];
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const hostnameChoices = hostnameCall.choices as Array<{ name: string; value: string }>;

    expect(hostnameChoices[0]).toMatchObject({ value: 'vanity.project-one.example.com' });
  });

  test('throws when no Catalyst channels are available', async () => {
    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/channels', () =>
        HttpResponse.json({
          // Only non-Catalyst channels — filtered out, so the picker is empty.
          data: [{ id: 1, name: 'Default Storefront', platform: 'bigcommerce' }],
        }),
      ),
    );

    await expect(
      runChannelSiteUrlFlow({
        storeHash,
        accessToken,
        apiHost,
        projectUuid: linkedProjectUuid,
      }),
    ).rejects.toThrow('No Catalyst channels found on this store');
  });

  test('filters non-Catalyst channels out of the picker', async () => {
    selectMock
      .mockResolvedValueOnce(2) // channel
      .mockResolvedValueOnce('project-one.catalyst-sandbox.store'); // hostname

    await runChannelSiteUrlFlow({
      storeHash,
      accessToken,
      apiHost,
      projectUuid: linkedProjectUuid,
    });

    // The channel select is the first call; inspect the choices passed to it.
    const channelCall = selectMock.mock.calls[0][0];
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const channelChoices = channelCall.choices as Array<{ name: string; value: number }>;

    // The default handler returns one bigcommerce + one catalyst channel; only
    // the catalyst one should appear in the picker.
    expect(channelChoices).toHaveLength(1);
    expect(channelChoices[0]).toMatchObject({ name: 'Catalyst Storefront', value: 2 });
  });

  test('throws when the project has no deployment hostnames', async () => {
    // Project Two in the default handler has deployment_hostnames: []
    const projectTwo = 'b23f5785-fd99-4a94-9fb3-945551623924';

    selectMock.mockResolvedValueOnce(2);

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

    selectMock
      // selectOrCreateInfrastructureProject select — pick the only project (UUID string)
      .mockResolvedValueOnce(linkedProjectUuid)
      // channel (number)
      .mockResolvedValueOnce(2)
      // hostname (string)
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
    confirmMock.mockResolvedValueOnce(false);

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

    selectMock
      // project picker (UUID string)
      .mockResolvedValueOnce('different-uuid')
      // channel (number)
      .mockResolvedValueOnce(1)
      // hostname (string)
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
