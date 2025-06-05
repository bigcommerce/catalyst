export class TestApiClientError extends Error {
  path: string;
  method: string;

  constructor(path: string, method: string) {
    super();

    this.name = 'TestApiClientError';
    this.path = path;
    this.method = method;
    this.message = `${method} '${path}' failed with an unexpected error.`;
  }

  protected printError(body: string): string {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }
}
