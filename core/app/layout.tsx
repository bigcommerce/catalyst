import { getSiteVersion } from '@makeswift/runtime/next/server';
import { clsx } from 'clsx';
import { PropsWithChildren } from 'react';

import '../globals.css';

import { fonts } from '~/app/fonts';
import { SiteTheme } from '~/lib/makeswift/components/site-theme';
import { MakeswiftProvider } from '~/lib/makeswift/provider';

import '~/lib/makeswift/components';

export default async function RootLayout({ children }: PropsWithChildren) {
  const siteVersion = await getSiteVersion();

  return (
    <MakeswiftProvider siteVersion={siteVersion}>
      <html className={clsx(fonts.map((f) => f.variable))} lang="en">
        <head>
          <SiteTheme />
        </head>
        <body className="flex min-h-screen flex-col">{children}</body>
      </html>
    </MakeswiftProvider>
  );
}
