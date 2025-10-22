'use server';

import { cookies } from 'next/headers';

import type { CurrencyCode } from '~/components/header/fragment';
import { CurrencyCodeSchema } from '~/components/header/schema';

export async function getPreferredCurrencyCode(code?: string): Promise<CurrencyCode | undefined> {
  const cookieStore = await cookies();
  const currencyCode = cookieStore.get('currencyCode')?.value || code;

  if (!currencyCode) {
    return undefined;
  }

  const result = CurrencyCodeSchema.safeParse(currencyCode);

  return result.success ? result.data : undefined;
}

export async function setPreferredCurrencyCode(currencyCode: CurrencyCode): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set('currencyCode', currencyCode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
