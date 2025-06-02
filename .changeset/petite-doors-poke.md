---
"@bigcommerce/catalyst-core": minor
---

## New

This refactor optimizes compare for caching and the eventual use of dynamicIO.

## Key modifications include:

- Our query functions now take in all params required for fetching, instead of accessing dynamic variables internally. This is important to serialize arguments if we want to eventually `use cache`.
- Use `Streamable.from` to generate our streaming props that are passed to our UI components.

## Migration instructions:

- Updated `/app/[locale]/(default)/compare/page.tsx` to use `Streamable.from` pattern.
- Renamed `getCompareData` query to `getComparedProducts`.
  - Updated query
  - Returns empty `[]` if no product ids are passed
