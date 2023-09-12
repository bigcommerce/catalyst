import { OptionValueId, Product } from '@bigcommerce/catalyst-client';
import { PartialDeep } from 'type-fest';

import client from '~/client';
import { ProductCardCarousel } from '~/components/ProductCardCarousel';

export const RelatedProducts = async ({
  productId,
  optionValueIds,
}: {
  productId: number;
  optionValueIds: OptionValueId[];
}) => {
  const relatedProducts = await client.getRelatedProducts({ productId, optionValueIds });

  if (!relatedProducts || !relatedProducts.length) {
    return null;
  }

  const groupedRelatedProducts = relatedProducts.reduce<Array<Array<PartialDeep<Product>>>>(
    (batches, _, index) => {
      if (index % 4 === 0) {
        batches.push([]);
      }

      const product = relatedProducts[index];

      if (batches[batches.length - 1] && product) {
        batches[batches.length - 1]?.push(product);
      }

      return batches;
    },
    [],
  );

  return <ProductCardCarousel groupedProducts={groupedRelatedProducts} title="Related Products" />;
};
