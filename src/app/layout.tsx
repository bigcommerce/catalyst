import { Inter } from '@next/font/google';
import React from 'react';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={inter.className} lang="en">
      <body>{children}</body>
    </html>
  );
}
