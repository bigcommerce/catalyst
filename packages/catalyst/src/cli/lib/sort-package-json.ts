// Canonical order for top-level fields in core/package.json. Anything not in
// this list is appended afterwards in its original position relative to other
// unknown keys, so we don't drop or reshuffle uncommon fields like `keywords`.
const FIELD_ORDER = [
  'name',
  'description',
  'version',
  'private',
  'engines',
  'scripts',
  'dependencies',
  'devDependencies',
] as const;

export function sortPackageJsonFields<T extends Record<string, unknown>>(pkg: T): T {
  const ordered: Record<string, unknown> = {};

  FIELD_ORDER.forEach((field) => {
    if (field in pkg) {
      ordered[field] = pkg[field];
    }
  });

  Object.keys(pkg).forEach((key) => {
    if (!(key in ordered)) {
      ordered[key] = pkg[key];
    }
  });

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return ordered as T;
}
