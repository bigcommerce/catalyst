import { Select, Style, TextInput } from '@makeswift/runtime/controls';
import { useEffect, useState } from 'react';

import { ResultOf } from '~/client/graphql';
import { ProductCard } from '~/components/product-card';
import { ProductCardCarouselFragment } from '~/components/product-card-carousel';
import { runtime } from '~/lib/makeswift/runtime';

import { Carousel } from './carousel';

interface Props {
  title: string;
  type: 'newest' | 'featured';
  className?: string;
}

type Product = ResultOf<typeof ProductCardCarouselFragment>;

runtime.registerComponent(
  function MakeswiftCarousel({ title, type, className }: Props) {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
      const fetchProducts = async () => {
        const response = await fetch(`/api/product-card-carousel/${type}`);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const data = (await response.json()) as Product[];

        setProducts(data);
      };

      void fetchProducts();
    }, [type]);

    const items = products.map((product) => (
      <ProductCard
        imageSize="tall"
        key={product.entityId}
        product={product}
        showCart={false}
        showCompare={false}
      />
    ));

    return (
      <div className={className}>
        <Carousel className="mb-14" items={items} title={title} />
      </div>
    );
  },
  {
    type: 'catalyst-carousel',
    label: 'Catalyst / Carousel',
    props: {
      className: Style(),
      title: TextInput({ label: 'Title', defaultValue: 'Carousel' }),
      type: Select({
        label: 'Type',
        options: [
          { label: 'Newest', value: 'newest' },
          { label: 'Featured', value: 'featured' },
        ],
        defaultValue: 'newest',
      }),
    },
  },
);
