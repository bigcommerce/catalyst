import { http, HttpResponse } from 'msw';

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
];
