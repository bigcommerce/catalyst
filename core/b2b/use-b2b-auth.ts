'use client';

import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

import { toast } from '@/vibes/soul/primitives/toaster';

import { login } from './server-login';
import { useSDK } from './use-b2b-sdk';

enum LandingLocations {
  Home = '0',
  Orders = '1',
  Checkout = '2',
}

const handleRegistered = ({ data: { email, password, landingLoginLocation } }: Data) => {
  void login(email, password).then((error) => {
    if (error) {
      toast.error(error, {
        dismissLabel: 'Dismiss',
        position: 'top-right',
      });

      return;
    }

    if (landingLoginLocation === LandingLocations.Home) {
      window.location.href = '/';
    } else if (landingLoginLocation === LandingLocations.Checkout) {
      window.location.href = '/checkout';
    } else {
      window.location.href = '/?section=orders';
    }
  });
};

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

interface Data {
  data: {
    email: string;
    password: string;
    landingLoginLocation: string;
  };
}

export function useB2BAuth(token?: string) {
  const searchParams = useSearchParams();
  const sdk = useSDK();

  useEffect(() => {
    sdk?.callbacks?.addEventListener('on-logout', handleLogout);
    sdk?.callbacks?.addEventListener('on-registered', handleRegistered);

    return () => {
      sdk?.callbacks?.removeEventListener('on-logout', handleLogout);
      sdk?.callbacks?.removeEventListener('on-registered', handleRegistered);
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
  }, [searchParams, sdk]);

  useEffect(() => {
    if (sdk && token && token !== sdk.utils?.user.getB2BToken()) {
      void sdk.utils?.user.loginWithB2BStorefrontToken(token);
    }
  }, [sdk, token]);

  return null;
}
