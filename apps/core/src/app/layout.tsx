import { Inter } from 'next/font/google';
import { PropsWithChildren } from 'react';

import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Catalyst Store',
  description: 'Example store built with Catalyst',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html className={`${inter.variable} font-sans`} lang="en">
      <body className="flex h-screen flex-col">
        <Header />
        <main className="flex-1 px-6 sm:px-10 lg:px-12 2xl:container 2xl:mx-auto 2xl:px-0">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
