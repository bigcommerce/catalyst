'use client';

import { useEffect } from 'react';

import { useRouter } from '~/i18n/routing';
import { FORCE_REFRESH_COOKIE, getCookieValue, setCookie } from '~/lib/client-cookies';

export const ForceRefresh = () => {
  const router = useRouter();

  useEffect(() => {
    const shouldRefresh = getCookieValue(FORCE_REFRESH_COOKIE) === 'true';

    if (shouldRefresh) {
      setCookie(FORCE_REFRESH_COOKIE, 'false', { path: '/' });
      router.refresh();
    }
  });

  return null;
};
