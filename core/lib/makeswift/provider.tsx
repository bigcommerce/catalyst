'use client';

import { ReactRuntimeProvider, RootStyleRegistry } from '@makeswift/runtime/next';
import { type SiteVersion } from '@makeswift/runtime/next';

import { runtime } from '~/lib/makeswift/runtime';
import '~/lib/makeswift/components';

export function MakeswiftProvider({
  children,
  previewMode,
  siteVersion,
}: {
  children: React.ReactNode;
  previewMode: boolean;
  siteVersion: SiteVersion | null;
}) {
  return (
    <ReactRuntimeProvider runtime={runtime} siteVersion={siteVersion}>
      <RootStyleRegistry enableCssReset={false}>{children}</RootStyleRegistry>
    </ReactRuntimeProvider>
  );
}
