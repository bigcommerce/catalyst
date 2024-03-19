'use client';

export const addLossyCompressionParam = (url: string): string => {
  const urlObj = new URL(url);

  urlObj.searchParams.set('compression', 'lossy');

  return urlObj.toString();
};

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

  // Add compression=lossy param so the BC CDN will compress the image
  // This will be added into the GQL API in the future so this can be removed later
  url = addLossyCompressionParam(url);

  return url;
}