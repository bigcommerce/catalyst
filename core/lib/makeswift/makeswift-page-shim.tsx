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

type MetadataValue = string | number | boolean | MetadataObject | MetadataValue[] | null | undefined;
type MetadataObject = { [key: string]: MetadataValue };

/**
 * Filters metadata to only include meaningful values while preserving structure.
 * - Always disables favicon to prefer the store favicon from /favicon.ico
 * - Removes falsy values (empty strings, null, undefined) to use BigCommerce defaults
 * - Preserves nested objects and meaningful boolean values
 * @param metadata - The metadata object to filter
 * @returns The filtered metadata object with meaningful values only
 */
function filterMetadata(metadata: MetadataValue): MetadataObject | false {
  if (metadata === false) {
    return false;
  }

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return { favicon: false };
  }

  const filtered: MetadataObject = { favicon: false };
  const entries = Object.entries(metadata);

  const processedEntries = entries.reduce<MetadataObject>((acc, [key, value]) => {
    // Always disable favicon to use store favicon
    if (key === 'favicon') {
      return acc;
    }

    // Skip null/undefined values to use BigCommerce defaults
    if (value === null || value === undefined) {
      return acc;
    }

    // Skip empty strings to use BigCommerce defaults
    if (typeof value === 'string' && value.trim() === '') {
      return acc;
    }

    // Preserve arrays as-is
    if (Array.isArray(value)) {
      acc[key] = value;
      return acc;
    }

    // Recursively filter nested objects (but not arrays)
    if (typeof value === 'object' && value !== null) {
      const filteredNested = filterMetadata(value);

      if (filteredNested !== false && Object.keys(filteredNested).length > 1) {
        // Only include nested objects if they have more than just the favicon property
        acc[key] = filteredNested;
      }

      return acc;
    }

    // Include all other meaningful values (non-empty strings, numbers, booleans)
    acc[key] = value;
    return acc;
  }, {});

  return { ...filtered, ...processedEntries };
}

export function MakeswiftPageShim(props: ComponentPropsWithoutRef<typeof MakeswiftPage>) {
  const metadata = filterMetadata(props.metadata);

  return <MakeswiftPage {...props} metadata={metadata} />;
}
