import { z } from 'zod';

export const compareAddToCartFormDataSchema = z.object({
  id: z.string(),
});
