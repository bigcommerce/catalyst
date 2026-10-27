'use server';

import { cookies } from 'next/headers';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
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

const getDefaultCurrencyCode = async () => {
  const { data } = await client.fetch({
    document: DefaultCurrencyQuery,
    fetchOptions: { cache: 'no-store' },
  });

  return data.site.settings?.currency.defaultCurrency;
};

export async function getPreferredCurrencyCode(): Promise<CurrencyCode | undefined> {
  const cookieStore = await cookies();
  const currencyCode = cookieStore.get('currencyCode')?.value;

  if (!currencyCode) {
    return undefined;
  }

  const result = CurrencyCodeSchema.safeParse(currencyCode);

  return result.success ? result.data : undefined;
}

export async function setPreferredCurrencyCode(currencyCode: CurrencyCode): Promise<void> {
  const cookieStore = await cookies();
  const defaultCurrencyCode = await getDefaultCurrencyCode().catch(() => undefined);

  // Queries resolve an omitted currency to the store default, so storing the default would only
  // split the Data Cache into a second entry with the same prices.
  if (currencyCode === defaultCurrencyCode) {
    cookieStore.delete('currencyCode');

    return;
  }

  // The currency preference is a functionality cookie; without consent the
  // selected currency still applies to the cart but the preference isn't stored.
  if (!(await hasConsentFor('functionality'))) {
    return;
  }

  cookieStore.set('currencyCode', currencyCode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
