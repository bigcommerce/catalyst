import { useFormatter } from 'next-intl';
import { useCallback } from 'react';
import { string, z } from 'zod';

interface Category {
  id: string;
  name: string;
  image?: string;
  productCount: number;
  path: string;
}

export const BcCategorySchema = z.object({
  category_id: z.number(),
  name: z.string(),
  image_url: z.string().optional(),
  url: z.object({
    path: z.string(),
  }),
});

export type BcCategorySchema = z.infer<typeof BcCategorySchema>;

export function useBcCategoryToVibesCategory(): (category: BcCategorySchema) => Category {
  const format = useFormatter();

  return useCallback(
    (category) => {
      const { category_id, image_url, name, url } = category;

      return {
        id: category_id.toString(),
        name,
        image: image_url,
        productCount: 0,
        path: url.path,
      };
    },
    [format],
  );
}
