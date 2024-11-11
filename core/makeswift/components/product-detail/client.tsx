'use client';

import React, {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
  type Ref,
  useContext,
  useMemo,
} from 'react';

import { ProductDetail } from '@/vibes/soul/sections/product-detail';

type VibesProductDetailProps = ComponentPropsWithoutRef<typeof ProductDetail>;

type Props = VibesProductDetailProps & {
  product: VibesProductDetailProps['product'] & {
    description: string;
    plainTextDescription: string;
  };
};

const PropsContext = createContext<Props | null>(null);

export const PropsContextProvider = ({ value, children }: PropsWithChildren<{ value: Props }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

export const DescriptionType = {
  PlainText: 'PlainText',
  RichText: 'RichText',
  Custom: 'Custom',
} as const;

type DescriptionType = (typeof DescriptionType)[keyof typeof DescriptionType];

export const MakeswiftProductDetail = forwardRef(
  (
    {
      descriptionType,
      slot,
    }: {
      descriptionType: DescriptionType;
      slot: ReactNode;
    },
    ref: Ref<HTMLDivElement>,
  ) => {
    const context = useContext(PropsContext);
    const description = useMemo(() => {
      const product = context?.product;
      if (product == null) return null;

      switch (descriptionType) {
        case DescriptionType.PlainText:
          return product.plainTextDescription;
        case DescriptionType.RichText:
          return (
            <div className="prose" dangerouslySetInnerHTML={{ __html: product.description }} />
          );
        case DescriptionType.Custom:
          return slot;
      }
    }, [descriptionType, context?.product, slot]);

    if (context == null) {
      console.error('No context provided for MakeswiftProductDetail');
      return <p ref={ref}>There was an error rendering the product detail.</p>;
    }

    return (
      <div className="flex flex-col" ref={ref}>
        <ProductDetail
          {...context}
          product={{
            ...context.product,
            description,
          }}
        />
      </div>
    );
  },
);
