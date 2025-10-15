'use client';

import { useEffect } from 'react';

let initialized = false;

export function useLazySizes() {
  useEffect(() => {
    if (!initialized) {
      // Import lazysizes dynamically on the client side
      import('lazysizes').then(() => {
        initialized = true;
      });
    }
  }, []);
}
