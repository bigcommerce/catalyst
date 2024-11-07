import { Checkbox, Combobox, Style } from '@makeswift/runtime/controls';
import { useFormatter } from 'next-intl';
import useSWR from 'swr';

import { GetProductResponse } from '~/app/api/products/[entityId]/route';
import { SearchProductsResponse } from '~/app/api/products/route';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { ProductCard, ProductCardSkeleton } from '~/vibes/soul/primitives/product-card';

import { runtime } from '~/lib/makeswift/runtime';

interface Props {
  entityId?: string;
  className?: string;
  showCompare?: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function MakeswiftProductCard({ entityId, className, showCompare }: Props) {
  const format = useFormatter();
  // const t = useTranslations('Components.ProductCard');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error, isLoading } = useSWR<GetProductResponse>(
    entityId ? `/api/products/${entityId}` : null,
    fetcher,
  );

  if (entityId == null) {
    // return <ProductCardEmpty title={t('empty')} />;
    return <ProductCardSkeleton className={className} />;
  }

  if (isLoading) {
    return <ProductCardSkeleton className={className} />;
  }

  if (data == null || error) {
    // return <ProductCardError title={t('error')} />;
    return <ProductCardSkeleton className={className} />;
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
  type: 'catalog-product-card',
  label: 'Catalog / Product Card',
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
