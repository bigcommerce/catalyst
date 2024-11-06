import { z } from 'zod';

export const schema = z.discriminatedUnion('intent', [
  z.object({
    intent: z.literal('increment'),
    id: z.string(),
    quantity: z.number().min(0),
  }),
  z.object({
    intent: z.literal('decrement'),
    id: z.string(),
    quantity: z.number().min(0),
  }),
  z.object({
    intent: z.literal('delete'),
    id: z.string(),
  }),
]);
