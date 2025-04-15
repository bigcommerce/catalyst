'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

import { useSDK } from './use-b2b-sdk';
import { syncCart } from './sync-cart';
import { useRouter } from '~/i18n/routing';



export function useB2BCart(cartId?: string | null) {
  const router = useRouter();
  const sdk = useSDK();
  const handleCartCreated = ({
      data: { cartId = '' },
  }) => {
      void syncCart(cartId).then((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
          router.refresh();
          return;
      });
  }

  useEffect(() => {
    sdk?.callbacks?.addEventListener('on-cart-created', handleCartCreated);

    return () => {
      sdk?.callbacks?.removeEventListener('on-cart-created', handleCartCreated);
    };
  }, [sdk]);

  useEffect(() => {
    if (sdk && cartId && cartId !== sdk.utils?.cart?.getEntityId()) {
        void sdk.utils?.cart?.setEntityId(cartId);
    }
  }, [sdk, cartId]);

  return null;
}
