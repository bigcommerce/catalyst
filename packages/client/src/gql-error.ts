interface GQLError {
  message: string;
  path: string[];
  locations: Array<{ line: number; column: number }>;
}

export class BigCommerceGQLError extends Error {
  constructor(public errors: GQLError[] = []) {
    const message = 'GQL errors on the response';

    super(message);
    this.name = 'BigCommerceGQLError';
  }

  static createFromResult(result: unknown) {
    try {
      assertIsGQLErrorResponse(result);

      return new BigCommerceGQLError(result);
    } catch {
      return new BigCommerceGQLError([{ message: 'Unknown error', path: [], locations: [] }]);
    }
  }
}

function assertIsGQLErrorResponse(value: unknown): asserts value is GQLError[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected maybeError to be an array');
  }

  if (value.some((error) => typeof error !== 'object' || error === null)) {
    throw new Error('Expected maybeError to be an array of objects');
  }

  if (value.some((error) => !('message' in error))) {
    throw new Error('Expected maybeError to have a message property');
  }
}
