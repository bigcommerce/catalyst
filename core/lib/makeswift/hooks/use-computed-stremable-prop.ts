import { useMemo } from 'react';

import { type Streamable } from '@/vibes/soul/lib/streamable';

export const computedStremableProp = <T>(
  prop: Streamable<T>,
  computation: (prop: NonNullable<T>) => NonNullable<T>,
): Streamable<T> => {
  if (prop == null) return prop;

  if (prop instanceof Promise) {
    return new Promise((resolve, reject) => {
      Promise.resolve(prop)
        .then((resolvedProp) => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          resolve(resolvedProp == null ? resolvedProp : computation(resolvedProp));
        })
        .catch((error: unknown) =>
          reject(error instanceof Error ? error : new Error(String(error))),
        );
    });
  }

  return computation(prop);
};

export const useComputedStremableProp = <T>(
  prop: Streamable<T>,
  computation: (prop: NonNullable<T>) => NonNullable<T>,
) => useMemo((): Streamable<T> => computedStremableProp(prop, computation), [prop, computation]);
