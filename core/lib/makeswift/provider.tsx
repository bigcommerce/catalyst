'use client';

import { ReactRuntimeProvider, RootStyleRegistry, type SiteVersion } from '@makeswift/runtime/next';

import { runtime } from '~/lib/makeswift/runtime';
import '~/lib/makeswift/components';

export function MakeswiftProvider({
  children,
  locale,
  siteVersion,
}: {
  children: React.ReactNode;
  locale?: string;
  siteVersion: SiteVersion | null;
}) {
  return (
    <ReactRuntimeProvider locale={locale} runtime={runtime} siteVersion={siteVersion}>
      <RootStyleRegistry enableCssReset={false}>{children}</RootStyleRegistry>
    </ReactRuntimeProvider>
  );
}
