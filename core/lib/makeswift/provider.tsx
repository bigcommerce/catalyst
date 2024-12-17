'use client';

import { ReactRuntimeProvider, RootStyleRegistry } from '@makeswift/runtime/next';

import { runtime } from '~/lib/makeswift/runtime';
import '~/lib/makeswift/components';

export function MakeswiftProvider({
  children,
  previewMode,
}: {
  children: React.ReactNode;
  previewMode: boolean;
}) {
  return (
    <ReactRuntimeProvider previewMode={previewMode} runtime={runtime}>
      <RootStyleRegistry>{children}</RootStyleRegistry>
    </ReactRuntimeProvider>
  );
}
