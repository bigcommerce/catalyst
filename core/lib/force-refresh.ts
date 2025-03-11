import { cookies } from 'next/headers';

import { FORCE_REFRESH_COOKIE } from './client-cookies';

export async function setForceRefreshCookie() {
  const cookieStore = await cookies();
  const forceRefreshCookie = cookieStore.get(FORCE_REFRESH_COOKIE);

  if (!forceRefreshCookie) {
    cookieStore.set(FORCE_REFRESH_COOKIE, 'true', {
      httpOnly: false,
      secure: false,
    });
  } else if (forceRefreshCookie.value === 'false') {
    cookieStore.delete(FORCE_REFRESH_COOKIE);
  }
}
