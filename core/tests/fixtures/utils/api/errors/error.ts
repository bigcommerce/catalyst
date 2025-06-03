type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ErrorInfo {
  status: number;
  statusText: string;
  responseText: string;
}

interface ErrorConstructor {
  path: string;
  method: RequestMethod;
  message: ErrorInfo | string;
}

export class TestApiClientError extends Error {
  constructor({ path, method, message }: ErrorConstructor) {
    super();

    this.name = 'TestApiClientError';

    if (typeof message === 'string') {
      this.message = `${method} '${path}' failed: ${message}`;
    } else {
      const { status, statusText, responseText } = message;

      this.message = `${method} '${path}' failed with ${status} ${statusText}\n${this.printError(responseText)}`;
    }
  }

  private printError(body: string): string {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }
}
