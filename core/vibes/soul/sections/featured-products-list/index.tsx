import { Streamable } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { ListProduct, ProductsList } from '@/vibes/avios/sections/products-list';
import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';

interface Link {
  label: string;
  href: string;
}

interface Props {
  title: string;
  description?: string;
  cta?: Link;
  products: Streamable<ListProduct[]>;
  emptyStateTitle?: Streamable<string | null>;
  emptyStateSubtitle?: Streamable<string | null>;
  placeholderCount?: number;
}

export function FeaturedProductsList({
  title,
  description,
  cta,
  products,
  emptyStateTitle,
  emptyStateSubtitle,
  placeholderCount,
}: Props) {
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
      <div className="group-has-[[data-pending]]/pending:animate-pulse">
        <ProductsList
          className="flex-1"
          emptyStateSubtitle={emptyStateSubtitle}
          emptyStateTitle={emptyStateTitle}
          placeholderCount={placeholderCount}
          products={products}
        />
      </div>
    </StickySidebarLayout>
  );
}
