'use client'

import { PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
 
export function ScrollableLink({ children, href, replace = false, scroll = true, className } : PropsWithChildren<{ href: string, replace?: boolean, scroll?: boolean, prefetch?: boolean, className?: string }>) {
  const router = useRouter();
 
  return (<>
    <button type="button" onClick={() => replace ? router.replace(href, {scroll: scroll}) : router.push(href, {scroll: scroll})} className={className}>
      {children}
    </button>
  </>)
}