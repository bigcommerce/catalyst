import { clsx } from 'clsx';
import { PropsWithChildren } from 'react';

import '../globals.css';

import { fonts } from '~/app/fonts';

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html className={clsx(fonts.map((f) => f.variable))} lang="en">
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
