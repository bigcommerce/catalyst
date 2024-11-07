import { z } from 'zod'

export const schema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  company: z.string().optional(),
  street1: z.string(),
  street2: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  country: z.string(),
})
