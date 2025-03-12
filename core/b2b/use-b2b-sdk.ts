'use client';

import { useEffect, useState } from 'react';

export const useSDK = () => {
  const [sdk, setSdk] = useState<NonNullable<typeof window.b2b> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.b2b?.utils) {
        setSdk(window.b2b);
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return sdk;
};
