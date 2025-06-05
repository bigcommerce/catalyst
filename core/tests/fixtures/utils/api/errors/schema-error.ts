import { z } from 'zod';

import { TestApiClientError } from './error';

export class TestApiClientSchemaError extends TestApiClientError {
  constructor(path: string, method: string, zodError: z.ZodError) {
    super(path, method);

    this.name = 'TestApiClientSchemaError';
    this.message = `${method} '${path}' had a successful response, but the zod schema failed to parse it:\n${this.printError(zodError.message)}`;
  }
}
