'use server'

import { getTranslations } from 'next-intl/server';

export async function lookupGiftCertificateBalance(code: string) {
  const t = await getTranslations('GiftCertificate.Actions.Lookup');

  if (!code) {
    return { error: t('noCode') }
  }

  const apiUrl = `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/gift_certificates`
  const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Token': process.env.GIFT_CERTIFICATE_V3_API_TOKEN ?? '',
    'Accept': 'application/json'
  }

  try {
    const response = await fetch(`${apiUrl}?limit=1&code=${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: headers
    })

    if (response.status === 404 || response.status === 204) {
      return { error: t('notFound') }
    }

    if (!response.ok) {
      console.error(`v2 Gift Certificate API responded with status ${response.status}: ${response.statusText}`)
      return { error: t('error') }
    }

    const data = await response.json()

    if (Array.isArray(data) && data.length > 0 && typeof data[0].balance !== 'undefined') {
      // There isn't a way to query the exact code in the v2 Gift Certificate API, 
      // so we'll loop through the results to make sure it's not a partial match
      for (const certificate of data) {
        if (certificate.code === code) {
          return { balance: parseFloat(data[0].balance), currencyCode: data[0].currency_code }
        }
      }

      // No exact match, so consider it not found
      return { error: t('notFound') }
    } else {
      console.error('Unexpected v2 Gift Certificate API response structure')
      return { error: t('error') }
    }
  } catch (error) {
    console.error('Error checking gift certificate balance:', error)
    return { error: t('error') }
  }
}
