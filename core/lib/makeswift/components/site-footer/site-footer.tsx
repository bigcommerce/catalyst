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
  sections: streamableSections,
  ...props
}: Props) => {
  const snapshot = await getComponentSnapshot(snapshotId);
  const sections = await streamableSections;

  return (
    <PropsContextProvider value={{ ...props, sections }}>
      <MakeswiftComponent label={label} snapshot={snapshot} type={COMPONENT_TYPE} />
    </PropsContextProvider>
  );
};
