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

import { type Streamable } from '@/vibes/soul/lib/streamable';
import { ProductDetail, type ProductDetailProduct } from '@/vibes/soul/sections/product-detail';
import {
  computedStremableProp,
  useComputedStremableProp,
} from '~/lib/makeswift/hooks/use-computed-stremable-prop';
import { useStreamablePropsMemo } from '~/lib/makeswift/hooks/use-streamable-props-memo';
import { mergeSections } from '~/lib/makeswift/utils/merge-sections';

type VibesProductDetailProps = ComponentPropsWithoutRef<typeof ProductDetail>;
export type ProductDetail = ProductDetailProduct & {
  plainTextDescription?: string;
};

export type Props = VibesProductDetailProps & {
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
  accordions: Exclude<Awaited<ProductDetailProduct['accordions']>, undefined>;
}

const ProductDetailImpl = ({
  summaryText,
  description,
  accordions,
  ...props
}: VibesProductDetailProps & EditableProps) => {
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
    (product: ProductDetail): ProductDetail['accordions'] =>
      product.accordions != null
        ? computedStremableProp(product.accordions, (productAccordions) =>
            mergeSections(productAccordions, accordions, (left, right) => ({
              ...left,
              content: right.content,
            })),
          )
        : undefined,
    [accordions],
  );

  const memoizedProps = useStreamablePropsMemo(props);
  const computedProduct = useComputedStremableProp(
    memoizedProps.product,
    useCallback(
      (product: ProductDetailProduct) => ({
        ...product,
        summary: summaryText,
        description: getProductDescription(product),
        accordions: getProductAccordions(product),
      }),
      [summaryText, getProductDescription, getProductAccordions],
    ),
  );

  return <ProductDetail {...{ ...memoizedProps, product: computedProduct }} />;
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
