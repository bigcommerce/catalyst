import { TestApiClientError } from './error';

export class TestApiClientResponseError extends TestApiClientError {
  constructor(
    path: string,
    method: string,
    status: number,
    statusText: string,
    responseText: string,
  ) {
    super(path, method);

    this.name = 'TestApiClientResponseError';
    this.message = `${method} '${path}' failed with ${status} ${statusText}\n${this.printError(responseText)}`;
  }
}
