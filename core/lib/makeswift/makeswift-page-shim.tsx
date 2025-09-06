/**
 * Temporary shim to avoid React/Next.js remount bug when a memoised
 * client component is rendered directly by an RSC.
 * See: https://github.com/vercel/next.js/issues/44901 and
 *      https://github.com/vercel/next.js/issues/73507
 *
 * Remove once the upstream fix ships.
 */
'use client';

import { Page as MakeswiftPage } from '@makeswift/runtime/next';
import { ComponentPropsWithoutRef } from 'react';

export function MakeswiftPageShim(props: ComponentPropsWithoutRef<typeof MakeswiftPage>) {
  // Explicitly disable favicon to use the favicon from /favicon.ico route instead
  const metadata = props.metadata === false ? false : { ...props.metadata, favicon: false };
  
  return <MakeswiftPage {...props} metadata={metadata} />;
}
