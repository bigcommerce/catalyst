import { Component } from '~/lib/makeswift/component';

import { COMPONENT_TYPE } from './register';

interface Props {
  snapshotId?: string;
  label?: string;
}

export const SiteTheme = ({ snapshotId = 'site-theme', label = 'Site Theme' }: Props) => (
  <Component label={label} snapshotId={snapshotId} type={COMPONENT_TYPE} />
);
