'use client';

import { ReactRuntimeProvider, RootStyleRegistry, type SiteVersion } from '@makeswift/runtime/next';

import { runtime } from '~/lib/makeswift/runtime';
import '~/lib/makeswift/components';

export function MakeswiftProvider({
  children,
  siteVersion,
}: {
  children: React.ReactNode;
  siteVersion: SiteVersion | null;
}) {
  return (
    <ReactRuntimeProvider
      apiOrigin={process.env.NEXT_PUBLIC_MAKESWIFT_API_ORIGIN}
      appOrigin={process.env.NEXT_PUBLIC_MAKESWIFT_APP_ORIGIN}
      runtime={runtime}
      siteVersion={siteVersion}
    >
      <RootStyleRegistry enableCssReset={false}>{children}</RootStyleRegistry>
    </ReactRuntimeProvider>
  );
}
