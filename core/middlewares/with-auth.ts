import { auth, signIn } from '~/auth';

import { type MiddlewareFactory } from './compose-middlewares';

export const withAuth: MiddlewareFactory = (next) => {
  return async (request, event) => {
    // @ts-expect-error: The `auth` function doesn't have the correct type to support it as a MiddlewareFactory.
    const authWithCallback = auth(async (req) => {
      if (!req.auth) {
        await signIn('anonymous', { redirect: false });

        return next(req, event);
      }

      // Continue the middleware chain
      return next(req, event);
    });

    // @ts-expect-error: The `auth` function doesn't have the correct type to support it as a MiddlewareFactory.
    return authWithCallback(request, event);
  };
};
