import { BigCommerceAuthError } from './gql-auth-error';
import { GQLError, GQLErrorCode } from './gql-error';

export class MissingCustomerAccessTokenError extends BigCommerceAuthError {
  constructor(public errors: GQLError[] = []) {
    super(GQLErrorCode.MISSING_CAT, errors);

    this.name = 'MissingCustomerAccessTokenError';
  }
}
