import useSWR from 'swr';

import { runtime } from '~/lib/makeswift/runtime';
import { FeaturedProductsCarousel } from '@/vibes/soul/sections/featured-products-carousel';
import { GetFeaturedProductResponse } from '~/app/api/products/featured/route';
import { featuredProductsControls } from '~/makeswift/composed-controls/featured-products-controls';
import { useBcProductToVibesProduct } from '~/makeswift/utils/use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';

type Props = {
  className?: string;
  limit: number;
  title: string;
  description?: string;
  showButton: boolean;
  buttonText: string;
  buttonHref: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function MakeswiftFeaturedProductsCarousel({
  className,
  limit,
  title,
  description,
  showButton,
  buttonText,
  buttonHref,
}: Props) {
  const bcProductToVibesProduct = useBcProductToVibesProduct();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data } = useSWR<GetFeaturedProductResponse>('/api/products/featured', fetcher);

  const cta = showButton ? { label: buttonText, href: buttonHref } : undefined;
  const products = data?.slice(0, limit).map(bcProductToVibesProduct) ?? [];

  return (
    <div className={className}>
      {/* TODO: Fix skeleton */}
      <FeaturedProductsCarousel
        title={title}
        description={description}
        products={products}
        cta={cta}
      />
    </div>
  );
}

runtime.registerComponent(MakeswiftFeaturedProductsCarousel, {
  type: 'catalog-featured-products-carousel',
  label: 'Catalog / Featured Products Carousel',
  props: featuredProductsControls(),
});
