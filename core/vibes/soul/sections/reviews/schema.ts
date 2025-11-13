import { z } from 'zod';

export const schema = z.object({
  productEntityId: z.number(),
  title: z.string().min(1),
  author: z.string().min(1),
  email: z.string().email(),
  text: z.string().min(1),
  rating: z.number().min(1).max(5),
});
