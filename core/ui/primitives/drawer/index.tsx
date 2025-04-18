'use client';

import * as Portal from '@radix-ui/react-portal';
import { useEffect, useState } from 'react';

interface DrawerProps {
  children: React.ReactNode;
}

export function Drawer({ children }: DrawerProps) {
  // This hack is needed to prevent hydration errors.
  // The Radix Portal is not rendered correctly server side, so we need to prevent it from rendering until the client side hydration is complete (and `useEffect` is run).
  // The issue is reported here: https://github.com/radix-ui/primitives/issues/1386
  const [doc, setDoc] = useState<Document | null>(null);

  useEffect(() => setDoc(window.document), []);

  return (
    doc && (
      <Portal.Root className="bg-background @container sticky bottom-0 z-10 w-full border-t px-3 py-4 @md:py-5 @xl:px-6 @5xl:px-10">
        {children}
      </Portal.Root>
    )
  );
}
