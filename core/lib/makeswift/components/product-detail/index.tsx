import { Component } from '~/lib/makeswift/component';

import { type Props as ClientProps, PropsContextProvider } from './client';
import { COMPONENT_TYPE } from './register';

type Props = ClientProps & { productId: number; productTitle: Promise<string> };

export const ProductDetail = ({ productId, productTitle, ...props }: Props) => (
  <PropsContextProvider value={props}>
    <Component
      label={(async () => `Detail for ${await productTitle}`)()}
      snapshotId={`product-detail-${productId}`}
      type={COMPONENT_TYPE}
    />
  </PropsContextProvider>
);
