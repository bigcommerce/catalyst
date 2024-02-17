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
  if (height) {
    return src.replace('{:size}', `${width}x${height}`);
  }

  return src.replace('{:size}', `${width}w`);
}
