import { getTranslations } from 'next-intl/server';

import { getPaymentWallets } from '~/app/[locale]/(default)/cart/page-data';
import { getCartId } from '~/lib/cart';
import { Option } from '~/lib/wallet-buttons/types';
import { getWalletButtonOption } from '~/lib/wallet-buttons/utils';

export const createWalletButtonsInitOptions = async (): Promise<Option[]> => {
  const t = await getTranslations('Cart.Errors');

  const cartId = await getCartId();

  if (!cartId) {
    throw new Error(t('cartNotFound'));
  }

  const methodIds = await getPaymentWallets({
    filters: {
      cartEntityId: cartId,
    },
  });

  return methodIds
    .map((methodId) => {
      return getWalletButtonOption(methodId, cartId);
    })
    .filter((item) => !!item);
};
