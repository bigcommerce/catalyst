import { FragmentOf } from 'gql.tada';
import { useFormatter } from 'next-intl';

import { CardProduct } from '@/vibes/soul/primitives/product-card';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { MakeswiftProductFragment } from './fragment';

export function useBcProductToVibesProduct(): (
  product: FragmentOf<typeof MakeswiftProductFragment>,
) => CardProduct {
  const format = useFormatter();

  return (product) => {
    const { entityId, name, defaultImage, brand, path, prices } = product;
    const price = pricesTransformer(prices, format);

    return {
      id: entityId.toString(),
      title: name,
      href: path,
      image: defaultImage ? { src: defaultImage.url, alt: defaultImage.altText } : undefined,
      price,
      subtitle: brand?.name,
    };
  };
}
