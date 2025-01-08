import { Component } from '~/lib/makeswift/component';

import { type Props as ClientProps, PropsContextProvider } from './client';
import { COMPONENT_TYPE } from './register';

type Props = ClientProps & { productId: number };

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
