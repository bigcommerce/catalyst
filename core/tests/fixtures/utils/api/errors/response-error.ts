export class TestApiClientResponseError extends Error {
  readonly name = 'TestApiClientResponseError';

  constructor(request: Request, response: Response, responseText?: string) {
    const { method, url } = request;
    const { pathname } = new URL(url);
    const { status, statusText } = response;

    const message = `
    BigCommerce API returned ${status}
    ${method} '${pathname}' failed with ${status} ${statusText}
    ${responseText}
    `;

    super(message);
  }

  static async create(request: Request, response: Response) {
    try {
      let errorResponse: string;

      const contentType = response.headers.get('content-type');

      if (contentType && ['application/json', 'application/json+problem'].includes(contentType)) {
        const data: unknown = await response.json();

        errorResponse = JSON.stringify(data, null, 2);
      }

      errorResponse = await response.text();

      return new TestApiClientResponseError(request, response, errorResponse);
    } catch {
      return new TestApiClientResponseError(request, response);
    }
  }
}
