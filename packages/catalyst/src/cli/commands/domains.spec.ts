import { confirm, select } from '@inquirer/prompts';
import { Command } from 'commander';
import Conf from 'conf';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, MockInstance, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';
import {
  claimDomain,
  createDomain,
  deleteDomain,
  findDomain,
  getDomain,
  listDomains,
  transferDomain,
} from '../lib/domains';
import { UserActionableError } from '../lib/errors';
import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig, ProjectConfigSchema } from '../lib/project-config';

import {
  domains,
  formatDomain,
  formatDomainStatus,
  formatPointingRecords,
  waitForDomainVerification,
} from './domains';

vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn(),
  select: vi.fn(),
}));

const confirmMock = vi.mocked(confirm);
const selectMock = vi.mocked(select);

let exitMock: MockInstance;
let tmpDir: string;
let cleanup: () => Promise<void>;
let config: Conf<ProjectConfigSchema>;

const projectUuid = '6b202364-10f3-11f1-8bc7-fe9b9d8b14ab';
const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';
const domain = 'www.example.com';
// Mirrors the records the default handlers return for `domain`.
const pointingRecords = {
  a_record_value: '198.51.100.10',
  cname_record_value: 'shared.hosting.bigcommerce.com',
};

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
  test('domains has add, list, status, claim, transfer, and remove subcommands', () => {
    expect(domains).toBeInstanceOf(Command);
    expect(domains.name()).toBe('domains');
    expect(domains.description()).toBe(
      'Manage custom domains for the current Native Hosting project.',
    );

    const add = domains.commands.find((command) => command.name() === 'add');
    const list = domains.commands.find((command) => command.name() === 'list');
    const status = domains.commands.find((command) => command.name() === 'status');
    const claim = domains.commands.find((command) => command.name() === 'claim');
    const transfer = domains.commands.find((command) => command.name() === 'transfer');
    const remove = domains.commands.find((command) => command.name() === 'remove');

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

    expect(list).toBeDefined();
    expect(list?.description()).toBe('List custom domains for the current Native Hosting project.');
    expect(list?.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flags: '--store-hash <hash>' }),
        expect.objectContaining({ flags: '--access-token <token>' }),
        expect.objectContaining({ flags: '--api-host <host>' }),
        expect.objectContaining({ flags: '--project-uuid <uuid>' }),
        expect.objectContaining({ flags: '--domain <domain>' }),
        expect.objectContaining({ flags: '--status <status>' }),
      ]),
    );

    expect(status).toBeDefined();
    expect(status?.description()).toBe(
      'Show the status of a custom domain on the current Native Hosting project.',
    );
    expect(status?.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flags: '--store-hash <hash>' }),
        expect.objectContaining({ flags: '--access-token <token>' }),
        expect.objectContaining({ flags: '--api-host <host>' }),
        expect.objectContaining({ flags: '--project-uuid <uuid>' }),
        expect.objectContaining({ flags: '--wait' }),
      ]),
    );

    expect(claim).toBeDefined();
    expect(claim?.description()).toBe(
      'Claim a custom domain that is currently in use on another store.',
    );
    expect(claim?.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flags: '--store-hash <hash>' }),
        expect.objectContaining({ flags: '--access-token <token>' }),
        expect.objectContaining({ flags: '--api-host <host>' }),
        expect.objectContaining({ flags: '--project-uuid <uuid>' }),
        expect.objectContaining({ flags: '--wait' }),
      ]),
    );

    expect(transfer).toBeDefined();
    expect(transfer?.description()).toBe(
      'Transfer a custom domain to another project in the same store.',
    );
    expect(transfer?.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flags: '--store-hash <hash>' }),
        expect.objectContaining({ flags: '--access-token <token>' }),
        expect.objectContaining({ flags: '--api-host <host>' }),
        expect.objectContaining({ flags: '--project-uuid <uuid>' }),
        expect.objectContaining({ flags: '--to-project-uuid <uuid>' }),
        expect.objectContaining({ flags: '--wait' }),
      ]),
    );

    expect(remove).toBeDefined();
    expect(remove?.description()).toBe(
      'Remove a custom domain from the current Native Hosting project.',
    );
    expect(remove?.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flags: '--store-hash <hash>' }),
        expect.objectContaining({ flags: '--access-token <token>' }),
        expect.objectContaining({ flags: '--api-host <host>' }),
        expect.objectContaining({ flags: '--project-uuid <uuid>' }),
        expect.objectContaining({ flags: '--force' }),
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

