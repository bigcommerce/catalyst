'use client';

import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useCallback, useEffect } from 'react';

import { usePathname } from '~/i18n/routing';

export function useB2BAuth(session: Session | null) {
  const pathname = usePathname();

  const handleB2BLogout = useCallback(async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: '/login',
      });
    } catch (error) {
      console.error('Failed to handle B2B logout:', error);
    }
  }, []);

  const handleLogout = useCallback(() => {
    void handleB2BLogout();
  }, [handleB2BLogout]);

  useEffect(() => {
    // To prevent race conditions, isCleanedUp is a flag to check
    // for component unmount state before performing actions
    let isCleanedUp = false;
    const intervals: NodeJS.Timeout[] = [];

    async function attemptLogin() {
      if (isCleanedUp) return;

      const b2b = window.b2b;

      if (!b2b?.utils) return;

      if (b2b.utils.user.getB2BToken() === session?.b2bToken) {
        return;
      }

      if (session?.b2bToken) {
        await b2b.utils.user.loginWithB2BStorefrontToken(session.b2bToken);

        return;
      }

      console.warn('Could not initialize B2B. Trying again...');
    }

    const loginInterval = setInterval(() => {
      void attemptLogin();
    }, 100);

    intervals.push(loginInterval);

    const registerLogoutListener = setInterval(() => {
      if (window.b2b?.callbacks?.addEventListener) {
        window.b2b.callbacks.addEventListener('on-logout', handleLogout);
        clearInterval(registerLogoutListener);
      }
    }, 100);

    intervals.push(registerLogoutListener);

    return () => {
      isCleanedUp = true;
      intervals.forEach(clearInterval);
      window.b2b?.callbacks?.removeEventListener('on-logout', handleLogout);
    };
  }, [session, pathname, handleLogout]);

  return null;
}
