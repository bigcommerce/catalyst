'use client';

import { toast } from '@/vibes/soul/primitives/toaster';
import { useEffect, useState } from 'react';

export const useSDK = () => {
  const [sdk, setSdk] = useState<NonNullable<typeof window.b2b> | null>(null);

  useEffect(() => {
    window.catalyst = { 
      toast,
    };
    const interval = setInterval(() => {
      const getQuoteConfigs = window.b2b?.utils?.quote?.getQuoteConfigs;

      if (!getQuoteConfigs) {
        return;
      }

      if (window.b2b?.utils && getQuoteConfigs().length > 0) {
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
