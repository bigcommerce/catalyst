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

  // Handler for fetchProjects
  http.get('https://:apiHost/stores/:storeHash/v3/infrastructure/projects', () =>
    HttpResponse.json({
      data: [
        {
          uuid: 'a23f5785-fd99-4a94-9fb3-945551623923',
          name: 'Project One',
          deployed_url: 'https://project-one.catalyst-sandbox.store',
        },
        {
          uuid: 'b23f5785-fd99-4a94-9fb3-945551623924',
          name: 'Project Two',
          deployed_url: null,
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
              `data: {"deployment_status":"in_progress","deployment_uuid":"${params.deploymentUuid}","event":{"step":"processing","progress":75},"deployment_url":null}`,
            ),
          );
          setTimeout(() => {
            controller.enqueue(
              encoder.encode(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `data: {"deployment_status":"in_progress","deployment_uuid":"${params.deploymentUuid}","event":{"step":"finalizing","progress":99},"deployment_url":null}`,
              ),
            );
          }, 10);
          setTimeout(() => {
            controller.enqueue(
              encoder.encode(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `data: {"deployment_status":"completed","deployment_uuid":"${params.deploymentUuid}","event":null,"deployment_url":"https://example.com"}`,
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
];
