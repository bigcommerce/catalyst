'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useEffect } from 'react';

import { FragmentOf } from '~/client/graphql';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { bodl } from '~/lib/bodl';

import { getCategoryPageData } from '../page-data';

type Category = Awaited<ReturnType<typeof getCategoryPageData>>['category'];
type productSearchItem = FragmentOf<typeof ProductCardFragment>;

interface Props {
  categoryId: number;
  category: Category;
  products: productSearchItem[];
}

const productItemTransform = (p: productSearchItem, c: Category) => {
  const breadcrumbs = c ? removeEdgesAndNodes(c.breadcrumbs) : [];

  return {
    product_id: p.entityId.toString(),
    product_name: p.name,
    brand_name: p.brand?.name,
    sale_price: p.prices?.salePrice?.value,
    purchase_price: p.prices?.salePrice?.value || p.prices?.price.value || 0,
    base_price: p.prices?.price.value,
    retail_price: p.prices?.retailPrice?.value,
    currency: p.prices?.price.currencyCode || 'USD',
    category_names: breadcrumbs.map(({ name }) => name),
  };
};

export const CategoryViewed = ({ categoryId, category, products }: Props) => {
  useEffect(() => {
    bodl.navigation.categoryViewed({
      category_id: categoryId,
      category_name: category?.name ?? '',
      line_items: products.map((p) => productItemTransform(p, category)),
    });
  }, [category, categoryId, products]);

  return null;
};
