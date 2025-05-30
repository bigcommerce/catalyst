import { BigCommerceGQLError, GQLError, GQLErrorCode } from '../gql-error';
import { InvalidCustomerAccessTokenError } from '../invalid-cat-error';
import { MissingCustomerAccessTokenError } from '../missing-cat-error';

export function parseGraphQLError(result: unknown) {
  try {
    assertIsGQLErrorResponse(result);

    const extendedError = result.find((error) => error.extensions && 'code' in error.extensions);

    if (extendedError) {
      switch (extendedError.extensions?.code) {
        case GQLErrorCode.MISSING_CAT:
          return new MissingCustomerAccessTokenError(result);

        case GQLErrorCode.INVALID_CAT:
          return new InvalidCustomerAccessTokenError(result);
      }
    }

    return new BigCommerceGQLError(result);
  } catch {
    return new BigCommerceGQLError([{ message: 'Unknown error', path: [], locations: [] }]);
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
