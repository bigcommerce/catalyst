'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { getFormatter, getTranslations } from 'next-intl/server';

import { addCartLineItem } from '~/client/mutations/add-cart-line-item';
import { createCartWithGiftCertificate } from '../_mutations/create-cart-with-gift-certificate';
import { getCart } from '~/client/queries/get-cart';
import { TAGS } from '~/client/tags';

const GIFT_CERTIFICATE_THEMES = ['GENERAL', 'BIRTHDAY', 'BOY', 'CELEBRATION', 'CHRISTMAS', 'GIRL', 'NONE'];
type giftCertificateTheme = "GENERAL" | "BIRTHDAY" | "BOY" | "CELEBRATION" | "CHRISTMAS" | "GIRL" | "NONE";

export const addGiftCertificateToCart = async (data: FormData) => {
  const format = await getFormatter();
  const t = await getTranslations('GiftCertificate.Actions.AddToCart');

  let theme = String(data.get('theme')) as giftCertificateTheme;
  const amount = Number(data.get('amount'));
  const senderEmail = String(data.get('senderEmail'));
  const senderName = String(data.get('senderName'));
  const recipientEmail = String(data.get('recipientEmail'));
  const recipientName = String(data.get('recipientName'));
  const message = data.get('message') ? String(data.get('message')) : null;

  if (!GIFT_CERTIFICATE_THEMES.includes(theme)) {
    theme = 'GENERAL'
  }

  const giftCertificate = {
    name: t('certificateName', {
      amount: format.number(amount, {
        style: 'currency',
        currency: 'USD', // TODO: Determine this from the selected currency
      })
    }),
    theme,
    amount,
    "quantity": 1,
    "sender": {
      "email": senderEmail,
      "name": senderName,
    },
    "recipient": {
      "email": recipientEmail,
      "name": recipientName,
    },
    message,
  }

  const cartId = cookies().get('cartId')?.value;
  let cart;

  try {
    cart = await getCart(cartId);

    if (cart) {
      cart = await addCartLineItem(cart.entityId, {
        giftCertificates: [
          giftCertificate
        ],
      });

      if (!cart?.entityId) {
        return { status: 'error', error: t('error') };
      }

      revalidateTag(TAGS.cart);

      return { status: 'success', data: cart };
    }

    cart = await createCartWithGiftCertificate([giftCertificate]);

    if (!cart?.entityId) {
      return { status: 'error', error: t('error') };
    }

    cookies().set({
      name: 'cartId',
      value: cart.entityId,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });

    revalidateTag(TAGS.cart);

    return { status: 'success', data: cart };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: t('error') };
  }
};
