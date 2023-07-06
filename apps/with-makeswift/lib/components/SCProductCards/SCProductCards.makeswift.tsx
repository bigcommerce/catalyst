import { Number, Select, Style } from '@makeswift/runtime/controls';

import { useBcContext } from 'lib/context';

import { SCProductCards, SCProductCardsProps } from './SCProductCards';
import { runtime } from 'lib/runtime';

interface WrapperProps {
  className?: string;
  type: 'bestSelling' | 'featured';
  count: number;
}

type Cards = SCProductCardsProps['cards'];

const SCProductCardsWrapper = ({ className, type, count }: WrapperProps) => {
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

  return <SCProductCards cards={cards} className={className} />;
};

runtime.registerComponent(SCProductCardsWrapper, {
  type: 'sc-product-cards',
  label: 'SC Product Cards',
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
