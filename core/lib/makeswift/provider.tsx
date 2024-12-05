'use client';

import { ReactRuntimeProvider, RootStyleRegistry } from '@makeswift/runtime/next';

import { runtime } from '~/lib/makeswift/runtime';
import '~/lib/makeswift/components';

export function MakeswiftProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactRuntimeProvider runtime={runtime}>
      <RootStyleRegistry>{children}</RootStyleRegistry>
    </ReactRuntimeProvider>
  );
}
