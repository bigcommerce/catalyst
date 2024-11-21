import 'server-only';

import { Streamable } from './streamable';

export function mapStreamable<T, U>(
  streamable: Streamable<T>,
  mapper: (value: T) => U,
): Streamable<U> {
  return streamable instanceof Promise ? streamable.then(mapper) : mapper(streamable);
}
