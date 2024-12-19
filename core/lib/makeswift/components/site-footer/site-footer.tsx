import { MakeswiftComponent } from '@makeswift/runtime/next';
import { type ComponentPropsWithoutRef } from 'react';

import { Footer as VibesFooter } from '@/vibes/soul/sections/footer';
import { getComponentSnapshot } from '~/lib/makeswift/client';

import { PropsContextProvider } from './site-footer.client';
import { COMPONENT_TYPE } from './site-footer.makeswift';

type Props = ComponentPropsWithoutRef<typeof VibesFooter> & {
  snapshotId?: string;
  label?: string;
};

export const SiteFooter = async ({
  snapshotId = 'site-footer',
  label = 'Site Footer',
  ...props
}: Props) => {
  const snapshot = await getComponentSnapshot(snapshotId);

  return (
    <PropsContextProvider value={props}>
      <MakeswiftComponent label={label} snapshot={snapshot} type={COMPONENT_TYPE} />
    </PropsContextProvider>
  );
};
