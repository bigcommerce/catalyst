'use server';

import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

const giftCertificateSchema = z.object({
  code: z.string(),
  balance: z.string(),
  currency_code: z.string(),
});

interface SuccessResponse {
  balance: number;
  currencyCode: string;
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

type LookupResponse = SuccessResponse | ErrorResponse;

export async function lookupGiftCertificateBalance(code: string): Promise<LookupResponse> {
  const t = await getTranslations('GiftCertificate.Actions.Lookup');

  if (!code) {
    return { error: t('noCode') };
  }

  const apiUrl = `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/gift_certificates`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Token': process.env.GIFT_CERTIFICATE_V3_API_TOKEN ?? '',
    Accept: 'application/json',
  };

  try {
    const response = await fetch(`${apiUrl}?limit=1&code=${encodeURIComponent(code)}`, {
      method: 'GET',
      headers,
    });

    if (response.status === 404 || response.status === 204) {
      return { error: t('notFound') };
    }

    if (!response.ok) {
      return { error: t('error') };
    }

    const parseResult = z.array(giftCertificateSchema).safeParse(await response.json());

    if (!parseResult.success) {
      return { error: t('error') };
    }

    const data = parseResult.data;
    const certificate = data.find((cert) => cert.code === code);

    if (!certificate) {
      return { error: t('notFound') };
    }

    return {
      balance: parseFloat(certificate.balance),
      currencyCode: certificate.currency_code,
    };
  } catch (error) {
    return {
      error: t('error'),
      details: error,
    };
  }
}
