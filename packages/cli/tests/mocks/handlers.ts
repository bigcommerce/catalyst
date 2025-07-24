import { http, HttpResponse } from 'msw';

const encoder = new TextEncoder();

export const handlers = [
  // Handler for generateUploadSignature
  http.post('https://:apiHost/stores/:storeHash/v3/headless/deployments/uploads', () =>
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
  http.post('https://:apiHost/stores/:storeHash/v3/headless/deployments', () =>
    HttpResponse.json({
      data: {
        deployment_uuid: '5b29c3c0-5f68-44fe-99e5-06492babf7be',
      },
    }),
  ),

  // Handler for fetchProjects
  http.get('https://:apiHost/stores/:storeHash/v3/headless/projects', () =>
    HttpResponse.json({
      data: [
        { uuid: 'a23f5785-fd99-4a94-9fb3-945551623923', name: 'Project One' },
        { uuid: 'b23f5785-fd99-4a94-9fb3-945551623924', name: 'Project Two' },
      ],
    }),
  ),

  // Handler for getDeploymentStatus
  http.get(
    'https://:apiHost/stores/:storeHash/v3/headless/deployments/:deploymentUuid',
    ({ params }) => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              `{"data": {"deployment_status":"IN_PROGRESS","deployment_uuid":"${params.deploymentUuid}","event":{"step":"PROCESSING","progress":75},"error":null}}\n\n`,
            ),
          );
          setTimeout(() => {
            controller.enqueue(
              encoder.encode(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `{"data": {"deployment_status":"IN_PROGRESS","deployment_uuid":"${params.deploymentUuid}","event":{"step":"FINALIZING","progress":99},"error":null}}\n\n`,
              ),
            );
          }, 100);
          setTimeout(() => {
            controller.enqueue(
              encoder.encode(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `{"data": {"deployment_status":"COMPLETED","deployment_uuid":"${params.deploymentUuid}","event":null,"error":null}}\n\n`,
              ),
            );
            controller.close();
          }, 200);
        },
      });

      return new HttpResponse(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      });
    },
  ),
];
