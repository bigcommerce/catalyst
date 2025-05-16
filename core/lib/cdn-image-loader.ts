'use client';

import { ImageLoaderProps } from 'next/image';
import { getLqipData, hydrateLqipCache } from './lqip-data';

export default function bcCdnImageLoader({ src, width }: ImageLoaderProps): string {
  const url = src.replace('{:size}', `${width}w`);

  return url;
}

export function getBcLqipUrl(src: string): string {
  return src.replace('{:size}', '10w');
}

export async function getBcLqipData(src: string): Promise<string> {
  const lqipUrl = getBcLqipUrl(src);
  return getLqipData(lqipUrl);
}

export { hydrateLqipCache };
