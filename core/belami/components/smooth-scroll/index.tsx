'use client'

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function SmoothScroll() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? decodeURIComponent(window.location.hash) : null;
    if (hash && hash.length > 0) {
      const elem = document.getElementById(hash.replace(/.*\#/, ''));
      if (elem) {
        window.scrollTo({
            top: elem?.getBoundingClientRect().top,
            behavior: 'smooth',
        });
      }
    }
  }, [pathname, searchParams]);

  return <></>;
}