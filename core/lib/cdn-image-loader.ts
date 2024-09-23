'use client';

export default function bcCdnImageLoader({
  src,
  width,
  height,
}: {
  src: string;
  width: number;
  height?: number;
}): string {
  let url;

  if (height) {
    url = src.replace('{:size}', `${width}x${height}`);
  }

  url = src.replace('{:size}', `${width}w`);

  return url;
}
