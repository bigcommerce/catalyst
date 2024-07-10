'use client';

import { useEffect, useState } from 'react';

import { ResultOf } from '~/client/graphql';
import { ProductCardCarouselFragment } from '~/components/product-card-carousel/fragment';
import { ProductCard } from '~/components/ui/product-card';

import { Carousel } from './carousel';

interface Props {
  title: string;
  type: 'newest' | 'featured';
  className?: string;
}

type Product = ResultOf<typeof ProductCardCarouselFragment>;

export function MakeswiftCarousel({ title, type, className }: Props) {
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
      href={product.path}
      id={product.entityId.toString()}
      image={
        product.defaultImage
          ? { src: product.defaultImage.url, altText: product.defaultImage.altText }
          : undefined
      }
      imagePriority={false}
      imageSize="square"
      key={product.entityId}
      name={product.name}
      showCompare={false}
      subtitle={product.brand?.name}
    />
  ));

  return (
    <div className={className}>
      <Carousel className="mb-14" products={items} title={title} />
    </div>
  );
}
