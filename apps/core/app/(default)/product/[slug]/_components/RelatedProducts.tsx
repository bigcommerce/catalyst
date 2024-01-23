import { OptionValueId } from '~/client/generated/graphql';
import { getRelatedProducts } from '~/client/queries/getRelatedProducts';
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
