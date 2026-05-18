import { useFormatter } from 'next-intl';

import { ResultOf } from '~/client/graphql';
import { ProductCard as ComponentProductCard } from '~/components/ui/product-card';
import { PromotionCalloutList } from '~/components/ui/promotion-callout';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { AddToCart } from './add-to-cart';
import { ProductCardFragment } from './fragment';

interface Props {
  product: ResultOf<typeof ProductCardFragment>;
  imageSize?: 'tall' | 'wide' | 'square';
  imagePriority?: boolean;
  showCompare?: boolean;
  showCart?: boolean;
}

export const ProductCard = ({
  product,
  imageSize = 'square',
  imagePriority = false,
  showCart = true,
  showCompare = true,
}: Props) => {
  const format = useFormatter();

  const { name, entityId, defaultImage, brand, path, prices, featuredPromotions } = product;

  const price = pricesTransformer(prices, format);

  return (
    <ComponentProductCard
      addToCart={showCart && <AddToCart data={product} />}
      href={path}
      id={entityId.toString()}
      image={defaultImage ? { src: defaultImage.url, altText: defaultImage.altText } : undefined}
      imagePriority={imagePriority}
      imageSize={imageSize}
      name={name}
      price={price}
      promotionCallout={
        featuredPromotions.length > 0 ? (
          <PromotionCalloutList callouts={featuredPromotions} className="mt-1" variant="compact" />
        ) : undefined
      }
      showCompare={showCompare}
      subtitle={brand?.name}
    />
  );
};
