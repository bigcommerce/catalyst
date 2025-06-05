import { TestApiClientError } from './error';

export class TestApiClientBodyParseError extends TestApiClientError {
  constructor(path: string, method: string, responseText: string) {
    super(path, method);

    this.name = 'TestApiClientBodyParseError';
    this.message = `${method} '${path}' failed to parse the response as JSON:\n${this.printError(responseText)}`;
  }
}
