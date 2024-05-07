import { auth } from '~/auth';

import { type MiddlewareFactory } from './compose-middlewares';

// The `auth` function doesn't have the correct type to support it as a MiddlewareFactory.
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const withAuth: MiddlewareFactory = auth as unknown as MiddlewareFactory;
