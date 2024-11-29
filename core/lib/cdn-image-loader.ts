'use client';

export default function bcCdnImageLoader({
  src,
  width,
  height
}: {
  src: string;
  width: number;
  height?: number;
}): string {
  let url;

  url = src.replace('{:size}', `${width}w`);

  if (height) {
    url = src.replace('{:size}', `${width}x${height}`);
  }

  return url;
}