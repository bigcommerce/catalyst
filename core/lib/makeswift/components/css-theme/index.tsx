import { MakeswiftComponent } from '@makeswift/runtime/next';
import { type ComponentPropsWithoutRef } from 'react';

import { getComponentSnapshot } from '~/lib/makeswift/client';

import { CssTheme as CssThemeClient, PropsContextProvider } from './client';
import { COMPONENT_TYPE } from './register';

type Props = ComponentPropsWithoutRef<typeof CssThemeClient> & {
  snapshotId?: string;
  label?: string;
};

export const CssTheme = async ({
  snapshotId = 'site-theme',
  label = 'Site Theme',
  ...props
}: Props) => {
  const snapshot = await getComponentSnapshot(snapshotId);

  return (
    <PropsContextProvider value={props}>
      <MakeswiftComponent label={label} snapshot={snapshot} type={COMPONENT_TYPE} />
    </PropsContextProvider>
  );
};