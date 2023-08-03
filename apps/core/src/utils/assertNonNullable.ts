export function assertNonNullable<T>(value: T): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error('Expected value to be non-nullable');
  }
}
