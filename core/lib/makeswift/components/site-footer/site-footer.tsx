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
  logo: streamableLogo,
  sections: streamableSections,
  ...props
}: Props) => {
  const snapshot = await getComponentSnapshot(snapshotId);
  const logo = await streamableLogo;
  const sections = await streamableSections;

  return (
    <PropsContextProvider value={{ ...props, logo, sections }}>
      <MakeswiftComponent label={label} snapshot={snapshot} type={COMPONENT_TYPE} />
    </PropsContextProvider>
  );
};
