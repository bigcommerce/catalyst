import { use } from 'react';

export type Streamable<T> = T | Promise<T>;

export function useStreamable<T>(streamable: Streamable<T>): T {
  return streamable instanceof Promise ? use(streamable) : streamable;
}
