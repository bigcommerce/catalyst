import { MakeswiftComponent } from '@makeswift/runtime/next';
import { type ComponentPropsWithoutRef } from 'react';

import { HeaderSection } from '@/vibes/soul/sections/header-section';
import { getComponentSnapshot } from '~/lib/makeswift/client';

import { PropsContextProvider } from './site-header.client';
import { COMPONENT_TYPE } from './site-header.makeswift';

type Props = ComponentPropsWithoutRef<typeof HeaderSection> & {
  snapshotId?: string;
  label?: string;
};

export const SiteHeader = async ({
  snapshotId = 'site-header',
  label = 'Site Header',
  ...props
}: Props) => {
  const snapshot = await getComponentSnapshot(snapshotId);

  return (
    <PropsContextProvider value={props}>
      <MakeswiftComponent label={label} snapshot={snapshot} type={COMPONENT_TYPE} />
    </PropsContextProvider>
  );
};
