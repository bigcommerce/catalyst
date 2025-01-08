'use client'

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function SmoothScroll() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? decodeURIComponent(window.location.hash) : '';
    if (hash) {
      const elem = document.getElementById(hash.replace(/.*\#/, ''));
      window.scrollTo({
          top: elem?.getBoundingClientRect().top,
          behavior: 'smooth',
      });
    }
  }, [pathname, searchParams]);

  return <></>;
}