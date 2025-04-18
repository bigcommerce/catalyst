import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    company: z.string().optional(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    stateOrProvince: z.string().optional(),
    postalCode: z.string().optional(),
    phone: z.string().optional(),
    countryCode: z.string(),
  })
  .passthrough();
