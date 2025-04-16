'use client';

import { useEffect } from 'react';

import { useSDK } from './use-b2b-sdk';
import { useRouter } from '~/i18n/routing';
import { setCartId } from '~/lib/cart';



export function useB2BCart(cartId?: string | null) {
  const router = useRouter();
  const sdk = useSDK();
  const handleCartCreated = ({
      data: { cartId = '' },
  }) => {
      void setCartId(cartId).then((error) => {
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
