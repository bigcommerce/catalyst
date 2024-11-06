import { Checkbox, Combobox, Style } from '@makeswift/runtime/controls';
import { useFormatter, useTranslations } from 'next-intl';
import useSWR from 'swr';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import {
  ProductCard,
  ProductCardEmpty,
  ProductCardError,
  ProductCardSkeleton,
} from '~/vibes/soul/primitives/product-card';
import { runtime } from '../../runtime';
import { SearchProductsResponse } from '~/app/api/products/route';
import { GetProductResponse } from '~/app/api/products/[entityId]/route';

interface Props {
  entityId?: string;
  className?: string;
  showCompare?: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function MakeswiftProductCard({ entityId, className, showCompare }: Props) {
  const format = useFormatter();
  const t = useTranslations('Components.ProductCard');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error, isLoading } = useSWR<GetProductResponse>(
    entityId ? `/api/products/${entityId}` : null,
    fetcher,
  );

  if (entityId == null) {
    return <ProductCardEmpty title={t('empty')} />;
  }

  if (isLoading) {
    return <ProductCardSkeleton />;
  }

  if (data == null || error) {
    return <ProductCardError title={t('error')} />;
  }

  const { name, defaultImage, brand, path, prices } = data;
  const price = pricesTransformer(prices, format);

  return (
    <ProductCard
      className={className}
      product={{
        id: entityId.toString(),
        title: name,
        href: path,
        image: defaultImage ? { src: defaultImage.url, alt: defaultImage.altText } : undefined,
        price,
        subtitle: brand?.name,
      }}
      showCompare={showCompare}
    />
  );
}

runtime.registerComponent(MakeswiftProductCard, {
  type: 'catalyst-product-card',
  label: 'Catalyst / Product Card',
  props: {
    className: Style(),
    entityId: Combobox({
      label: 'Product',
      async getOptions(query) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const res: SearchProductsResponse = await fetch(`/api/products?search=${query}`).then((r) =>
          r.json(),
        );

        if (res.data == null) return [];

        return res.data.products.map((product) => ({
          id: product.entityId.toString(),
          label: product.name,
          value: product.entityId.toString(),
        }));
      },
    }),
    showCompare: Checkbox({ label: 'Show Compare', defaultValue: false }),
  },
});