describe('formatPointingRecords', () => {
  test('renders both records the merchant can publish', () => {
    const output = formatPointingRecords(pointingRecords);

    expect(output).toContain('A      198.51.100.10');
    expect(output).toContain('CNAME  shared.hosting.bigcommerce.com');
    // Record types are padded so the values line up.
    expect(output?.split('\n')).toHaveLength(2);
  });

  test('omits a record the API left null', () => {
    const output = formatPointingRecords({ a_record_value: '198.51.100.10' });

    expect(output).toContain('198.51.100.10');
    expect(output).not.toContain('CNAME');
  });

  test('returns null when there is nothing to publish yet', () => {
    expect(formatPointingRecords(null)).toBeNull();
    expect(formatPointingRecords(undefined)).toBeNull();
    expect(formatPointingRecords({})).toBeNull();
    expect(formatPointingRecords({ a_record_value: '', cname_record_value: null })).toBeNull();
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
                pointing_records: pointingRecords,
              },
            },
            { status: 201 },
          );
        },
      ),
    );

    // `createDomain` is the only client that keeps `pointing_records` — the
    // endpoint is the only one that returns them.
    await expect(
      createDomain(domain, projectUuid, storeHash, accessToken, apiHost),
    ).resolves.toEqual({
      domain,
      project_uuid: projectUuid,
      verification_status: 'pending',
      pointing_records: pointingRecords,
    });
    expect(capturedBody).toEqual({ domain });
  });

  test('tolerates a create response without the records', async () => {
    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains',
        () =>
          HttpResponse.json(
            {
              data: {
                domain,
                project_uuid: projectUuid,
                verification_status: 'pending',
                pointing_records: null,
              },
            },
            { status: 201 },
          ),
      ),
    );

    await expect(
      createDomain(domain, projectUuid, storeHash, accessToken, apiHost),
    ).resolves.toMatchObject({ domain, pointing_records: null });
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

    const error = await createDomain(domain, projectUuid, storeHash, accessToken, apiHost).catch(
      (err: unknown) => err,
    );

    expect(error).toBeInstanceOf(Error);
    // A 5xx is a server-side failure worth escalating, so it stays a plain Error
    // and keeps the top-level Correlation ID + support framing.
    expect(error).not.toBeInstanceOf(UserActionableError);
    expect(error).toHaveProperty(
      'message',
      'Failed to add domain: 502 Bad Gateway. This is a server-side response from the Domains API.',
    );
  });

  test('treats a 4xx conflict as user-actionable (no support/correlation framing)', async () => {
    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain/claim',
        () =>
          HttpResponse.json(
            {
              status: 409,
              title:
                'The domain is already bound to another project in this store. Use the transfer endpoint to move it.',
              errors: {
                domain: `'${domain}' is already bound to another project in this store.`,
              },
            },
            { status: 409 },
          ),
      ),
    );

    const error = await claimDomain(domain, projectUuid, storeHash, accessToken, apiHost).catch(
      (err: unknown) => err,
    );

    expect(error).toBeInstanceOf(UserActionableError);
    expect(error).toHaveProperty(
      'message',
      expect.stringContaining('already bound to another project in this store'),
    );
  });

  test('lists domains for a project', async () => {
    await expect(listDomains(projectUuid, storeHash, accessToken, apiHost)).resolves.toEqual([
      {
        domain: 'www.example.com',
        project_uuid: projectUuid,
        verification_status: 'pending',
      },
      {
        domain: 'shop.example.com',
        project_uuid: projectUuid,
        verification_status: 'verified',
      },
    ]);
  });

  test('passes list filters to the API', async () => {
    let capturedSearchParams: URLSearchParams | undefined;

    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains',
        ({ request }) => {
          capturedSearchParams = new URL(request.url).searchParams;

          return HttpResponse.json({
            data: [
              {
                domain,
                project_uuid: projectUuid,
                verification_status: 'pending',
              },
            ],
          });
        },
      ),
    );

    await expect(
      listDomains(projectUuid, storeHash, accessToken, apiHost, {
        domains: [domain],
        verificationStatus: 'pending',
      }),
    ).resolves.toEqual([
      {
        domain,
        project_uuid: projectUuid,
        verification_status: 'pending',
      },
    ]);
    expect(capturedSearchParams?.get('domain:in')).toBe(domain);
    expect(capturedSearchParams?.get('verification_status')).toBe('pending');
  });

  test('deletes a domain', async () => {
    let deletedDomain: string | readonly string[] | undefined;

    server.use(
      http.delete(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain',
        ({ params }) => {
          deletedDomain = params.domain;

          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    await expect(
      deleteDomain(domain, projectUuid, storeHash, accessToken, apiHost),
    ).resolves.toBeUndefined();
    expect(deletedDomain).toBe(domain);
  });

  test('claims a domain', async () => {
    let claimedDomain: string | readonly string[] | undefined;

    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain/claim',
        ({ params }) => {
          claimedDomain = params.domain;

          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    await expect(
      claimDomain(domain, projectUuid, storeHash, accessToken, apiHost),
    ).resolves.toBeUndefined();
    expect(claimedDomain).toBe(domain);
  });

  test('transfers a domain with the destination project in the body', async () => {
    const newProjectUuid = 'a23f5785-fd99-4a94-9fb3-945551623923';
    let capturedBody: unknown;
    let capturedSourceProject: string | readonly string[] | undefined;

    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain/transfer',
        async ({ request, params }) => {
          capturedBody = await request.json();
          capturedSourceProject = params.projectUuid;

          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    await expect(
      transferDomain(domain, projectUuid, newProjectUuid, storeHash, accessToken, apiHost),
    ).resolves.toBeUndefined();
    expect(capturedSourceProject).toBe(projectUuid);
    expect(capturedBody).toEqual({ new_project_uuid: newProjectUuid });
  });

  test('findDomain returns the domain when it exists on the project', async () => {
    await expect(findDomain(domain, projectUuid, storeHash, accessToken, apiHost)).resolves.toEqual(
      {
        domain,
        project_uuid: projectUuid,
        verification_status: 'verified',
      },
    );
  });

  test('findDomain returns null when the domain is not on the project', async () => {
    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain',
        () => new HttpResponse(null, { status: 404 }),
      ),
    );

    await expect(
      findDomain(domain, projectUuid, storeHash, accessToken, apiHost),
    ).resolves.toBeNull();
  });

  test('findDomain still throws on non-404 errors', async () => {
    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain',
        () => new HttpResponse(null, { status: 403 }),
      ),
    );

    await expect(findDomain(domain, projectUuid, storeHash, accessToken, apiHost)).rejects.toThrow(
      'Infrastructure Domains API not enabled',
    );
  });

  test('surfaces the ownership-verification TXT record when a claim is not yet verified', async () => {
    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain/claim',
        () =>
          HttpResponse.json(
            {
              title: 'Domain ownership could not be verified.',
              errors: {
                domain: `No ownership verification TXT record was found at '_bigcommerce-verification.${domain}'. Add the record, then try again.`,
              },
              meta: {
                ownership_verification: {
                  type: 'TXT',
                  name: `_bigcommerce-verification.${domain}`,
                  value: 'bc-verify=019500e2933d70578e81090dd7240795',
                },
              },
            },
            { status: 422 },
          ),
      ),
    );

    await expect(
      claimDomain(domain, projectUuid, storeHash, accessToken, apiHost),
    ).rejects.toMatchObject({
      name: 'DomainOwnershipVerificationError',
      ownershipVerification: {
        type: 'TXT',
        name: `_bigcommerce-verification.${domain}`,
        value: 'bc-verify=019500e2933d70578e81090dd7240795',
      },
    });
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

  test('prints the DNS records to publish along with the success message', async () => {
    writeCredentials();

    await domains.parseAsync(['add', domain], { from: 'user' });

    expect(consola.success).toHaveBeenCalledWith(`Domain ${domain} added.`);
    expect(consola.info).toHaveBeenCalledWith(
      `Point ${domain} at this project with one of these DNS records:`,
    );
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('A      198.51.100.10'));
    expect(consola.log).toHaveBeenCalledWith(
      expect.stringContaining('CNAME  shared.hosting.bigcommerce.com'),
    );
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('only `domains add` returns them'),
    );
    expect(consola.info).toHaveBeenCalledWith(
      `Run \`catalyst domains status ${domain}\` to check verification progress.`,
    );
  });

  test('still prints the records after waiting for verification', async () => {
    writeCredentials();

    await domains.parseAsync(['add', domain, '--wait'], { from: 'user' });

    // Polling re-fetches the domain resource, which no longer carries the
    // records — they have to survive from the create response.
    expect(consola.start).toHaveBeenCalledWith(`Waiting for ${domain} to verify...`);
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('active'));
    expect(consola.log).toHaveBeenCalledWith(
      expect.stringContaining('CNAME  shared.hosting.bigcommerce.com'),
    );
  });

  test('skips the DNS guidance when the API has no records yet', async () => {
    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains',
        () =>
          HttpResponse.json(
            {
              data: {
                domain,
                project_uuid: projectUuid,
                verification_status: 'pending',
                pointing_records: null,
              },
            },
            { status: 201 },
          ),
      ),
    );

    writeCredentials();

    await domains.parseAsync(['add', domain], { from: 'user' });

    expect(consola.success).toHaveBeenCalledWith(`Domain ${domain} added.`);
    expect(consola.info).not.toHaveBeenCalledWith(expect.stringContaining('DNS records:'));
    expect(consola.log).not.toHaveBeenCalledWith(expect.stringContaining('198.51.100.10'));
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('can wait for domain verification after adding', async () => {
    writeCredentials();

    await domains.parseAsync(['add', domain, '--wait'], { from: 'user' });

    expect(consola.start).toHaveBeenCalledWith(`Waiting for ${domain} to verify...`);
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('active'));
  });

  test('surfaces the ownership TXT record and claim guidance on a cross-store collision', async () => {
    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains',
        () =>
          HttpResponse.json(
            {
              title:
                'The domain is already bound to a different store. Verify ownership using the claim endpoint, then try again.',
              errors: {
                domain: `'${domain}' is already bound to a different store; verify ownership, then try again.`,
              },
              meta: {
                ownership_verification: {
                  type: 'TXT',
                  name: `_bigcommerce-verification.${domain}`,
                  value: 'bc-verify=019500e2933d70578e81090dd7240795',
                },
              },
            },
            { status: 409 },
          ),
      ),
    );

    writeCredentials();

    await domains.parseAsync(['add', domain], { from: 'user' });

    expect(consola.warn).toHaveBeenCalledWith(
      expect.stringContaining('already in use on another store'),
    );
    expect(consola.log).toHaveBeenCalledWith(
      expect.stringContaining('bc-verify=019500e2933d70578e81090dd7240795'),
    );
    expect(consola.info).toHaveBeenCalledWith('Once the record is live, claim it with:');
    expect(consola.log).toHaveBeenCalledWith(`  catalyst domains claim ${domain}`);
    // The raw V3 title/field text isn't echoed — the concise message replaces it.
    expect(consola.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('Verify ownership using the claim endpoint'),
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('suggests the transfer command when the domain is bound to another project in the store', async () => {
    const boundProjectUuid = 'b23f5785-fd99-4a94-9fb3-945551623924';

    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains',
        () =>
          HttpResponse.json(
            {
              title:
                'The domain is already bound to another project in this store. Use the transfer endpoint to move it.',
              errors: {
                domain: `'${domain}' is already bound to another project in this store.`,
              },
              meta: { project_uuid: boundProjectUuid },
            },
            { status: 409 },
          ),
      ),
    );

    writeCredentials();

    await domains.parseAsync(['add', domain], { from: 'user' });

    expect(consola.warn).toHaveBeenCalledWith(
      expect.stringContaining('already bound to another project in this store'),
    );
    expect(consola.info).toHaveBeenCalledWith('To move it to this project, run:');
    expect(consola.log).toHaveBeenCalledWith(
      `  catalyst domains transfer ${domain} --project-uuid ${boundProjectUuid} --to-project-uuid ${projectUuid}`,
    );
    // The raw V3 title/field text isn't echoed — the concise message + suggestion replace it.
    expect(consola.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('Use the transfer endpoint to move it'),
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});

