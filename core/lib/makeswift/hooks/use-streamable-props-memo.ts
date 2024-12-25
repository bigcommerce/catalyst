import { type ReactElement, useMemo } from 'react';

interface Options {
  maxDepth?: number;
}

function isReactElement(value: object): value is ReactElement {
  return '$$typeof' in value && typeof value.$$typeof === 'symbol';
}

function streamablePropsMemoProxy<T extends object>(props: T, { maxDepth = 2 }: Options = {}): T {
  if (maxDepth <= 0) return props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolvedProps: Record<string | symbol, any> = {};

  const proxyHandler: ProxyHandler<T> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(target: T, prop: string | symbol): any {
      if (!(prop in target)) {
        return undefined;
      }

      if (prop in resolvedProps) {
        return resolvedProps[prop];
      }

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const targetProp = prop in target ? target[prop as keyof T] : undefined;

      if (targetProp == null) {
        return targetProp;
      }

      if (targetProp instanceof Promise) {
        return new Promise((resolve, reject) => {
          Promise.resolve(targetProp)
            .then((value) => {
              resolve(
                (resolvedProps[prop] =
                  typeof value !== 'object' || value == null
                    ? value
                    : streamablePropsMemoProxy(value, { maxDepth: maxDepth - 1 })),
              );
            })
            .catch((error: unknown) =>
              reject(error instanceof Error ? error : new Error(String(error))),
            );
        });
      }

      if (typeof targetProp !== 'object' || isReactElement(targetProp)) return targetProp;

      return (resolvedProps[prop] = streamablePropsMemoProxy(targetProp, {
        maxDepth: maxDepth - 1,
      }));
    },
  };

  return new Proxy<T>(props, proxyHandler);
}

export const useStreamablePropsMemo = <T extends object>(props: T, { maxDepth }: Options = {}) =>
  useMemo(
    (): T => streamablePropsMemoProxy(props, { maxDepth }),
    // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/no-unsafe-assignment
    [...Object.entries(props).flatMap((e) => e), maxDepth],
  );
