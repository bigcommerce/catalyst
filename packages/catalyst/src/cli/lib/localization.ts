import { z } from 'zod';

import { assertAuthorized } from './auth-errors';
import { getTelemetry } from './telemetry';

const allowedLocales = [
  'en',
  'da',
  'es-AR',
  'es-CL',
  'es-CO',
  'es-MX',
  'es-PE',
  'es-419',
  'es',
  'it',
  'nl',
  'pl',
  'pt',
  'de',
  'fr',
  'ja',
  'no',
  'pt-BR',
  'sv',
];

const AvailableLocalesSuccessSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      fallback: z.string().nullable(),
      is_supported: z.boolean(),
    }),
  ),
});

export const getAvailableLocales = async (
  storeHash: string,
  accessToken: string,
  apiHost: string,
) => {
  const response = await fetch(
    `https://${apiHost}/stores/${storeHash}/v3/settings/store/available-locales`,
    {
      method: 'GET',
      headers: {
        'X-Auth-Token': accessToken,
        'X-Correlation-Id': getTelemetry().correlationId,
        Accept: 'application/json',
      },
    },
  );

  assertAuthorized(response);

  if (!response.ok) {
    throw new Error(
      `GET /v3/settings/store/available-locales failed: ${response.status} ${response.statusText}`,
    );
  }

  return AvailableLocalesSuccessSchema.parse(await response.json())
    .data.filter(({ id }) => allowedLocales.includes(id))
    .map(({ name, id }) => ({ name: `${name} (${id})`, value: id }));
};
