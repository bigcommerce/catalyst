'use server';

import { cookies } from 'next/headers';
import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import type { CurrencyCode } from '~/components/header/fragment';
import { CurrencyCodeSchema } from '~/components/header/schema';
import { hasConsentFor } from '~/lib/consent-manager/has-consent-for';

const DefaultCurrencyQuery = graphql(`
  query DefaultCurrencyQuery {
    site {
      settings {
        currency {
          defaultCurrency
        }
      }
    }
  }
`);

const getDefaultCurrencyCode = cache(async () => {
  const { data } = await client.fetch({
    document: DefaultCurrencyQuery,
    fetchOptions: { next: { revalidate } },
  });

  return data.site.settings?.currency.defaultCurrency;
});

/**
 * The currency stored in the cookie, as chosen. Use for mutations, where the cached store default
 * used by `getPreferredCurrencyCode` could be stale.
 *
 * @returns {Promise<CurrencyCode | undefined>} `undefined` when the cookie is absent or invalid.
 */
export async function getSelectedCurrencyCode(): Promise<CurrencyCode | undefined> {
  const cookieStore = await cookies();
  const currencyCode = cookieStore.get('currencyCode')?.value;

  if (!currencyCode) {
    return undefined;
  }

  const result = CurrencyCodeSchema.safeParse(currencyCode);

  return result.success ? result.data : undefined;
}

export async function getPreferredCurrencyCode(): Promise<CurrencyCode | undefined> {
  const currencyCode = await getSelectedCurrencyCode();

  if (!currencyCode) {
    return undefined;
  }

  // Queries resolve an omitted currency to the store default, so passing the default explicitly
  // would only split the Data Cache into a second entry with the same prices.
  const defaultCurrencyCode = await getDefaultCurrencyCode().catch(() => undefined);

  return currencyCode === defaultCurrencyCode ? undefined : currencyCode;
}

export async function setPreferredCurrencyCode(currencyCode: CurrencyCode): Promise<void> {
  // The currency preference is a functionality cookie; without consent the
  // selected currency still applies to the cart but the preference isn't stored.
  if (!(await hasConsentFor('functionality'))) {
    return;
  }

  const cookieStore = await cookies();

  cookieStore.set('currencyCode', currencyCode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
