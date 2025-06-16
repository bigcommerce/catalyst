import { z } from 'zod';

import { testEnv } from '~/tests/environment';

import { httpClient } from '../client';
import { apiResponseSchema } from '../schema';

import { CurrenciesApi, Currency, CurrencyAssignments } from '.';

const CurrencyAssignmentSchema = z
  .object({
    enabled_currencies: z.array(z.string()),
    default_currency: z.string(),
  })
  .transform(
    (data): CurrencyAssignments => ({
      enabledCurrencies: data.enabled_currencies,
      defaultCurrency: data.default_currency,
    }),
  );

const CurrencySchema = z
  .object({
    id: z.number(),
    is_default: z.boolean(),
    enabled: z.boolean(),
    decimal_places: z.number(),
    currency_exchange_rate: z.coerce.number(),
    currency_code: z.string(),
  })
  .transform(
    (data): Currency => ({
      id: data.id,
      isDefault: data.is_default,
      isEnabled: data.enabled,
      decimalPlaces: data.decimal_places,
      exchangeRate: data.currency_exchange_rate,
      currencyCode: data.currency_code,
    }),
  );

export const currenciesHttpClient: CurrenciesApi = {
  getCurrencyAssignments: async (): Promise<CurrencyAssignments> => {
    const resp = await httpClient
      .get(`/v3/channels/${testEnv.BIGCOMMERCE_CHANNEL_ID ?? 1}/currency-assignments`)
      .parse(apiResponseSchema(CurrencyAssignmentSchema));

    return resp.data;
  },
  getCurrencies: async (): Promise<Currency[]> => {
    const resp = await httpClient.get(`/v2/currencies?limit=250`).parse(z.array(CurrencySchema));

    return resp;
  },
};
