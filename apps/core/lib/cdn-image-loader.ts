'use client';

export const addCompressionParam = (url: string, lossy: boolean): string => {
  const urlObj = new URL(url);

  const paramValue = lossy ? 'lossy' : 'lossless';

  urlObj.searchParams.set('compression', paramValue);

  return urlObj.toString();
};

export default function bcCdnImageLoader({
  src,
  width,
  height,
  lossy = true,
}: {
  src: string;
  width: number;
  height?: number;
  lossy?: boolean;
}): string {
  let url;

  if (height) {
    url = src.replace('{:size}', `${width}x${height}`);
  }

  url = src.replace('{:size}', `${width}w`);

  url = addCompressionParam(url, lossy);

  return url;
}
