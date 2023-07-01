import { Number, Select, Style } from '@makeswift/runtime/controls';
import { ReactRuntime } from '@makeswift/runtime/react';

import { useBcContext } from 'lib/context';

import { ProductCards, ProductCardsProps } from './ProductCards';
import { runtime } from 'lib/runtime';

interface WrapperProps {
  className?: string;
  type: 'bestSelling' | 'featured';
  count: number;
}

type Cards = ProductCardsProps['cards'];

const ProductCardsWrapper = ({ className, type, count }: WrapperProps) => {
  const { featuredProducts, bestSellingProducts } = useBcContext();

  const products = type === 'featured' ? featuredProducts : bestSellingProducts;
  const slicedProducts = products.slice(0, count);

  const cards: Cards = slicedProducts.map((product) => {
    return {
      name: product.name,
      imageSrc: {
        url: product.defaultImage?.url ?? '',
        dimensions: {
          width: 300,
          height: 300,
        },
      },
      imageAlt: product.name,
      link: {
        href: `/product/${product.entityId}`,
      },
      price: product.price?.value,
      hasBadge: false,
    };
  });

  return <ProductCards cards={cards} className={className} />;
};

runtime.registerComponent(ProductCardsWrapper, {
  type: 'product-cards',
  label: 'Product Cards',
  props: {
    className: Style(),
    type: Select({
      label: 'Card type',
      labelOrientation: 'vertical',
      defaultValue: 'featured',
      options: [
        { label: 'Featured', value: 'featured' },
        { label: 'Best Selling', value: 'bestSelling' },
      ],
    }),
    count: Number({
      label: 'Count',
      defaultValue: 4,
      max: 8,
      min: 1,
      labelOrientation: 'horizontal',
      step: 1,
    }),
  },
});
