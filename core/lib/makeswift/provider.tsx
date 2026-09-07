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
    <ReactRuntimeProvider siteVersion={siteVersion} runtime={runtime}>
      <RootStyleRegistry>{children}</RootStyleRegistry>
    </ReactRuntimeProvider>
  );
}
