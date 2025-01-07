'use client';

import { ReactRuntimeProvider, RootStyleRegistry } from '@makeswift/runtime/next';

import { runtime } from '~/lib/makeswift/runtime';
import '~/lib/makeswift/components';

export function MakeswiftProvider({
  previewMode,
  children,
}: {
  previewMode: boolean;
  children: React.ReactNode;
}) {
  return (
    <ReactRuntimeProvider runtime={runtime} previewMode={previewMode}>
      <RootStyleRegistry>{children}</RootStyleRegistry>
    </ReactRuntimeProvider>
  );
}