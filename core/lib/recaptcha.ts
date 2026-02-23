import 'server-only';

import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import type { ReCaptchaSettings } from './recaptcha/constants';

export { RECAPTCHA_TOKEN_FORM_KEY } from './recaptcha/constants';
export type { ReCaptchaSettings } from './recaptcha/constants';

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

export const getRecaptchaSiteKey = cache(async (): Promise<string | undefined> => {
  const settings = await getReCaptchaSettings();
  return settings?.isEnabledOnStorefront === true && settings?.siteKey
    ? settings.siteKey
    : undefined;
});
