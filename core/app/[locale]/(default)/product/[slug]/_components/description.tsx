import { useTranslations } from 'next-intl';

import { FragmentOf, graphql } from '~/client/graphql';

export const DescriptionFragment = graphql(`
  fragment DescriptionFragment on Product {
    description
  }
`);

interface Props {
  product: FragmentOf<typeof DescriptionFragment>;
}

export const Description = ({ product }: Props) => {
  const t = useTranslations('Product.Description');

  if (!product.description) {
    return null;
  }

  return (
    <>
      <h2 className="mb-4 text-xl font-bold md:text-2xl">{t('heading')}</h2>
      <div dangerouslySetInnerHTML={{ __html: product.description }} />
    </>
  );
};
