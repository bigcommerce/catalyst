import { type ComponentPropsWithoutRef } from 'react';

import { Component } from '~/lib/makeswift/component';

import { PropsContextProvider, SiteTheme as SiteThemeClient } from './client';
import { COMPONENT_TYPE } from './register';

type Props = ComponentPropsWithoutRef<typeof SiteThemeClient> & {
  snapshotId?: string;
  label?: string;
};

export const SiteTheme = ({ snapshotId = 'site-theme', label = 'Site Theme', ...props }: Props) => (
  <PropsContextProvider value={props}>
    <Component label={label} snapshotId={snapshotId} type={COMPONENT_TYPE} />
  </PropsContextProvider>
);
