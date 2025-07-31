import { http, HttpResponse } from 'msw';

export const handlers = [
  // Handler for generateUploadSignature
  http.post('https://:apiHost/stores/:storeHash/v3/headless/deployments/uploads', () =>
    HttpResponse.json({
      data: {
        upload_url: 'https://mock-upload-url.com',
        upload_uuid: 'mock-uuid',
      },
    }),
  ),

  // Handler for uploadBundleZip
  http.put('https://mock-upload-url.com', () => new HttpResponse(null, { status: 200 })),
];
