import { getTranslations } from 'next-intl/server';

import { fetchPaymentWalletButtons } from '~/client/queries/get-wallet-buttons';
import { getCartId } from '~/lib/cart';
import { InitializeButtonProps } from '~/lib/wallet-buttons/types';
import { getWalletButtonOption } from '~/lib/wallet-buttons/utils';

export const createWalletButtonsInitOptions = async (): Promise<InitializeButtonProps[]> => {
  const t = await getTranslations('Cart.Errors');

  const cartId = await getCartId();

  if (!cartId) {
    throw new Error(t('cartNotFound'));
  }

  const availableWalletButtons = await fetchPaymentWalletButtons(cartId);

  return (availableWalletButtons || [])
    .map((methodId) => {
      return getWalletButtonOption(methodId, cartId);
    })
    .filter((item) => !!item);
};
