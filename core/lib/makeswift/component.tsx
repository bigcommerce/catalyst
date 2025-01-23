import { MakeswiftComponent } from '@makeswift/runtime/next';

import { getComponentSnapshot } from '~/lib/makeswift/client';

export const Component = async ({
  snapshotId,
  label,
  ...props
}: {
  type: string;
  label: string | Promise<string>;
  snapshotId: string;
}) => {
  const snapshot = await getComponentSnapshot(snapshotId);

  return <MakeswiftComponent label={await label} snapshot={snapshot} {...props} />;
};