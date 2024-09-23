import { Link } from '~/components/link';

import { Product } from '../product-card';
import { ProductsCarousel } from '../products-carousel';

interface Link {
  label: string;
  href: string;
}

interface Props {
  title: string;
  description?: string;
  cta?: Link;
  products: Product[];
}

export const FeaturedProductsCarousel = function FeaturedProductsCarousel({
  title,
  description,
  cta,
  products,
}: Props) {
  return (
    <section className="@container">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-row flex-wrap justify-between gap-5 px-3 pt-10 text-foreground @xl:px-6 @4xl:items-end @4xl:pt-20 @5xl:px-20">
        <div className="flex flex-col gap-5">
          {Boolean(title) && (
            <h2 className="font-heading text-2xl font-medium leading-none">{title}</h2>
          )}
          {description != null && description !== '' && (
            <p className="max-w-md text-contrast-400">{description}</p>
          )}
        </div>
        {cta != null && cta.href !== '' && cta.label !== '' && (
          <Link
            className="rounded-lg font-semibold text-foreground ring-primary focus-visible:outline-0 focus-visible:ring-2"
            href={cta.href}
          >
            {cta.label}
          </Link>
        )}
      </div>
      <ProductsCarousel products={products} />
    </section>
  );
};
