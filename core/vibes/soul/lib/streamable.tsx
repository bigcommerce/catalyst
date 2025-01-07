import { Suspense, use } from 'react';

export type Streamable<T> = T | Promise<T>;

export function all<T extends readonly unknown[] | []>(
  streamables: T,
): Streamable<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
  return streamables.some((streamable) => streamable instanceof Promise)
    ? Promise.all(streamables)
    : // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      (streamables as { -readonly [P in keyof T]: Awaited<T[P]> });
}

export function useStreamable<T>(streamable: Streamable<T>): T {
  return streamable instanceof Promise ? use(streamable) : streamable;
}

function UseStreamable<T>({
  value,
  children,
}: {
  value: Streamable<T>;
  children: (value: T) => React.ReactNode;
}) {
  return children(useStreamable(value));
}

export function Stream<T>({
  value,
  fallback,
  children,
}: {
  value: Streamable<T>;
  fallback?: React.ReactNode;
  children: (value: T) => React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      <UseStreamable value={value}>{children}</UseStreamable>
    </Suspense>
  );
}
