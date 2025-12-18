import { type NextProxy, NextResponse } from 'next/server';

export type MiddlewareFactory = (middleware: NextProxy) => NextProxy;

export const composeMiddlewares = (
  firstMiddlewareWrapper: MiddlewareFactory,
  ...otherMiddlewareWrappers: MiddlewareFactory[]
): NextProxy => {
  const middlewares = otherMiddlewareWrappers.reduce(
    (accumulatedMiddlewares, nextMiddleware) => (middleware) =>
      accumulatedMiddlewares(nextMiddleware(middleware)),
    firstMiddlewareWrapper,
  );

  return middlewares(() => {
    return NextResponse.next();
  });
};
