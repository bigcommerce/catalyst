'use client';

import { ImageLoaderProps } from 'next/image';

export default function bcCdnImageLoader({ src, width }: ImageLoaderProps): string {
  const url = src.replace('{:size}', `${width}w`);

  return url;
}
