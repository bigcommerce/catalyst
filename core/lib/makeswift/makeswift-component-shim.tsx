/**
 * Temporary shim to avoid React/Next.js remount bug when a memoised
 * client component is rendered directly by an RSC.
 * See: https://github.com/vercel/next.js/issues/44901 and
 *      https://github.com/vercel/next.js/issues/73507
 *
 * Remove once the upstream fix ships.
 */
'use client';

import { MakeswiftComponent } from '@makeswift/runtime/next';
import { ComponentPropsWithoutRef } from 'react';

export function MakeswiftComponentShim(props: ComponentPropsWithoutRef<typeof MakeswiftComponent>) {
  return <MakeswiftComponent {...props} />;
}
