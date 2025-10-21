'use client';

import { ReactRuntimeProvider, RootStyleRegistry, type SiteVersion } from '@makeswift/runtime/next';
import { createContext, useEffect, useState } from 'react';

import { runtime } from '~/lib/makeswift/runtime';
import '~/lib/makeswift/components';

const FlickerContext = createContext(0);

export function MakeswiftProvider({
  children,
  siteVersion,
}: {
  children: React.ReactNode;
  siteVersion: SiteVersion | null;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => setValue(1), []);

  return (
    <ReactRuntimeProvider runtime={runtime} siteVersion={siteVersion}>
      <FlickerContext.Provider value={value}>
        <RootStyleRegistry enableCssReset={false}>{children}</RootStyleRegistry>
      </FlickerContext.Provider>
    </ReactRuntimeProvider>
  );
}