describe('list command', () => {
  test('lists domains for the linked project', async () => {
    writeCredentials();

    await domains.parseAsync(['list'], { from: 'user' });

    expect(consola.start).toHaveBeenCalledWith('Fetching domains...');
    expect(consola.success).toHaveBeenCalledWith('Domains fetched.');
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('www.example.com'));
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('pending'));
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('shop.example.com'));
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('active'));
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('passes filters from options', async () => {
    let capturedSearchParams: URLSearchParams | undefined;

    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains',
        ({ request }) => {
          capturedSearchParams = new URL(request.url).searchParams;

          return HttpResponse.json({
            data: [
              {
                domain,
                project_uuid: projectUuid,
                verification_status: 'pending',
              },
            ],
          });
        },
      ),
    );

    writeCredentials();

    await domains.parseAsync(['list', '--domain', domain, '--status', 'pending'], { from: 'user' });

    expect(capturedSearchParams?.get('domain:in')).toBe(domain);
    expect(capturedSearchParams?.get('verification_status')).toBe('pending');
  });

  test('reports when no domains are configured', async () => {
    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains',
        () => HttpResponse.json({ data: [] }),
      ),
    );

    writeCredentials();

    await domains.parseAsync(['list'], { from: 'user' });

    expect(consola.info).toHaveBeenCalledWith('No custom domains found.');
    expect(exitMock).toHaveBeenCalledWith(0);
  });
});

