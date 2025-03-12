'use client';

import { useRouter } from 'next/compat/router';
import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

import { useSDK } from './use-b2b-sdk';

const handleLogout = () => {
  void signOut({
    redirect: true,
    redirectTo: '/login',
  }).catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Failed to sign out:', error);
  });
};

const sections: Record<string, string> = {
  register: 'REGISTER_ACCOUNT',
  orders: 'ORDERS',
};

export function useB2BAuth(token?: string) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sdk = useSDK();

  useEffect(() => {
    sdk?.callbacks?.addEventListener('on-logout', handleLogout);

    return () => {
      sdk?.callbacks?.removeEventListener('on-logout', handleLogout);
    };
  }, [sdk]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const section = params.get('section');

    if (!section || !sdk) {
      return;
    }

    if (sections[section]) {
      params.delete('section');
      window.history.replaceState({}, '', `${window.location.pathname}${params}`);
      sdk.utils?.openPage(sections[section]);
    }
  }, [searchParams, sdk, router]);

  useEffect(() => {
    if (sdk && token && token !== sdk.utils?.user.getB2BToken()) {
      void sdk.utils?.user.loginWithB2BStorefrontToken(token);
    }
  }, [sdk, token]);

  return null;
}
