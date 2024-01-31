import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';
import { PropsWithChildren } from 'react';

import './globals.css';

import { Notifications } from './notifications';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Catalyst Store',
  description: 'Example store built with Catalyst',
  other: {
    platform: 'bigcommerce.catalyst',
    build_sha: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  },
};

export const fetchCache = 'default-cache';

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html className={`${inter.variable} font-sans`} lang="en">
      <body className="flex h-screen flex-col">
        <Notifications />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
