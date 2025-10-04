import { Component } from '~/lib/makeswift/component';

import { type Props as ClientProps, PropsContextProvider } from './client';
import { COMPONENT_TYPE } from './register';
import { type Streamable } from '@/vibes/soul/lib/streamable';

type Props = ClientProps & {
  productId: number;
  inventoryTracking: Streamable<string | null>;
  inventoryLevel: any;
  sku: Streamable<string>;
};

export const ProductDetail = ({ productId, ...props }: Props) => (
  <PropsContextProvider value={props}>
    <Component
      label={(async () =>
        `Detail for ${await Promise.resolve(props.product).then(({ title }) => title)}`)()}
      snapshotId={`product-detail-${productId}`}
      type={COMPONENT_TYPE}
    />
  </PropsContextProvider>
);
