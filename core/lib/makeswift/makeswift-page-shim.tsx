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

/**
 * Filters metadata to only include meaningful values while preserving structure.
 * - Always disables favicon to prefer the store favicon from /favicon.ico
 * - Removes falsy values (empty strings, null, undefined) to use BigCommerce defaults
 * - Preserves nested objects and meaningful boolean values
 */
function filterMetadata(metadata: any): any {
  if (metadata === false) {
    return false;
  }
  
  if (!metadata || typeof metadata !== 'object') {
    return { favicon: false };
  }

  const filtered: any = { favicon: false };

  for (const [key, value] of Object.entries(metadata)) {
    if (key === 'favicon') {
      // Always disable favicon to use store favicon
      continue;
    }

    if (value === null || value === undefined) {
      // Skip null/undefined values to use BigCommerce defaults
      continue;
    }

    if (typeof value === 'string' && value.trim() === '') {
      // Skip empty strings to use BigCommerce defaults
      continue;
    }

    if (Array.isArray(value)) {
      // Preserve arrays as-is
      filtered[key] = value;
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      // Recursively filter nested objects (but not arrays)
      const filteredNested = filterMetadata(value);
      if (filteredNested !== false && Object.keys(filteredNested).length > 1) {
        // Only include nested objects if they have more than just the favicon property
        filtered[key] = filteredNested;
      }
      continue;
    }

    // Include all other meaningful values (non-empty strings, numbers, booleans)
    filtered[key] = value;
  }

  return filtered;
}

export function MakeswiftPageShim(props: ComponentPropsWithoutRef<typeof MakeswiftPage>) {
  const metadata = filterMetadata(props.metadata);
  
  return <MakeswiftPage {...props} metadata={metadata} />;
}
