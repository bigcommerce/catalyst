import { graphql, ResultOf } from '~/client/graphql';
import { ProductCard as ComponentProductCard } from '~/components/ui/product-card';

import { Pricing, PricingFragment } from '../pricing';

import { AddToCart } from './add-to-cart';
import { AddToCartFragment } from './add-to-cart/fragment';

export const ProductCardFragment = graphql(
  `
    fragment ProductCardFragment on Product {
      entityId
      name
      defaultImage {
        altText
        url: urlTemplate
      }
      path
      brand {
        name
        path
      }
      reviewSummary {
        numberOfReviews
        averageRating
      }
      ...AddToCartFragment
      ...PricingFragment
    }
  `,
  [AddToCartFragment, PricingFragment],
);

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
  const { name, entityId, defaultImage, brand, path } = product;

  return (
    <ComponentProductCard
      addToCart={showCart && <AddToCart data={product} />}
      brand={brand?.name}
      image={defaultImage}
      imagePriority={imagePriority}
      imageSize={imageSize}
      link={path}
      price={<Pricing data={product} />}
      productId={entityId}
      showCompare={showCompare}
      title={name}
    />
  );
};
