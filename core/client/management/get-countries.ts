import { z } from 'zod';

import { client } from '..';

const CountriesListSchema = z.array(
  z.object({
    id: z.number().min(1),
    country: z.string().min(1),
    country_iso2: z.string(),
    country_iso3: z.string(),
    states: z.object({
      url: z.string(),
      resource: z.string(),
    }),
  }),
);

// List of available countries
export const getCountries = async () => {
  const response = await client.fetchAvailableCountries();
  const parsedResponse = CountriesListSchema.safeParse(response);

  if (parsedResponse.success) {
    return parsedResponse.data;
  }

  throw new Error('Unable to get data on Countries: Invalid response');
};
