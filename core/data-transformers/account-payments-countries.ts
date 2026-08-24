interface GqlState {
  abbreviation: string;
  name: string;
}

interface GqlCountry {
  code: string;
  name: string;
  statesOrProvinces: GqlState[];
}

// This function converts the GraphQL country data into the format expected by the account payments microapp.
export function toAccountPaymentsMicroappCountries(countries: GqlCountry[]) {
  return countries.map((country) => ({
    code: country.code,
    label: country.name,
    value: country.code,
    states: country.statesOrProvinces.map((state) => ({
      code: state.abbreviation,
      name: state.name,
      value: state.abbreviation,
    })),
  }));
}
