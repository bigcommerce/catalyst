'use client';

import React, {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
  type Ref,
  useContext,
} from 'react';

import { ProductDescription } from '@/vibes/soul/sections/product-description';
import { mergeSections } from '~/makeswift/lib/merge-sections';

type Props = ComponentPropsWithoutRef<typeof ProductDescription>;

const PropsContext = createContext<Props>({
  accordions: [],
});

export const PropsContextProvider = ({ value, children }: PropsWithChildren<{ value: Props }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

export const MakeswiftProductDescription = forwardRef(
  (
    {
      showOriginal,
      accordions,
      image,
      showExtras,
      extras,
    }: {
      showOriginal: boolean;
      accordions: Exclude<Props['accordions'], undefined>;
      image?: string;
      showExtras: boolean;
      extras: ReactNode;
    },
    ref: Ref<HTMLDivElement>,
  ) => {
    const { accordions: passedAccordions, image: passedImage } = useContext(PropsContext);

    return (
      <div className="flex flex-col" ref={ref}>
        <ProductDescription
          accordions={mergeSections(
            showOriginal && passedAccordions ? passedAccordions : [],
            accordions,
            (left, right) => ({
              ...left,
              content: right.content,
            }),
          )}
          image={image ? { src: image, alt: 'Product image' } : passedImage}
        />
        {showExtras ? extras : undefined}
      </div>
    );
  },
);
