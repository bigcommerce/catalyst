'use client'

import { PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
 
export function ScrollableLink({ children, href, replace = false, className } : PropsWithChildren<{ href: string, replace?: boolean, prefetch?: boolean, className?: string }>) {
  const router = useRouter();
 
  return (<>
    <button type="button" onClick={() => replace ? router.replace(href, {scroll: false}) : router.push(href, {scroll: false})} className={className}>
      {children}
    </button>
  </>)
}