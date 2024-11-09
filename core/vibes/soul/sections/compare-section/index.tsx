import clsx from 'clsx';

import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
} from '@/vibes/soul/primitives/carousel';
import { CompareCard, CompareProduct } from '@/vibes/soul/primitives/compare-card';

type Props = {
  className?: string;
  title?: string;
  products: CompareProduct[];
  addToCartAction?(id: string): Promise<void>;
};

export function CompareSection({
  className,
  title = 'Compare products',
  products,
  addToCartAction,
}: Props) {
  return (
    <div className={clsx('overflow-hidden @container', className)}>
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        <Carousel className={className}>
          <div className="mb-8 flex w-full items-end justify-between gap-10 @xl:mb-10">
            <h1 className="font-heading text-2xl leading-none @xl:text-3xl @4xl:text-4xl">
              {title} <span className="text-contrast-300">{products.length}</span>
            </h1>
            <CarouselButtons className="hidden xl:block" />
          </div>
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem
                className="basis-[calc(100%-20px)] @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
                key={product.id}
              >
                <CompareCard addToCartAction={addToCartAction} key={product.id} product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
