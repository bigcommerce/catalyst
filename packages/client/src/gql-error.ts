export enum GQLErrorCode {
  INVALID_CAT = 'INVALID_CUSTOMER_ACCESS_TOKEN',
  MISSING_CAT = 'MISSING_CUSTOMER_ACCESS_TOKEN',
}

export interface GQLError {
  message: string;
  path: string[];
  locations: Array<{ line: number; column: number }>;
  extensions?: {
    [key: string]: unknown;
    code?: GQLErrorCode;
  };
}

export class BigCommerceGQLError extends Error {
  constructor(public errors: GQLError[] = []) {
    const message = errors.map((error) => JSON.stringify(error, null, 2)).join('\n');

    super(message);
    this.name = 'BigCommerceGQLError';
  }
}
