import { useTranslations } from 'next-intl';

import { getProduct } from '~/client/queries/get-product';

type Product = Awaited<ReturnType<typeof getProduct>>;

export const Warranty = ({ product }: { product: NonNullable<Product> }) => {
  const t = useTranslations('Product.Details');

  if (!product.warranty) {
    return null;
  }

  return (
    <>
      <h2 className="mb-4 mt-8 text-xl font-bold md:text-2xl">{t('warranty')}</h2>
      <p>{product.warranty}</p>
    </>
  );
};
