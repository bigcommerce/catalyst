import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

export const ReCaptchaSettingsQuery = graphql(`
  query ReCaptchaSettingsQuery {
    site {
      settings {
        reCaptcha {
          failedLoginLockoutDurationSeconds
          isEnabledOnCheckout
          isEnabledOnStorefront
          siteKey
        }
      }
    }
  }
`);

export type ReCaptchaSettings = {
  failedLoginLockoutDurationSeconds: number | null;
  isEnabledOnCheckout: boolean;
  isEnabledOnStorefront: boolean;
  siteKey: string;
};

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
    failedLoginLockoutDurationSeconds: reCaptcha.failedLoginLockoutDurationSeconds ?? null,
    isEnabledOnCheckout: reCaptcha.isEnabledOnCheckout,
    isEnabledOnStorefront: reCaptcha.isEnabledOnStorefront,
    siteKey: reCaptcha.siteKey,
  };
});

/** FormData key used to pass the reCAPTCHA token from client to server actions */
export const RECAPTCHA_TOKEN_FORM_KEY = 'recaptchaToken';
