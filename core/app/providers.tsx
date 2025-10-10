'use client';

import { ConsentManagerProvider } from '@c15t/nextjs';
import { ConsentManagerCallbacks } from '@c15t/nextjs/client';
import { PropsWithChildren } from 'react';

import { Toaster } from '@/vibes/soul/primitives/toaster';
import { ConsentManagerDialog, CookieBanner } from '~/components/consent-manager';
import { setC15tConsentCookie } from '~/lib/c15t-consent';
import { SearchProvider } from '~/lib/search';

export function Providers({ children }: PropsWithChildren) {
  return (
    <SearchProvider>
      <Toaster position="top-right" />
      <ConsentManagerProvider
        options={{
          mode: 'offline',
          consentCategories: ['necessary', 'marketing'],
        }}
      >
        <ConsentManagerCallbacks
          callbacks={{
            async onConsentSet(response) {
              const res = await setC15tConsentCookie({
                preferences: response.preferences,
                timestamp: new Date(),
              });

              if (!res.ok) {
                throw new Error('Failed to set consent');
              }
            },
          }}
        />
        <CookieBanner />
        <ConsentManagerDialog />
        {children}
      </ConsentManagerProvider>
    </SearchProvider>
  );
}
