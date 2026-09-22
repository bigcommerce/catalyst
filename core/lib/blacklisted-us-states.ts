// These US states share the same abbreviation (AE), which causes issues:
// 1. The shipping API uses abbreviations, so it can't distinguish between them
// 2. Selectors keyed by that abbreviation get duplicate `value`s, causing duplicate key warnings
export const blacklistedUSStates = new Set([
  'Armed Forces Africa',
  'Armed Forces Canada',
  'Armed Forces Middle East',
]);
