import { BigCommerceGQLError, GQLError, GQLErrorCode } from './gql-error';

export class BigCommerceAuthError extends BigCommerceGQLError {
  readonly code: GQLErrorCode;

  constructor(
    errorCode: GQLErrorCode,
    public errors: GQLError[] = [],
  ) {
    super(errors);

    this.name = 'BigCommerceAuthError';
    this.code = errorCode;
  }
}
