'use client'

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function SmoothScroll() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getHash = () =>
    typeof window !== 'undefined'
      ? decodeURIComponent(window.location.hash)
      : '';

  useEffect(() => {
    alert('OK');
    const targetId = getHash();
    alert(targetId);
    if (targetId) {
      const elem = document.getElementById(targetId.replace(/.*\#/, ''));
      window.scrollTo({
          top: elem?.getBoundingClientRect().top,
          behavior: 'smooth',
      });
    }
  }, [pathname, searchParams]);

  return <></>;
}