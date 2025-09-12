import { z } from 'zod';

export const CustomerGroupsSchema = z.nullable(
  z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .array(),
);

export type CustomerGroupsType = z.infer<typeof CustomerGroupsSchema>;

export const CustomerGroupSchema = z.object({
  customer: z
    .object({
      customerGroupId: z.number(),
    })
    .nullable(),
});
