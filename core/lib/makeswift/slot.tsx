import { Slot as MakeswiftSlot } from '@makeswift/runtime/next';

import { getComponentSnapshot } from './client';

export async function Slot({
  snapshotId,
  label,
  fallback,
}: {
  snapshotId: string;
  label: string;
  fallback?: React.ReactNode;
}) {
  const snapshot = await getComponentSnapshot(snapshotId);

  return <MakeswiftSlot fallback={fallback} label={label} snapshot={snapshot} />;
}
