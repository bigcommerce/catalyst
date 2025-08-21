'use client';

import { useCallback, useEffect } from 'react';

import { useRouter } from '~/i18n/routing';
import { setCartId } from '~/lib/cart';

import { useSDK } from './use-b2b-sdk';

export function useB2BCart(id?: string | null) {
  const router = useRouter();
  const sdk = useSDK();

  const handleCartCreated = useCallback(
    ({ data: { cartId = '' } }) => {
      void setCartId(cartId)
        .then(() => {
          router.refresh();
        })
        .catch((error: unknown) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    },
    [router],
  );

  useEffect(() => {
    sdk?.callbacks?.addEventListener('on-cart-created', handleCartCreated);

    return () => {
      sdk?.callbacks?.removeEventListener('on-cart-created', handleCartCreated);
    };
  }, [sdk, handleCartCreated]);

  useEffect(() => {
    if (sdk && id && id !== sdk.utils?.cart?.getEntityId()) {
      sdk.utils?.cart?.setEntityId(id);
    }
  }, [sdk, id]);

  return null;
}
