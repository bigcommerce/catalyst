import { Streamable } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { ListProduct, ProductsList } from '@/vibes/soul/primitives/products-list';
import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';

interface Link {
  label: string;
  href: string;
}

export function FeaturedProductsList({
  title,
  description,
  cta,
  products,
}: {
  title: string;
  description?: string;
  cta?: Link;
  products: Streamable<ListProduct[]>;
}) {
  return (
    <StickySidebarLayout
      sidebar={
        <>
          <h2 className="mb-3 font-heading text-4xl font-medium leading-none text-foreground @4xl:text-5xl">
            {title}
          </h2>
          {description != null && description !== '' && (
            <p className="mb-8 max-w-xl text-lg font-light leading-normal text-foreground">
              {description}
            </p>
          )}

          {cta?.href != null && cta.href !== '' && cta.label !== '' && (
            <ButtonLink href={cta.href} variant="secondary">
              {cta.label}
            </ButtonLink>
          )}
        </>
      }
      sidebarSize="1/3"
    >
      <ProductsList className="flex-1" products={products} />
    </StickySidebarLayout>
  );
}
