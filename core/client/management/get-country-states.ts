import { z } from 'zod';

import { client } from '..';

const CountryStatesSchema = z.array(
  z.object({
    id: z.number().min(1),
    state: z.string().min(1),
    state_abbreviation: z.string(),
    country_id: z.number(),
  }),
);

// List of States or Provinces for Country
export const getCountryStates = async (countryId: number) => {
  const response = await client.fetchCountryStates(countryId);
  const parsedResponse = CountryStatesSchema.safeParse(response);

  if (parsedResponse.success) {
    return parsedResponse.data;
  }

  throw new Error('Unable to get data on Provinces/States: Invalid response');
};
