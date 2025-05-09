import { BigCommerceAuthError } from './gql-auth-error';
import { GQLError, GQLErrorCode } from './gql-error';

export class InvalidCustomerAccessTokenError extends BigCommerceAuthError {
  constructor(public errors: GQLError[] = []) {
    super(GQLErrorCode.INVALID_CAT, errors);

    this.name = 'InvalidCustomerAccessTokenError';
  }
}
