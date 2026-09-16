interface GqlState {
  abbreviation: string;
  name: string;
}

interface GqlCountry {
  code: string;
  name: string;
  statesOrProvinces: GqlState[];
}

// These US states share the same abbreviation (AE), which causes issues:
// 1. The shipping API uses abbreviations, so it can't distinguish between them
// 2. The microapp's state selector requires unique `value`s, causing duplicate key warnings
// Same blacklist as `app/[locale]/(default)/cart/page.tsx`.
const blacklistedUSStates = new Set([
  'Armed Forces Africa',
  'Armed Forces Canada',
  'Armed Forces Middle East',
]);

// This function converts the GraphQL country data into the format expected by the account payments microapp.
export function toAccountPaymentsMicroappCountries(countries: GqlCountry[]) {
  return countries.map((country) => ({
    code: country.code,
    label: country.name,
    value: country.code,
    states: country.statesOrProvinces
      .filter((state) => country.code !== 'US' || !blacklistedUSStates.has(state.name))
      .map((state) => ({
        code: state.abbreviation,
        name: state.name,
        value: state.abbreviation,
      })),
  }));
}
