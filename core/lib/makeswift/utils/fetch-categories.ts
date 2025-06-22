import { useMemo } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

import {
  useBcCategoryToVibesCategory,
  BcCategorySchema,
} from './use-bc-category-to-vibes-category/use-bc-category-to-vibes-category';

const CategoryListSchema = z.object({
  categories: z.array(BcCategorySchema),
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());
//.then(CategoryListSchema.parse);

interface Props {
  categoryIds: string[];
}

export function useCategoriesByIds({ categoryIds }: Props) {
  const bcCategoryToVibesCategory = useBcCategoryToVibesCategory();

  const searchParams = new URLSearchParams();

  searchParams.append('ids', categoryIds.join(','));

  const categoryByIdsUrl = `/api/categories/ids?${searchParams.toString()}`;

  const { data, isLoading } = useSWR(categoryIds.length ? categoryByIdsUrl : null, fetcher);

  console.log('useCategoriesByIds data', data);

  const combinedCategories = useMemo(() => [...(data?.categories ?? [])], [data]);

  const categories = useMemo(
    () => (isLoading ? null : combinedCategories.map(bcCategoryToVibesCategory)),
    [isLoading, combinedCategories, bcCategoryToVibesCategory],
  );

  return { categories, isLoading };
}
