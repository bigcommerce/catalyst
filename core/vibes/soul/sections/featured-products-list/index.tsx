import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { ListProduct, ProductsList } from '@/vibes/soul/primitives/products-list';

interface Link {
  label: string;
  href: string;
}

export interface FeaturedProductsListProps {
  title: string;
  description?: string;
  cta?: Link;
  products: ListProduct[];
}

export function FeaturedProductsList({
  title,
  description,
  cta,
  products,
}: FeaturedProductsListProps) {
  return (
    <section className="@container">
      <div className="relative mx-auto flex max-w-screen-2xl flex-col gap-6 px-4 py-10 @4xl:flex-row @4xl:px-8 @4xl:py-24">
        <div className="top-28 flex w-full flex-col items-start justify-between gap-4 self-start @xl:flex-row @4xl:sticky @4xl:w-1/2 @4xl:max-w-md @4xl:flex-col @4xl:items-start @4xl:justify-start @5xl:px-0 @6xl:w-4/12">
          <div>
            <h2 className="mb-4 font-heading text-4xl font-semibold leading-none text-foreground @4xl:text-6xl @4xl:font-medium">
              {title}
            </h2>
            {description != null && description !== '' && (
              <p className="mt-1.5 max-w-md pb-2 text-lg font-light text-foreground">
                {description}
              </p>
            )}
          </div>
          {cta?.href != null && cta.href !== '' && cta.label !== '' && (
            <div className="shrink-0">
              <ButtonLink href={cta.href} variant="secondary">
                {cta.label}
              </ButtonLink>
            </div>
          )}
        </div>

        <ProductsList products={products} className="4xl:w-1/2 @6xl:w-8/12" />
      </div>
    </section>
  );
}
