import { OptionValueId } from '@bigcommerce/catalyst-client';

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

  if (!relatedProducts) {
    return null;
  }

  return <ProductCardCarousel products={relatedProducts} title="Related Products" />;
};
