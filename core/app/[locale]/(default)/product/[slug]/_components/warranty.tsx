import { useTranslations } from 'next-intl';

import { FragmentOf, graphql } from '~/client/graphql';

export const WarrantyFragment = graphql(`
  fragment WarrantyFragment on Product {
    warranty
  }
`);

interface Props {
  product: FragmentOf<typeof WarrantyFragment>;
}

export const Warranty = ({ product }: Props) => {
  const t = useTranslations('Product.Warranty');

  if (!product.warranty) {
    return null;
  }

  return (
    <>
      <h2 className="mb-4 mt-8 text-xl font-bold md:text-2xl">{t('heading')}</h2>
      <p>{product.warranty}</p>
    </>
  );
};
