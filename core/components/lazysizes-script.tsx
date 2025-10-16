'use client';

import { useEffect } from 'react';

let lazySizesLoaded = false;

export function LazySizesScript() {
  useEffect(() => {
    if (!lazySizesLoaded) {
      // Load lazysizes eagerly as soon as component mounts
      import('lazysizes')
        .then(() => {
          lazySizesLoaded = true;
        })
        .catch((err) => {
          console.error('Failed to load lazysizes:', err);
        });
    }
  }, []);

  return null;
}
