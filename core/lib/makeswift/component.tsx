import { MakeswiftComponent } from '@makeswift/runtime/next';

import { getComponentSnapshot } from '~/lib/makeswift/client';

export const Component = async ({
  snapshotId,
  ...props
}: {
  type: string;
  label: string;
  snapshotId: string;
}) => {
  const snapshot = await getComponentSnapshot(snapshotId);

  return <MakeswiftComponent snapshot={snapshot} {...props} />;
};
