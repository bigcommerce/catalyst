'use client';

import { HighlightInit } from '@highlight-run/next/client';

export function HighlightWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HighlightInit
        networkRecording={{
          enabled: true,
          recordHeadersAndBody: true,
        }}
        projectId={process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID || 'ng2zj60g'}
        serviceName="catalyst-storefront"
        tracingOrigins
      />
      {children}
    </>
  );
}