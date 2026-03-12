import 'server-only';

import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { RECAPTCHA_TOKEN_FORM_KEY, type ReCaptchaSettings } from './recaptcha/constants';

export { RECAPTCHA_TOKEN_FORM_KEY } from './recaptcha/constants';
export type { ReCaptchaSettings } from './recaptcha/constants';

export const ReCaptchaSettingsQuery = graphql(`
  query ReCaptchaSettingsQuery {
    site {
      settings {
        reCaptcha {
          isEnabledOnStorefront
          siteKey
        }
      }
    }
  }
`);

export const getReCaptchaSettings = cache(async (): Promise<ReCaptchaSettings | null> => {
  const { data } = await client.fetch({
    document: ReCaptchaSettingsQuery,
    fetchOptions: { next: { revalidate } },
  });

  const reCaptcha = data.site.settings?.reCaptcha;

  if (!reCaptcha?.siteKey) {
    return null;
  }

  return {
    isEnabledOnStorefront: reCaptcha.isEnabledOnStorefront,
    siteKey: reCaptcha.siteKey,
  };
});

export const getRecaptchaSiteKey = cache(async (): Promise<string | undefined> => {
  const settings = await getReCaptchaSettings();

  return settings?.isEnabledOnStorefront === true && settings.siteKey
    ? settings.siteKey
    : undefined;
});

export async function getRecaptchaFromForm(
  formData: FormData,
): Promise<{ siteKey: string | undefined; token: string }> {
  const siteKey = await getRecaptchaSiteKey();
  const raw = formData.get(RECAPTCHA_TOKEN_FORM_KEY);
  const token = typeof raw === 'string' ? raw : '';

  return { siteKey, token };
}

export function assertRecaptchaTokenPresent(
  siteKey: string | undefined,
  token: string,
  recaptchaRequiredMessage: string,
): { success: true; token: string | undefined } | { success: false; formErrors: [string] } {
  if (!siteKey) {
    return { success: true, token: undefined };
  }

  const tokenValue = token.trim();

  if (!tokenValue) {
    return { success: false, formErrors: [recaptchaRequiredMessage] };
  }

  return { success: true, token: tokenValue };
}
