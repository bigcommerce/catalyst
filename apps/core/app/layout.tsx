import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';
import { PropsWithChildren } from 'react';

import './globals.css';
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
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html className={`${inter.variable} font-sans`} lang="en">
      <body className="flex h-screen flex-col">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
