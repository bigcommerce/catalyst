import { OptionValueId } from '../../../../../clients/old';

import { getRelatedProducts } from '~/clients/new/queries/getRelatedProducts';
import { ProductCardCarousel } from '~/components/ProductCardCarousel';

export const RelatedProducts = async ({
  productId,
  optionValueIds,
}: {
  productId: number;
  optionValueIds: OptionValueId[];
}) => {
  const relatedProducts = await getRelatedProducts({
    productId,
    optionValueIds,
    imageWidth: 500,
    imageHeight: 500,
  });

  return <ProductCardCarousel products={relatedProducts} title="Related Products" />;
};
