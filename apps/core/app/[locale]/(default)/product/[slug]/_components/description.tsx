import { useTranslations } from 'next-intl';

import { getProduct } from '~/client/queries/get-product';

type Product = Awaited<ReturnType<typeof getProduct>>;

export const Description = ({ product }: { product: NonNullable<Product> }) => {
  const t = useTranslations('Product.DescriptionAndReviews');

  if (!product.description) {
    return null;
  }

  return (
    <>
      <h2 className="mb-4 text-xl font-bold md:text-2xl">{t('description')}</h2>
      <div dangerouslySetInnerHTML={{ __html: product.description }} />
    </>
  );
};
