import { z } from 'zod';

import { client } from '..';

const ShippingZonesSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    type: z.string(),
    locations: z.array(
      z.object({ id: z.number(), country_iso2: z.string(), zip: z.string().optional() }),
    ),
    free_shipping: z.object({
      enabled: z.boolean(),
      minimum_sub_total: z.string(),
      exclude_fixed_shipping_products: z.boolean(),
    }),
    enabled: z.boolean(),
  }),
);

// List of shipping zones for Store
export const getShippingZones = async () => {
  const response = await client.fetchShippingZones();
  const parsedResponse = ShippingZonesSchema.safeParse(response);

  if (parsedResponse.success) {
    return parsedResponse.data;
  }

  throw new Error('Unable to get data on Shipping Zones: Invalid response');
};
