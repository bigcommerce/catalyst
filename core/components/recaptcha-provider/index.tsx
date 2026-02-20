'use client';

import { createContext, useContext, type PropsWithChildren } from 'react';

import type { ReCaptchaSettings } from '~/lib/recaptcha/constants';

const ReCaptchaContext = createContext<ReCaptchaSettings | null>(null);

export function useReCaptchaSettings(): ReCaptchaSettings | null {
  return useContext(ReCaptchaContext);
}

/** Site key when reCAPTCHA is enabled on the storefront; undefined otherwise. */
export function useReCaptchaSiteKey(): string | undefined {
  const settings = useReCaptchaSettings();
  return settings?.isEnabledOnStorefront === true && settings?.siteKey
    ? settings.siteKey
    : undefined;
}

interface ReCaptchaProviderProps extends PropsWithChildren {
  settings: ReCaptchaSettings | null;
}

/**
 * Provides reCAPTCHA settings (e.g. siteKey) via context.
 * Forms use react-google-recaptcha (v2) and receive siteKey via props from server.
 */
export function ReCaptchaProvider({ settings, children }: ReCaptchaProviderProps) {
  return (
    <ReCaptchaContext.Provider value={settings}>{children}</ReCaptchaContext.Provider>
  );
}
