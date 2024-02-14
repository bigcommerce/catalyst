import { getRelatedProducts } from '~/client/queries/get-related-products';
import { ProductCardCarousel } from '~/components/product-card-carousel';

export const RelatedProducts = async ({ productId }: { productId: number }) => {
  const relatedProducts = await getRelatedProducts({
    productId,
    imageWidth: 500,
    imageHeight: 500,
  });

  return <ProductCardCarousel products={relatedProducts} title="Related Products" />;
};
