import { checkbox, confirm, input, select } from '@inquirer/prompts';
import { Command } from 'commander';
import Conf from 'conf';
import { http, HttpResponse } from 'msw';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, MockInstance, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';
import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig, ProjectConfigSchema } from '../lib/project-config';
import { program } from '../program';

import { channels } from './channels';

vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  confirm: vi.fn(),
  input: vi.fn(),
  checkbox: vi.fn(),
}));
// `channel link` can trigger the interactive device-code login (browser +
// spinner); stub both so the no-credentials path runs headless in tests.
vi.mock('open', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
// eslint-disable-next-line import/dynamic-import-chunkname
vi.mock('yocto-spinner', () => import('../../../tests/mocks/spinner'));

const mockSelect = vi.mocked(select);
const mockConfirm = vi.mocked(confirm);
const mockInput = vi.mocked(input);
const mockCheckbox = vi.mocked(checkbox);

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

describe('channels', () => {
  test('has the update subcommand', () => {
    expect(channels).toBeInstanceOf(Command);
    expect(channels.name()).toBe('channels');
    expect(channels.aliases()).toContain('channel');

    const update = channels.commands.find((cmd) => cmd.name() === 'update');

    expect(update).toBeDefined();
    expect(update?.description()).toContain('Update a BigCommerce channel');
  });

  test('has the link subcommand', () => {
    const link = channels.commands.find((cmd) => cmd.name() === 'link');

    expect(link).toBeDefined();
    expect(link?.description()).toContain('Link this Catalyst project to a BigCommerce channel');
  });

  test('has the create subcommand', () => {
    const create = channels.commands.find((cmd) => cmd.name() === 'create');

    expect(create).toBeDefined();
    expect(create?.description()).toContain('Create a new Catalyst storefront channel');
  });

  test('has the checkout-url subcommand', () => {
    const checkoutUrl = channels.commands.find((cmd) => cmd.name() === 'checkout-url');

    expect(checkoutUrl).toBeDefined();
    expect(checkoutUrl?.description()).toContain("channel's checkout URL");
  });
});

describe('channels update', () => {
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

    mockSelect.mockResolvedValueOnce(2).mockResolvedValueOnce('project-one.catalyst-sandbox.store');

    await program.parseAsync([
      'node',
      'catalyst',
      'channels',
      'update',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--project-uuid',
      linkedProjectUuid,
    ]);

    expect(mockSelect).toHaveBeenCalledTimes(2);
    expect(putChannelId).toBe('2');
    expect(putBody).toEqual({ url: 'https://project-one.catalyst-sandbox.store' });
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('Updated channel "Catalyst Storefront" (2) site URL'),
    );
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('reads project UUID from .bigcommerce/project.json when no flag is passed', async () => {
    config.set('projectUuid', linkedProjectUuid);

    mockSelect.mockResolvedValueOnce(2).mockResolvedValueOnce('vanity.project-one.example.com');

    await program.parseAsync([
      'node',
      'catalyst',
      'channels',
      'update',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(mockSelect).toHaveBeenCalledTimes(2);
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

    await program.parseAsync([
      'node',
      'catalyst',
      'channels',
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

    expect(mockSelect).not.toHaveBeenCalled();
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
    mockConfirm.mockResolvedValueOnce(false);

    await program.parseAsync([
      'node',
      'catalyst',
      'channels',
      'update',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(consola.info).toHaveBeenCalledWith(expect.stringContaining('catalyst projects create'));
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('propagates errors from the channel-site PUT', async () => {
    server.use(
      http.put('https://:apiHost/stores/:storeHash/v3/channels/:channelId/site', () =>
        HttpResponse.json({}, { status: 401 }),
      ),
    );

    mockSelect.mockResolvedValueOnce(2).mockResolvedValueOnce('project-one.catalyst-sandbox.store');

    await expect(
      program.parseAsync([
        'node',
        'catalyst',
        'channels',
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

describe('channels link', () => {
  const initUrl =
    'https://cxm-prd.bigcommerceapp.com/stores/:storeHash/cli-api/v3/channels/:channelId/init';

  test('links a channel by id and writes .env.local', async () => {
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
      'channels',
      'link',
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
    expect(consola.success).toHaveBeenCalledWith(expect.stringContaining('Linked to channel 2'));
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

    mockSelect.mockResolvedValueOnce(2);

    await program.parseAsync([
      'node',
      'catalyst',
      'channels',
      'link',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(initChannelId).toBe('2');
    // id 2 in the default channels handler is "Catalyst Storefront".
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('Linked to channel "Catalyst Storefront" (2)'),
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
      'channels',
      'link',
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
      'channels',
      'link',
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

    await program.parseAsync(['node', 'catalyst', 'channels', 'link', '--channel-id', '2']);

    expect(config.get('storeHash')).toBe('mock-store-hash');
    expect(config.get('accessToken')).toBe('mock-access-token');
    expect(mockIdentify).toHaveBeenCalledWith('mock-store-hash');
  });
});

describe('channels create', () => {
  const eligibilityUrl =
    'https://cxm-prd.bigcommerceapp.com/stores/:storeHash/cli-api/v3/channels/catalyst/eligibility';
  const createUrl =
    'https://cxm-prd.bigcommerceapp.com/stores/:storeHash/cli-api/v3/channels/catalyst';

  test('creates a channel non-interactively and links it with --link', async () => {
    let createBody: unknown;

    server.use(
      http.post(createUrl, async ({ request }) => {
        createBody = await request.json();

        return HttpResponse.json({
          data: {
            id: 42,
            storefront_api_token: 'new-sft-token',
            envVars: {
              BIGCOMMERCE_STORE_HASH: storeHash,
              BIGCOMMERCE_CHANNEL_ID: '42',
              BIGCOMMERCE_STOREFRONT_TOKEN: 'new-sft-token',
            },
          },
        });
      }),
    );

    await program.parseAsync([
      'node',
      'catalyst',
      'channels',
      'create',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--name',
      'My Store',
      '--locale',
      'en',
      '--additional-locales',
      'es',
      'fr',
      '--no-sample-data',
      '--link',
    ]);

    // No prompts when every input is flag-provided (including --link).
    expect(mockInput).not.toHaveBeenCalled();
    expect(mockSelect).not.toHaveBeenCalled();
    expect(mockCheckbox).not.toHaveBeenCalled();

    expect(createBody).toEqual({
      name: 'My Store',
      initialData: { type: 'none' },
      deployStorefront: true,
      devOrigin: 'http://localhost:3000',
      storefrontLanguage: 'en',
      additionalLocales: ['es', 'fr'],
    });

    expect(mockIdentify).toHaveBeenCalledWith(storeHash);
    expect(consola.success).toHaveBeenCalledWith(expect.stringContaining('Created channel 42'));

    const envLocal = readFileSync(join(tmpDir, '.env.local'), 'utf8');

    expect(envLocal).toContain('BIGCOMMERCE_CHANNEL_ID=42');
    expect(envLocal).toContain('BIGCOMMERCE_STOREFRONT_TOKEN=new-sft-token');
    expect(consola.success).toHaveBeenCalledWith(expect.stringContaining('Linked to channel 42'));
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('aborts cleanly when the store is not eligible', async () => {
    let createCalled = false;

    server.use(
      http.get(eligibilityUrl, () =>
        HttpResponse.json({
          data: { eligible: false, message: 'Your plan does not support new channels.' },
        }),
      ),
      http.post(createUrl, () => {
        createCalled = true;

        return HttpResponse.json({ data: {} });
      }),
    );

    await program.parseAsync([
      'node',
      'catalyst',
      'channels',
      'create',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--name',
      'My Store',
      '--locale',
      'en',
      '--additional-locales',
      'es',
    ]);

    expect(consola.warn).toHaveBeenCalledWith('Your plan does not support new channels.');
    expect(createCalled).toBe(false);
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('prompts before linking and skips the .env.local write when declined', async () => {
    const envPath = join(tmpDir, '.env.local');

    rmSync(envPath, { force: true });

    // Only the post-create link prompt should fire (create inputs are all flags).
    mockSelect.mockResolvedValueOnce(false);

    await program.parseAsync([
      'node',
      'catalyst',
      'channels',
      'create',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--name',
      'My Store',
      '--locale',
      'en',
      '--additional-locales',
      'es',
      '--no-sample-data',
    ]);

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(consola.success).toHaveBeenCalledWith(expect.stringContaining('Created channel 42'));
    expect(consola.success).not.toHaveBeenCalledWith(expect.stringContaining('Linked to channel'));
    expect(existsSync(envPath)).toBe(false);
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('interactive path prompts for name, locale, languages, and sample data', async () => {
    let createBody: unknown;

    server.use(
      http.post(createUrl, async ({ request }) => {
        createBody = await request.json();

        return HttpResponse.json({
          data: {
            id: 42,
            storefront_api_token: 'new-sft-token',
            envVars: { BIGCOMMERCE_CHANNEL_ID: '42' },
          },
        });
      }),
    );

    mockInput.mockResolvedValueOnce('Interactive Channel');
    // select order: default locale, "add languages?", "sample data?", link prompt
    mockSelect
      .mockResolvedValueOnce('en')
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);
    mockCheckbox.mockResolvedValueOnce(['es']);

    await program.parseAsync([
      'node',
      'catalyst',
      'channels',
      'create',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(mockInput).toHaveBeenCalledTimes(1);
    expect(mockCheckbox).toHaveBeenCalledTimes(1);
    expect(createBody).toEqual({
      name: 'Interactive Channel',
      initialData: { type: 'none' },
      deployStorefront: true,
      devOrigin: 'http://localhost:3000',
      storefrontLanguage: 'en',
      additionalLocales: ['es'],
    });
    expect(consola.success).toHaveBeenCalledWith(expect.stringContaining('Created channel 42'));
  });
});

describe('channels checkout-url', () => {
  const sitePath = 'https://:apiHost/stores/:storeHash/v3/channels/:channelId/site';
  const checkoutPath = `${sitePath}/checkout-url`;

  const credentials = ['--store-hash', storeHash, '--access-token', accessToken];

  const run = (...args: string[]) =>
    program.parseAsync(['node', 'catalyst', 'channels', 'checkout-url', ...credentials, ...args]);

  test('shows the storefront, canonical and checkout URLs for a channel', async () => {
    await run('--channel-id', '2');

    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('https://example.com'));
    expect(consola.log).toHaveBeenCalledWith(
      expect.stringContaining('https://store-abc-1.mybigcommerce.com'),
    );
    expect(consola.log).toHaveBeenCalledWith(
      expect.stringContaining('https://checkout.example.com'),
    );
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  // An inherited checkout URL is the failure mode this command exists to make
  // visible, so the explanation must appear rather than a bare URL list.
  test('explains the fallback when the channel has no checkout URL of its own', async () => {
    server.use(
      http.get(sitePath, () =>
        HttpResponse.json({
          data: {
            id: 1,
            url: 'https://storefront.example.com',
            channel_id: 2,
            ssl_status: null,
            is_checkout_url_customized: false,
            urls: [
              { url: 'https://storefront.example.com', type: 'primary' },
              { url: 'https://unrelated.mybigcommerce.com', type: 'checkout' },
            ],
          },
        }),
      ),
    );

    await run('--channel-id', '2');

    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining("falls back to the default channel's primary URL"),
    );
  });

  test('prints (none) when the site has no checkout URL at all', async () => {
    server.use(
      http.get(sitePath, () =>
        HttpResponse.json({
          data: { id: 1, url: 'https://storefront.example.com', channel_id: 2, urls: [] },
        }),
      ),
    );

    await run('--channel-id', '2');

    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('(none)'));
  });

  test('prompts for the channel when --channel-id is omitted', async () => {
    mockSelect.mockResolvedValueOnce(2);

    await run();

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('Channel "Catalyst Storefront" (2)'),
    );
  });

  test('sets the checkout URL', async () => {
    let putBody: unknown;
    let putChannelId: string | undefined;

    server.use(
      http.put(checkoutPath, async ({ request, params }) => {
        putBody = await request.json();
        putChannelId = String(params.channelId);

        return HttpResponse.json({
          data: {
            id: 1,
            url: 'https://example.com',
            channel_id: 2,
            is_checkout_url_customized: true,
            urls: [
              { url: 'https://example.com', type: 'primary' },
              { url: 'https://checkout.example.com', type: 'checkout' },
            ],
          },
        });
      }),
    );

    await run('--channel-id', '2', '--url', 'https://checkout.example.com');

    expect(putChannelId).toBe('2');
    expect(putBody).toEqual({ url: 'https://checkout.example.com' });
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('checkout URL to https://checkout.example.com'),
    );
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('accepts a bare hostname and normalises away a path', async () => {
    let putBody: unknown;

    server.use(
      http.put(checkoutPath, async ({ request }) => {
        putBody = await request.json();

        return HttpResponse.json({ data: { id: 1, url: 'https://example.com', channel_id: 2 } });
      }),
    );

    await run('--channel-id', '2', '--url', 'checkout.example.com/some/path');

    expect(putBody).toEqual({ url: 'https://checkout.example.com' });
  });

  test('rejects a non-https checkout URL before calling the API', async () => {
    let called = false;

    server.use(
      http.put(checkoutPath, () => {
        called = true;

        return HttpResponse.json({ data: {} });
      }),
    );

    await expect(run('--channel-id', '2', '--url', 'http://checkout.example.com')).rejects.toThrow(
      'must use https',
    );
    expect(called).toBe(false);
  });

  test('rejects an unparseable checkout URL', async () => {
    await expect(run('--channel-id', '2', '--url', 'https://')).rejects.toThrow(
      'is not a valid URL',
    );
  });

  test('unsets the checkout URL', async () => {
    let deleted = false;

    server.use(
      http.delete(checkoutPath, () => {
        deleted = true;

        return new HttpResponse(null, { status: 204 });
      }),
    );

    await run('--channel-id', '2', '--unset');

    expect(deleted).toBe(true);
    expect(consola.success).toHaveBeenCalledWith(expect.stringContaining('shared checkout domain'));
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  // Unsetting is the one path that creates the inherited-checkout state, and
  // the domain it falls back to belongs to the default channel, so it can't be
  // predicted before the delete. It has to be reported afterwards.
  test('reports where checkout landed after --unset and warns when cross-domain', async () => {
    server.use(
      http.delete(checkoutPath, () => new HttpResponse(null, { status: 204 })),
      http.get(sitePath, () =>
        HttpResponse.json({
          data: {
            id: 1,
            url: 'https://www.example.com',
            channel_id: 2,
            is_checkout_url_customized: false,
            urls: [
              { url: 'https://www.example.com', type: 'primary' },
              { url: 'https://store-abc-1.mybigcommerce.com', type: 'checkout' },
            ],
          },
        }),
      ),
    );

    await run('--channel-id', '2', '--unset');

    expect(consola.success).toHaveBeenCalledWith(expect.stringContaining('shared checkout domain'));
    // The inherited target is surfaced, not just "done".
    expect(consola.log).toHaveBeenCalledWith(
      expect.stringContaining('https://store-abc-1.mybigcommerce.com'),
    );
    expect(consola.warn).toHaveBeenCalledWith(
      expect.stringContaining('a different domain than the storefront'),
    );
  });

  test('stays quiet after --unset when the shared checkout domain still matches', async () => {
    server.use(
      http.delete(checkoutPath, () => new HttpResponse(null, { status: 204 })),
      http.get(sitePath, () =>
        HttpResponse.json({
          data: {
            id: 1,
            url: 'https://www.example.com',
            channel_id: 2,
            is_checkout_url_customized: false,
            urls: [
              { url: 'https://www.example.com', type: 'primary' },
              { url: 'https://checkout.example.com', type: 'checkout' },
            ],
          },
        }),
      ),
    );

    await run('--channel-id', '2', '--unset');

    expect(consola.warn).not.toHaveBeenCalled();
  });

  test('refuses --url together with --unset', async () => {
    await expect(
      run('--channel-id', '2', '--url', 'https://checkout.example.com', '--unset'),
    ).rejects.toThrow('Pass either --url or --unset, not both.');
  });
});
