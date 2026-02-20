'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { createContext, useContext, type PropsWithChildren } from 'react';

import type { ReCaptchaSettings } from '~/lib/recaptcha';

const ReCaptchaContext = createContext<ReCaptchaSettings | null>(null);

export function useReCaptchaSettings(): ReCaptchaSettings | null {
  return useContext(ReCaptchaContext);
}

/** Whether reCAPTCHA is enabled on the storefront (signup, contact, reviews). */
export function useReCaptchaEnabledOnStorefront(): boolean {
  const settings = useReCaptchaSettings();
  return settings?.isEnabledOnStorefront === true && Boolean(settings?.siteKey);
}

interface ReCaptchaProviderProps extends PropsWithChildren {
  settings: ReCaptchaSettings | null;
}

/**
 * Wraps children with reCAPTCHA v3 provider when a site key is configured,
 * so useGoogleReCaptcha() is available. Token is only used when isEnabledOnStorefront is true.
 */
export function ReCaptchaProvider({ settings, children }: ReCaptchaProviderProps) {
  const hasProvider = Boolean(settings?.siteKey);

  return (
    <ReCaptchaContext.Provider value={settings}>
      {hasProvider ? (
        <GoogleReCaptchaProvider reCaptchaKey={settings.siteKey}>
          {children}
        </GoogleReCaptchaProvider>
      ) : (
        children
      )}
    </ReCaptchaContext.Provider>
  );
}
