'use client';

import { useEffect } from 'react';
import { useBodl } from 'app/contexts/bodl-context';
import { bodlEvent } from '@bigcommerce/bodl/src/types';

interface Props {
  event: bodlEvent;
  payload: any;
}

// Default BODL client component for emitting events
export default function Bodl({ event, payload }: Props) {
  const bodl = useBodl();

  useEffect(() => {
    bodl.sendEvent(event, payload);
  });

  return null;
}
