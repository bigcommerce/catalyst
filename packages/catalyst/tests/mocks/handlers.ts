import { http, HttpResponse } from 'msw';

const encoder = new TextEncoder();

export const handlers = [
  // Handler for generateUploadSignature
  http.post('https://:apiHost/stores/:storeHash/v3/infrastructure/deployments/uploads', () =>
    HttpResponse.json({
      data: {
        upload_url: 'https://mock-upload-url.com',
        upload_uuid: '0e93ce5f-6f91-4236-87ec-ca79627f31ba',
      },
    }),
  ),

  // Handler for uploadBundleZip
  http.put('https://mock-upload-url.com', () => new HttpResponse(null, { status: 200 })),

  // Handler for createDeployment
  http.post('https://:apiHost/stores/:storeHash/v3/infrastructure/deployments', () =>
    HttpResponse.json({
      data: {
        deployment_uuid: '5b29c3c0-5f68-44fe-99e5-06492babf7be',
      },
    }),
  ),

  // Handler for createDomain
  http.post(
    'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains',
    async ({ request }) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const body = (await request.json()) as { domain: string };

      return HttpResponse.json(
        {
          data: {
            domain: body.domain,
            project_uuid: '6b202364-10f3-11f1-8bc7-fe9b9d8b14ab',
            verification_status: 'pending',
            // Only the create endpoint returns the records to publish.
            pointing_records: {
              a_record_value: '198.51.100.10',
              cname_record_value: 'shared.hosting.bigcommerce.com',
            },
          },
        },
        { status: 201 },
      );
    },
  ),

  // Handler for listDomains
  http.get(
    'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains',
    ({ params }) =>
      HttpResponse.json({
        data: [
          {
            domain: 'www.example.com',
            project_uuid: params.projectUuid,
            verification_status: 'pending',
          },
          {
            domain: 'shop.example.com',
            project_uuid: params.projectUuid,
            verification_status: 'verified',
          },
        ],
      }),
  ),

  // Handler for getDomain
  http.get(
    'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain',
    ({ params }) =>
      HttpResponse.json({
        data: {
          domain: params.domain,
          project_uuid: params.projectUuid,
          verification_status: 'verified',
        },
      }),
  ),

  // Handler for deleteDomain
  http.delete(
    'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain',
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Handler for claimDomain
  http.post(
    'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain/claim',
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Handler for transferDomain
  http.post(
    'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains/:domain/transfer',
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Handler for fetchProjects
  http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
    HttpResponse.json({
      data: [
        {
          uuid: 'a23f5785-fd99-4a94-9fb3-945551623923',
          name: 'Project One',
          deployment_hostnames: [
            'project-one.catalyst-sandbox.store',
            'vanity.project-one.example.com',
          ],
        },
        {
          uuid: 'b23f5785-fd99-4a94-9fb3-945551623924',
          name: 'Project Two',
          deployment_hostnames: [],
        },
      ],
    }),
  ),

  // Handler for getDeploymentStatus
  http.get(
    'https://:apiHost/stores/:storeHash/v3/infrastructure/deployments/:deploymentUuid/events',
    ({ params }) => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              `data: {"deployment_status":"in_progress","deployment_uuid":"${params.deploymentUuid}","event":{"step":"processing","progress":75},"deployment_hostnames":[]}`,
            ),
          );
          setTimeout(() => {
            controller.enqueue(
              encoder.encode(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `data: {"deployment_status":"in_progress","deployment_uuid":"${params.deploymentUuid}","event":{"step":"finalizing","progress":99},"deployment_hostnames":[]}`,
              ),
            );
          }, 10);
          setTimeout(() => {
            controller.enqueue(
              encoder.encode(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `data: {"deployment_status":"completed","deployment_uuid":"${params.deploymentUuid}","event":null,"deployment_hostnames":["example.com"]}`,
              ),
            );
            controller.close();
          }, 20);
        },
      });

      return new HttpResponse(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      });
    },
  ),

  // Handler for fetchStoreProfile (auth whoami)
  http.get('https://:apiHost/stores/:storeHash/v3/settings/store/profile', () =>
    HttpResponse.json({
      data: {
        store_name: 'Test Store',
      },
    }),
  ),

  // Handler for device code OAuth flow (auth login)
  http.post('https://login.bigcommerce.com/device/token', async ({ request }) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const body = (await request.json()) as Record<string, string>;

    // Poll request (has device_code) — return credentials
    if (body.device_code) {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        store_hash: 'mock-store-hash',
        context: 'stores/mock-store-hash',
        api_uri: 'https://api.bigcommerce.com',
      });
    }

    // Initial request (has scopes) — return device code
    return HttpResponse.json({
      device_code: 'mock-device-code',
      user_code: 'MOCK-CODE',
      verification_uri: 'https://login.bigcommerce.com/device',
      expires_in: 600,
      interval: 5,
    });
  }),

  // Handler for log tailing
  http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/logs/:projectUuid/tail', () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"uuid":"0f258256-0a83-4704-a456-03e99b4445c2","project_uuid":"6b202364-10f3-11f1-8bc7-fe9b9d8b14ab","request":{"method":"GET","url":"https://example.com/test","status_code":200},"logs":[{"timestamp":"2026-03-11T22:05:28.870Z","level":"info","messages":["hello world"]}],"exceptions":[],"timestamp":"2026-03-11T22:05:28.870Z"}\n\n',
          ),
        );
        setTimeout(() => controller.close(), 10);
      },
    });

    return new HttpResponse(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }),

  http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/logs/:projectUuid', () =>
    HttpResponse.json({
      data: [
        {
          id: '01HX9Z8K2J4P7Q6R3T5V8W0YN',
          timestamp: '2026-06-01T12:34:56.789Z',
          level: 'error',
          messages: ['Unhandled exception while rendering /cart'],
          is_exception: true,
          exception_name: 'TypeError',
          request: { method: 'GET', url: '/cart', status_code: 500 },
        },
      ],
      meta: {
        cursor_pagination: {
          has_next_page: false,
          has_prev_page: false,
          start_cursor: 'cursor_start',
          end_cursor: 'cursor_end',
        },
      },
    }),
  ),

  // Handle for createProjects
  http.post('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
    HttpResponse.json({
      data: {
        uuid: 'c23f5785-fd99-4a94-9fb3-945551623925',
        name: 'New Project',
        date_created: new Date().toISOString(),
        date_modified: new Date().toISOString(),
      },
    }),
  ),

  // Handler for deleteProject
  http.delete(
    'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid',
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Default handler for fetchAvailableChannels — returns two storefront
  // channels so the picker has something to render. Tests that need an
  // empty list or different channel shapes should override with `server.use(...)`.
  http.get('https://:apiHost/stores/:storeHash/v3/channels', () =>
    HttpResponse.json({
      data: [
        { id: 1, name: 'Default Storefront', platform: 'bigcommerce' },
        { id: 2, name: 'Catalyst Storefront', platform: 'catalyst' },
      ],
    }),
  ),

  // Default handler for checkChannelEligibility — eligible by default. Tests
  // covering the ineligible path should override with `server.use(...)`.
  http.get('https://:apiHost/stores/:storeHash/cli-api/v3/channels/catalyst/eligibility', () =>
    HttpResponse.json({ data: { eligible: true, message: 'Eligible.' } }),
  ),

  // Default handler for createChannel — returns a freshly-created Catalyst
  // channel with its storefront token and env vars.
  http.post('https://:apiHost/stores/:storeHash/cli-api/v3/channels/catalyst', () =>
    HttpResponse.json({
      data: {
        id: 42,
        storefront_api_token: 'new-sft-token',
        envVars: {
          BIGCOMMERCE_STORE_HASH: 'test-store',
          BIGCOMMERCE_CHANNEL_ID: '42',
          BIGCOMMERCE_STOREFRONT_TOKEN: 'new-sft-token',
        },
      },
    }),
  ),

  // Default handler for getAvailableLocales — the channel-creation flow reads
  // this to populate the language pickers.
  http.get('https://:apiHost/stores/:storeHash/v3/settings/store/available-locales', () =>
    HttpResponse.json({
      data: [
        { id: 'en', name: 'English', fallback: null, is_supported: true },
        { id: 'es', name: 'Spanish', fallback: null, is_supported: true },
        { id: 'fr', name: 'French', fallback: null, is_supported: true },
      ],
    }),
  ),

  // Default handler for updateChannelSiteUrl — succeeds with a generic
  // payload. Tests that need to assert error handling should override.
  http.put('https://:apiHost/stores/:storeHash/v3/channels/:channelId/site', () =>
    HttpResponse.json({
      data: { id: 1, url: 'https://example.com', channel_id: 1 },
    }),
  ),

  // Default handler for the npm registry — 404 so the stale-CLI check stays
  // silent by default. Tests that assert on it override with a version payload.
  http.get('https://registry.npmjs.org/:scope/:name/latest', () =>
    HttpResponse.json({ error: 'Not found' }, { status: 404 }),
  ),
];
