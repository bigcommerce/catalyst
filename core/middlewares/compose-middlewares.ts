import { type NextMiddleware, NextResponse } from 'next/server';

export type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware;

export const composeMiddlewares = (
  firstMiddlewareWrapper: MiddlewareFactory,
  ...otherMiddlewareWrappers: MiddlewareFactory[]
  // eslint-disable-next-line @typescript-eslint/no-deprecated
): NextMiddleware => {
  const middlewares = otherMiddlewareWrappers.reduce(
    (accumulatedMiddlewares, nextMiddleware) => (middleware) =>
      accumulatedMiddlewares(nextMiddleware(middleware)),
    firstMiddlewareWrapper,
  );

  return middlewares(() => {
    return NextResponse.next();
  });
};
