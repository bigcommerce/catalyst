import { getTranslations } from 'next-intl/server';

import { setCartId } from '~/lib/cart';
import { serverToast } from '~/lib/server-toast';

export async function handleLoginCart(guestCartId?: string, loginResultCartId?: string) {
  const t = await getTranslations('Cart');

  if (guestCartId === undefined && loginResultCartId !== undefined) {
    await serverToast.info(t('cartRestored'), { position: 'top-center' });
  }

  if (loginResultCartId && guestCartId && loginResultCartId !== guestCartId) {
    await serverToast.info(t('cartCombined'), { position: 'top-center' });
  }

  if (loginResultCartId) {
    await setCartId(loginResultCartId);
  }
}
