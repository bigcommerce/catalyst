'use client';

import React, {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
} from 'react';

import { Stream, type Streamable } from '@/vibes/soul/lib/streamable';
import { ProductDetail, ProductDetailSkeleton } from '@/vibes/soul/sections/product-detail';
import { mergeSections } from '~/lib/makeswift/utils/merge-sections';

type VibesProductDetailProps = ComponentPropsWithoutRef<typeof ProductDetail>;
type VibesProductDetail = Exclude<Awaited<VibesProductDetailProps['product']>, null>;

export type ProductDetail = VibesProductDetail & {
  plainTextDescription?: string;
};

export type Props = Omit<VibesProductDetailProps, 'product'> & {
  product: Streamable<ProductDetail>;
};

const PropsContext = createContext<Props | null>(null);

export const PropsContextProvider = ({ value, children }: PropsWithChildren<{ value: Props }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

export const DescriptionSource = {
  CatalogPlainText: 'CatalogPlainText',
  CatalogRichText: 'CatalogRichText',
  Custom: 'Custom',
} as const;

type DescriptionSource = (typeof DescriptionSource)[keyof typeof DescriptionSource];

interface EditableProps {
  summaryText: string | undefined;
  description: { source: DescriptionSource; slot: ReactNode };
  accordions: Exclude<Awaited<VibesProductDetail['accordions']>, undefined>;
}

const ProductDetailImpl = ({
  summaryText,
  description,
  accordions,
  product: streamableProduct,
  ...props
}: Props & EditableProps) => {
  const getProductDescription = useCallback(
    (product: ProductDetail): ProductDetail['description'] => {
      switch (description.source) {
        case DescriptionSource.CatalogPlainText:
          return product.plainTextDescription;

        case DescriptionSource.CatalogRichText:
          return product.description;

        case DescriptionSource.Custom:
          return description.slot;
      }
    },
    [description.source, description.slot],
  );

  const getProductAccordions = useCallback(
    (
      productAccordions: Awaited<ProductDetail['accordions']>,
    ): Awaited<ProductDetail['accordions']> =>
      productAccordions != null
        ? mergeSections(productAccordions, accordions, (left, right) => ({
            ...left,
            content: right.content,
          }))
        : undefined,
    [accordions],
  );

  return (
    <Stream fallback={<ProductDetailSkeleton />} value={streamableProduct}>
      {(product) => (
        <Stream fallback={<ProductDetailSkeleton />} value={product.accordions}>
          {(productAccordions) => (
            <ProductDetail
              {...{
                ...props,
                product: {
                  ...product,
                  summary: summaryText,
                  description: getProductDescription(product),
                  accordions: getProductAccordions(productAccordions),
                },
              }}
            />
          )}
        </Stream>
      )}
    </Stream>
  );
};

export const MakeswiftProductDetail = forwardRef(
  (props: EditableProps, ref: Ref<HTMLDivElement>) => {
    const passedProps = useContext(PropsContext);

    if (passedProps == null) {
      // eslint-disable-next-line no-console
      console.error('No context provided for MakeswiftProductDetail');

      return <p ref={ref}>There was an error rendering the product detail.</p>;
    }

    return (
      <div className="flex flex-col" ref={ref}>
        <ProductDetailImpl {...{ ...passedProps, ...props }} />
      </div>
    );
  },
);
