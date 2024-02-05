import { cache } from 'react';

export const searchParamsContext = cache(() => new Map([['searchParams', {}]]));

export const useSearchParamsProvider = (searchParams?: {
  [key: string]: string | string[] | undefined;
}) => {
  const global = searchParamsContext();

  if (searchParams) {
    global.set('searchParams', searchParams);
  }

  return global.get('searchParams');
};
