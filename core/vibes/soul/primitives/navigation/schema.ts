import { z } from 'zod';

export const localeSchema = z.object({
  id: z.string(),
});

export const searchSchema = (searchParamName: string) =>
  z.object({
    [searchParamName]: z.string(),
  });
