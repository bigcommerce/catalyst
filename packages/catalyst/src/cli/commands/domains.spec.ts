import { Command } from 'commander';
import Conf from 'conf';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, MockInstance, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';
import { createDomain, getDomain } from '../lib/domains';
import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig, ProjectConfigSchema } from '../lib/project-config';

import { domains, formatDomain, formatDomainStatus, waitForDomainVerification } from './domains';

let exitMock: MockInstance;
let tmpDir: string;
let cleanup: () => Promise<void>;
let config: Conf<ProjectConfigSchema>;

const projectUuid = '6b202364-10f3-11f1-8bc7-fe9b9d8b14ab';
const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';
const domain = 'www.example.com';

function writeCredentials() {
  config.set('storeHash', storeHash);
  config.set('accessToken', accessToken);
  config.set('projectUuid', projectUuid);
}

beforeAll(async () => {
  process.env.CATALYST_TELEMETRY_DISABLED = '1';

  consola.mockTypes(() => vi.fn());
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
  delete process.env.CATALYST_TELEMETRY_DISABLED;

  vi.restoreAllMocks();
  exitMock.mockRestore();

  await cleanup();
});

describe('command configuration', () => {
  test('domains has an add subcommand', () => {
    expect(domains).toBeInstanceOf(Command);
    expect(domains.name()).toBe('domains');
    expect(domains.description()).toBe(
      'Manage custom domains for the current Native Hosting project.',
    );

    const add = domains.commands.find((command) => command.name() === 'add');

    expect(add).toBeDefined();
    expect(add?.description()).toBe('Add a custom domain to the current Native Hosting project.');
    expect(add?.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flags: '--store-hash <hash>' }),
        expect.objectContaining({ flags: '--access-token <token>' }),
        expect.objectContaining({ flags: '--api-host <host>' }),
        expect.objectContaining({ flags: '--project-uuid <uuid>' }),
        expect.objectContaining({ flags: '--wait' }),
      ]),
    );
  });
});

describe('formatDomainStatus', () => {
  test('formats known domain statuses', () => {
    expect(formatDomainStatus('pending')).toContain('pending');
    expect(formatDomainStatus('verified')).toContain('active');
    expect(formatDomainStatus('failed')).toContain('failed');
    expect(formatDomainStatus('unknown')).toContain('unknown');
  });
});

describe('formatDomain', () => {
  test('formats a domain line with the display status', () => {
    expect(
      formatDomain({
        domain,
        project_uuid: projectUuid,
        verification_status: 'verified',
      }),
    ).toContain(`${domain} `);
    expect(
      formatDomain({
        domain,
        project_uuid: projectUuid,
        verification_status: 'verified',
      }),
    ).toContain('active');
  });
});

describe('domain API client', () => {
  test('creates a domain with the expected request body', async () => {
    let capturedBody: unknown;

    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains',
        async ({ request }) => {
          capturedBody = await request.json();

          return HttpResponse.json(
            {
              data: {
                domain,
                project_uuid: projectUuid,
                verification_status: 'pending',
              },
            },
            { status: 201 },
          );
        },
      ),
    );

    await expect(
      createDomain(domain, projectUuid, storeHash, accessToken, apiHost),
    ).resolves.toEqual({
      domain,
      project_uuid: projectUuid,
      verification_status: 'pending',
    });
    expect(capturedBody).toEqual({ domain });
  });

  test('surfaces disabled API responses', async () => {
    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains',
        () => new HttpResponse(null, { status: 403 }),
      ),
    );

    await expect(
      createDomain(domain, projectUuid, storeHash, accessToken, apiHost),
    ).rejects.toThrow('Infrastructure Domains API not enabled');
  });

  test('surfaces V3 validation errors', async () => {
    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains',
        () =>
          HttpResponse.json(
            {
              title: 'Domain could not be added.',
              errors: { domain: 'Enter a valid domain.' },
            },
            { status: 422 },
          ),
      ),
    );

    await expect(
      createDomain(domain, projectUuid, storeHash, accessToken, apiHost),
    ).rejects.toThrow('Domain could not be added. (domain: Enter a valid domain.)');
  });

  test('falls back to status text when a client error response is not a V3 body', async () => {
    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain',
        () => new HttpResponse(null, { status: 400, statusText: 'Bad Request' }),
      ),
    );

    await expect(getDomain(domain, projectUuid, storeHash, accessToken, apiHost)).rejects.toThrow(
      'Failed to fetch domain: Bad Request',
    );
  });

  test('adds status and correlation details for server errors', async () => {
    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains',
        () =>
          HttpResponse.json(
            {
              status: 502,
              title: 'Bad Gateway',
              errors: {},
            },
            { status: 502, statusText: 'Bad Gateway' },
          ),
      ),
    );

    await expect(
      createDomain(domain, projectUuid, storeHash, accessToken, apiHost),
    ).rejects.toThrow(/Failed to add domain: 502 Bad Gateway.*Correlation ID:/);
  });
});

describe('waitForDomainVerification', () => {
  test('returns immediately when the domain is already verified', async () => {
    await expect(
      waitForDomainVerification({
        domain,
        projectUuid,
        storeHash,
        accessToken,
        apiHost,
        intervalMs: 0,
      }),
    ).resolves.toEqual({
      domain,
      project_uuid: projectUuid,
      verification_status: 'verified',
    });
  });

  test('polls pending domains until they leave pending status', async () => {
    let requests = 0;

    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain',
        () => {
          requests += 1;

          return HttpResponse.json({
            data: {
              domain,
              project_uuid: projectUuid,
              verification_status: requests === 1 ? 'pending' : 'failed',
            },
          });
        },
      ),
    );

    await expect(
      waitForDomainVerification({
        domain,
        projectUuid,
        storeHash,
        accessToken,
        apiHost,
        intervalMs: 0,
      }),
    ).resolves.toEqual({
      domain,
      project_uuid: projectUuid,
      verification_status: 'failed',
    });
    expect(requests).toBe(2);
  });

  test('returns the latest pending status after the timeout expires', async () => {
    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain',
        () =>
          HttpResponse.json({
            data: {
              domain,
              project_uuid: projectUuid,
              verification_status: 'pending',
            },
          }),
      ),
    );

    await expect(
      waitForDomainVerification({
        domain,
        projectUuid,
        storeHash,
        accessToken,
        apiHost,
        timeoutMs: 0,
      }),
    ).resolves.toEqual({
      domain,
      project_uuid: projectUuid,
      verification_status: 'pending',
    });
  });
});

describe('add command', () => {
  test('adds a domain to the linked project', async () => {
    writeCredentials();

    await domains.parseAsync(['add', domain], { from: 'user' });

    expect(consola.start).toHaveBeenCalledWith(`Adding domain ${domain}...`);
    expect(consola.success).toHaveBeenCalledWith(`Domain ${domain} added.`);
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining(domain));
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('pending'));
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('can wait for domain verification after adding', async () => {
    writeCredentials();

    await domains.parseAsync(['add', domain, '--wait'], { from: 'user' });

    expect(consola.start).toHaveBeenCalledWith(`Waiting for ${domain} to verify...`);
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('active'));
  });
});