describe('status command', () => {
  test('shows a domain status for the linked project', async () => {
    writeCredentials();

    await domains.parseAsync(['status', domain], { from: 'user' });

    expect(consola.start).toHaveBeenCalledWith(`Fetching status for ${domain}...`);
    expect(consola.success).toHaveBeenCalledWith('Domain status fetched.');
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining(domain));
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('active'));
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('can wait for a pending domain to leave pending status', async () => {
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
              verification_status: requests === 1 ? 'pending' : 'verified',
            },
          });
        },
      ),
    );

    writeCredentials();

    await domains.parseAsync(['status', domain, '--wait'], { from: 'user' });

    expect(consola.start).toHaveBeenCalledWith(`Waiting for ${domain} to verify...`);
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('active'));
    expect(requests).toBe(2);
  });
});

describe('claim command', () => {
  test('claims a domain for the linked project', async () => {
    writeCredentials();

    await domains.parseAsync(['claim', domain], { from: 'user' });

    expect(consola.start).toHaveBeenCalledWith(`Claiming domain ${domain}...`);
    expect(consola.success).toHaveBeenCalledWith(`Domain ${domain} claimed.`);
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining(domain));
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('active'));
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('prints the ownership TXT record when verification has not completed', async () => {
    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain/claim',
        () =>
          HttpResponse.json(
            {
              title: 'Domain ownership could not be verified.',
              errors: {
                domain: `No ownership verification TXT record was found at '_bigcommerce-verification.${domain}'. Add the record, then try again.`,
              },
              meta: {
                ownership_verification: {
                  type: 'TXT',
                  name: `_bigcommerce-verification.${domain}`,
                  value: 'bc-verify=019500e2933d70578e81090dd7240795',
                },
              },
            },
            { status: 422 },
          ),
      ),
    );

    writeCredentials();

    await domains.parseAsync(['claim', domain], { from: 'user' });

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('could not be verified'));
    expect(consola.log).toHaveBeenCalledWith(
      expect.stringContaining('bc-verify=019500e2933d70578e81090dd7240795'),
    );
    expect(consola.success).not.toHaveBeenCalled();
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('can wait for a claimed domain to leave pending status', async () => {
    let getRequests = 0;

    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain/claim',
        () => new HttpResponse(null, { status: 204 }),
      ),
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain',
        () => {
          getRequests += 1;

          return HttpResponse.json({
            data: {
              domain,
              project_uuid: projectUuid,
              verification_status: getRequests === 1 ? 'pending' : 'verified',
            },
          });
        },
      ),
    );

    writeCredentials();

    await domains.parseAsync(['claim', domain, '--wait'], { from: 'user' });

    expect(consola.success).toHaveBeenCalledWith(`Domain ${domain} claimed.`);
    expect(consola.start).toHaveBeenCalledWith(`Waiting for ${domain} to verify...`);
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('active'));
    expect(getRequests).toBe(2);
  });
});

