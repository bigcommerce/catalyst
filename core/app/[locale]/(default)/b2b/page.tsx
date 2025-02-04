'use client';

import { useEffect, useState } from 'react';

export default function B2B() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (
        window.b2b?.utils &&
        typeof window.b2b.utils.openPage === 'function' &&
        window.b2b.utils.user.getB2BToken()
      ) {
        clearInterval(intervalId);
        setIsReady(true);
        window.b2b.utils.openPage('ORDERS');
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  return !isReady ? <div className="py-44 text-center">Loading Buyer Portal...</div> : null;
}
