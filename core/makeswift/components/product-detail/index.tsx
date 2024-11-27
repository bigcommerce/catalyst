import { MakeswiftComponent } from '@makeswift/runtime/next';
import { type ComponentPropsWithoutRef } from 'react';

import { ProductDetail as VibesProductDetail } from '@/vibes/soul/sections/product-detail';
import { getComponentSnapshot } from '~/lib/makeswift/client';

import { PropsContextProvider } from './client';
import { COMPONENT_TYPE } from './register';

type VibesProductDetailProps = ComponentPropsWithoutRef<typeof VibesProductDetail>;

type Props = VibesProductDetailProps & {
  product: VibesProductDetailProps['product'] & {
    description: string;
    plainTextDescription: string;
  };
};

export const ProductDetail = async (props: Props) => {
  const snapshot = await getComponentSnapshot(`product-detail-${props.product.id}`);

  return (
    <PropsContextProvider value={props}>
      <MakeswiftComponent
        label={`Detail for ${props.product.title}`}
        snapshot={snapshot}
        type={COMPONENT_TYPE}
      />
    </PropsContextProvider>
  );
};
