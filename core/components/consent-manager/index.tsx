'use client';

import { gtag } from '@c15t/scripts/google-tag';
import type { PropsWithChildren } from 'react';

import { ConsentManagerDialog } from './consent-manager-dialog';
import { type C15tScripts, ConsentManagerProvider } from './consent-providers';
import { CookieBanner } from './cookie-banner';

interface GtagConfig {
  gaId?: string;
  category?: 'measurement' | 'marketing';
  dataLayerName?: string;
  nonce?: string;
}

interface ConsentManagerProps extends PropsWithChildren {
  scripts: C15tScripts;
  gtagConfig?: GtagConfig;
}

export function ConsentManager({ children, scripts, gtagConfig }: ConsentManagerProps) {
  const scriptsWithPrebuiltScripts = gtagConfig?.gaId
    ? [
        gtag({
          id: gtagConfig.gaId,
          category: gtagConfig.category ?? 'measurement',
          script: {
            src: gtagConfig.dataLayerName
              ? `https://www.googletagmanager.com/gtag/js?id=${gtagConfig.gaId}&l=${gtagConfig.dataLayerName}`
              : `https://www.googletagmanager.com/gtag/js?id=${gtagConfig.gaId}`,
            nonce: gtagConfig.nonce,
          },
        }),
        ...scripts,
      ]
    : scripts;

  return (
    <ConsentManagerProvider scripts={scriptsWithPrebuiltScripts}>
      <ConsentManagerDialog />
      <CookieBanner />
      {children}
    </ConsentManagerProvider>
  );
}
