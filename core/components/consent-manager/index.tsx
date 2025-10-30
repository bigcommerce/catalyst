'use client';

import type { PropsWithChildren } from 'react';

import { ConsentManagerDialog } from './consent-manager-dialog';
import { type C15tScripts, ConsentManagerProvider } from './consent-providers';
import { CookieBanner } from './cookie-banner';

interface ConsentManagerProps extends PropsWithChildren {
  scripts: C15tScripts;
}

export function ConsentManager({ children, scripts }: ConsentManagerProps) {
  return (
    <ConsentManagerProvider scripts={scripts}>
      <ConsentManagerDialog />
      <CookieBanner />
      {children}
    </ConsentManagerProvider>
  );
}
