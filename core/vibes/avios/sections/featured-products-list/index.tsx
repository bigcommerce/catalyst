import { Streamable } from '@/vibes/soul/lib/streamable';
import { ListProduct, ProductsList } from '@/vibes/avios/sections/products-list';
import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';
import { Button, Heading, Paragraph } from '~/alto/alto-avios';

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
        <div className="space-y-lg">
          <Heading as="h2">{title}</Heading>
          {description != null && description !== '' && <Paragraph>{description}</Paragraph>}

          {cta?.href != null && cta.href !== '' && cta.label !== '' && (
            <Button as="a" href={cta.href} styleVariant="neutral">
              {cta.label}
            </Button>
          )}
        </div>
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
