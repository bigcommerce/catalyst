import { MakeswiftComponent } from '@makeswift/runtime/next';
import { type ComponentPropsWithoutRef } from 'react';

import { NotFound as VibesNotFoundSection } from '@/vibes/soul/sections/not-found';
import { getComponentSnapshot } from '~/lib/makeswift/client';

import { COMPONENT_TYPE } from './register';

type Props = ComponentPropsWithoutRef<typeof VibesNotFoundSection> & {
  snapshotId: string;
  label: string;
};

export const NotFoundSection = async ({ snapshotId, label, ...props }: Props) => {
  const snapshot = await getComponentSnapshot(snapshotId);

  return (
    <MakeswiftComponent
      fallback={<VibesNotFoundSection {...props} />}
      label={label}
      snapshot={snapshot}
      type={COMPONENT_TYPE}
    />
  );
};
