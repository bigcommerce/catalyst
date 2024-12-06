'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { getFormatter, getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { addCartLineItem } from '~/client/mutations/add-cart-line-item';
import { getCart } from '~/client/queries/get-cart';
import { TAGS } from '~/client/tags';

import { createCartWithGiftCertificate } from '../_mutations/create-cart-with-gift-certificate';

const giftCertificateThemes = [
  'GENERAL',
  'BIRTHDAY',
  'BOY',
  'CELEBRATION',
  'CHRISTMAS',
  'GIRL',
  'NONE',
] as const;

const GiftCertificateThemeSchema = z.enum(giftCertificateThemes);

const ValidatedFormDataSchema = z.object({
  theme: GiftCertificateThemeSchema,
  amount: z.number().positive(),
  senderEmail: z.string().email(),
  senderName: z.string().min(1),
  recipientEmail: z.string().email(),
  recipientName: z.string().min(1),
  message: z.string().nullable(),
});

type ValidatedFormData = z.infer<typeof ValidatedFormDataSchema>;

const CartResponseSchema = z.object({
  status: z.enum(['success', 'error']),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

type CartResponse = z.infer<typeof CartResponseSchema>;

function parseFormData(data: FormData): ValidatedFormData {
  const theme = data.get('theme');
  const amount = data.get('amount');
  const senderEmail = data.get('senderEmail');
  const senderName = data.get('senderName');
  const recipientEmail = data.get('recipientEmail');
  const recipientName = data.get('recipientName');
  const message = data.get('message');

  // Parse and validate the form data
  const validatedData = ValidatedFormDataSchema.parse({
    theme,
    amount: amount ? Number(amount) : undefined,
    senderEmail,
    senderName,
    recipientEmail,
    recipientName,
    message: message ? String(message) : null,
  });

  return validatedData;
}

export async function addGiftCertificateToCart(data: FormData): Promise<CartResponse> {
  const format = await getFormatter();
  const t = await getTranslations('GiftCertificate.Actions.AddToCart');

  try {
    const validatedData = parseFormData(data);

    const giftCertificate = {
      name: t('certificateName', {
        amount: format.number(validatedData.amount, {
          style: 'currency',
          currency: 'USD',
        }),
      }),
      theme: validatedData.theme,
      amount: validatedData.amount,
      quantity: 1,
      sender: {
        email: validatedData.senderEmail,
        name: validatedData.senderName,
      },
      recipient: {
        email: validatedData.recipientEmail,
        name: validatedData.recipientName,
      },
      message: validatedData.message,
    };

    const cartId = cookies().get('cartId')?.value;
    let cart;

    if (cartId) {
      cart = await getCart(cartId);
    }

    if (cart) {
      cart = await addCartLineItem(cart.entityId, {
        giftCertificates: [giftCertificate],
      });

      if (!cart?.entityId) {
        return CartResponseSchema.parse({
          status: 'error',
          error: t('error'),
        });
      }

      revalidateTag(TAGS.cart);

      return CartResponseSchema.parse({
        status: 'success',
        data: cart,
      });
    }

    cart = await createCartWithGiftCertificate([giftCertificate]);

    if (!cart?.entityId) {
      return CartResponseSchema.parse({
        status: 'error',
        error: t('error'),
      });
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

    return CartResponseSchema.parse({
      status: 'success',
      data: cart,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      const errorMessage = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');

      return CartResponseSchema.parse({
        status: 'error',
        error: errorMessage,
      });
    }

    if (error instanceof Error) {
      return CartResponseSchema.parse({
        status: 'error',
        error: error.message,
      });
    }

    return CartResponseSchema.parse({
      status: 'error',
      error: t('error'),
    });
  }
}
