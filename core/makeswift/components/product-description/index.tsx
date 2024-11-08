import { MakeswiftComponent } from '@makeswift/runtime/next';
import { type ComponentPropsWithoutRef } from 'react';

import {
  AccordionItem as VibesAccordionItem,
  ProductDescription as VibesProductDescription,
} from '@/vibes/soul/sections/product-description';
import { getComponentSnapshot } from '~/lib/makeswift/client';

import { PropsContextProvider } from './client';
import { COMPONENT_TYPE } from './register';

export type AccordionItem = VibesAccordionItem;

type Props = ComponentPropsWithoutRef<typeof VibesProductDescription> & {
  product: { id: string; title: string };
};

export const ProductDescription = async ({ product, ...props }: Props) => {
  const snapshot = await getComponentSnapshot(`product-description-${product.id}`);

  return (
    <PropsContextProvider value={props}>
      <MakeswiftComponent
        name={`Description for ${product.title}`}
        snapshot={snapshot}
        type={COMPONENT_TYPE}
      />
    </PropsContextProvider>
  );
};