describe('transfer command', () => {
  const destinationProjectUuid = 'a23f5785-fd99-4a94-9fb3-945551623923';

  test('transfers to the project passed via --to-project-uuid without prompting', async () => {
    let capturedBody: unknown;
    let capturedSourceProject: string | readonly string[] | undefined;

    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain/transfer',
        async ({ request, params }) => {
          capturedBody = await request.json();
          capturedSourceProject = params.projectUuid;

          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    writeCredentials();

    await domains.parseAsync(['transfer', domain, '--to-project-uuid', destinationProjectUuid], {
      from: 'user',
    });

    expect(selectMock).not.toHaveBeenCalled();
    expect(capturedSourceProject).toBe(projectUuid);
    expect(capturedBody).toEqual({ new_project_uuid: destinationProjectUuid });
    expect(consola.success).toHaveBeenCalledWith(`Domain ${domain} transferred.`);
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('active'));
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('prompts to pick a destination project, excluding the source', async () => {
    // Default fetchProjects handler returns Project One + Project Two; the
    // linked (source) project UUID matches neither, so both are offered.
    selectMock.mockResolvedValue(destinationProjectUuid);

    let capturedBody: unknown;

    server.use(
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain/transfer',
        async ({ request }) => {
          capturedBody = await request.json();

          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    writeCredentials();

    await domains.parseAsync(['transfer', domain], { from: 'user' });

    expect(selectMock).toHaveBeenCalledTimes(1);

    const choiceValues = selectMock.mock.calls[0][0].choices.map((choice) =>
      typeof choice === 'object' && 'value' in choice ? choice.value : undefined,
    );

    expect(choiceValues).not.toContain(projectUuid);
    expect(capturedBody).toEqual({ new_project_uuid: destinationProjectUuid });
    expect(consola.success).toHaveBeenCalledWith(`Domain ${domain} transferred.`);
  });

  test('points at the owning project when the domain lives on another one', async () => {
    // Default fetchProjects returns Project One (a23f…) + Project Two (b23f…).
    // The domain is on Project One; the linked project and Project Two 404.
    const ownerUuid = destinationProjectUuid;
    let transferRequests = 0;

    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain',
        ({ params }) =>
          params.projectUuid === ownerUuid
            ? HttpResponse.json({
                data: { domain, project_uuid: ownerUuid, verification_status: 'verified' },
              })
            : new HttpResponse(null, { status: 404 }),
      ),
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain/transfer',
        () => {
          transferRequests += 1;

          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    writeCredentials();

    await domains.parseAsync(['transfer', domain], { from: 'user' });

    expect(consola.warn).toHaveBeenCalledWith(
      expect.stringContaining(`${domain} is on project "Project One" (${ownerUuid})`),
    );
    expect(consola.log).toHaveBeenCalledWith(
      `  catalyst domains transfer ${domain} --project-uuid ${ownerUuid}`,
    );
    // The transfer is never attempted, and the user is never prompted.
    expect(transferRequests).toBe(0);
    expect(selectMock).not.toHaveBeenCalled();
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('errors when the domain is on no project in the store', async () => {
    let transferRequests = 0;

    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain',
        () => new HttpResponse(null, { status: 404 }),
      ),
      http.post(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain/transfer',
        () => {
          transferRequests += 1;

          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    writeCredentials();

    await expect(
      domains.parseAsync(['transfer', domain, '--to-project-uuid', destinationProjectUuid], {
        from: 'user',
      }),
    ).rejects.toThrow(`${domain} isn't on any project in this store`);

    // The transfer is never attempted, and the user is never prompted.
    expect(transferRequests).toBe(0);
    expect(selectMock).not.toHaveBeenCalled();
  });

  test('rejects a destination that matches the source project', async () => {
    writeCredentials();

    await expect(
      domains.parseAsync(['transfer', domain, '--to-project-uuid', projectUuid], { from: 'user' }),
    ).rejects.toThrow('destination project must differ from the source project');
  });

  test('errors when there are no other projects to transfer to', async () => {
    server.use(
      http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
        HttpResponse.json({
          data: [{ uuid: projectUuid, name: 'Only Project', deployment_hostnames: [] }],
        }),
      ),
    );

    writeCredentials();

    await expect(domains.parseAsync(['transfer', domain], { from: 'user' })).rejects.toThrow(
      'No other projects to transfer to',
    );
    expect(selectMock).not.toHaveBeenCalled();
  });
});

describe('remove command', () => {
  test('confirms before removing an active domain', async () => {
    confirmMock.mockResolvedValue(true);

    writeCredentials();

    await domains.parseAsync(['remove', domain], { from: 'user' });

    expect(consola.start).toHaveBeenCalledWith(`Fetching status for ${domain}...`);
    expect(confirmMock).toHaveBeenCalledWith({
      message: `Remove active domain ${domain}? Traffic may stop routing to this project.`,
      default: false,
    });
    expect(consola.start).toHaveBeenCalledWith(`Removing domain ${domain}...`);
    expect(consola.success).toHaveBeenCalledWith(`Domain ${domain} removed.`);
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('does not remove an active domain when confirmation is declined', async () => {
    let deleteRequests = 0;

    server.use(
      http.delete(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain',
        () => {
          deleteRequests += 1;

          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    confirmMock.mockResolvedValue(false);

    writeCredentials();

    await domains.parseAsync(['remove', domain], { from: 'user' });

    expect(consola.info).toHaveBeenCalledWith('Aborted. No domain was removed.');
    expect(deleteRequests).toBe(0);
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  test('skips confirmation with --force', async () => {
    confirmMock.mockResolvedValue(false);

    writeCredentials();

    await domains.parseAsync(['remove', domain, '--force'], { from: 'user' });

    expect(confirmMock).not.toHaveBeenCalled();
    expect(consola.success).toHaveBeenCalledWith(`Domain ${domain} removed.`);
  });

  test('does not prompt before removing a pending domain', async () => {
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

    writeCredentials();

    await domains.parseAsync(['remove', domain], { from: 'user' });

    expect(confirmMock).not.toHaveBeenCalled();
    expect(consola.success).toHaveBeenCalledWith(`Domain ${domain} removed.`);
  });
});
