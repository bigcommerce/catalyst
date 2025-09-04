'use client';

import { useSearchParams } from 'next/navigation';
import { SearchParams } from 'nuqs';
import { useEffect } from 'react';

import { useRouter } from '~/i18n/routing';

// Not-so-great workaround for https://github.com/js/issues/59407
export const SearchParamsRouterRefresh = ({
  searchParamsServer,
}: {
  searchParamsServer: SearchParams;
}) => {
  const router = useRouter();
  const searchParamsClient = useSearchParams();
  const paramsAreEqual = Array.from(searchParamsClient.entries()).every(
    ([key, value]) => searchParamsServer[key] === value,
  );

  useEffect(() => {
    if (!paramsAreEqual) {
      router.refresh();
    }
  }, [router, paramsAreEqual]);

  return null;
};
