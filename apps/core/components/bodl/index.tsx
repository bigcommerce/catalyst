'use client';

import { useBodl } from 'app/contexts/bodl-context';

interface Props {
  event: string;
  payload: any;
}

// Default BODL client component for emitting events
export default function Bodl({ event, payload }: Props) {
  const bodl = useBodl();

  bodl.sendEvent(event, payload);

  return null;
}
