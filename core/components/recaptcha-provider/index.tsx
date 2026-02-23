'use client';

import { createContext, type PropsWithChildren, useContext } from 'react';

import type { ReCaptchaSettings } from '~/lib/recaptcha/constants';

const ReCaptchaContext = createContext<ReCaptchaSettings | null>(null);

export function useReCaptchaSettings(): ReCaptchaSettings | null {
  return useContext(ReCaptchaContext);
}

export function useReCaptchaSiteKey(): string | undefined {
  const settings = useReCaptchaSettings();

  return settings?.isEnabledOnStorefront === true && settings.siteKey
    ? settings.siteKey
    : undefined;
}

interface ReCaptchaProviderProps extends PropsWithChildren {
  settings: ReCaptchaSettings | null;
}

export function ReCaptchaProvider({ settings, children }: ReCaptchaProviderProps) {
  return <ReCaptchaContext.Provider value={settings}>{children}</ReCaptchaContext.Provider>;
}
