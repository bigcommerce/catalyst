export function exists<T>(value: T | null | undefined): value is T {
  return value != null;
}
