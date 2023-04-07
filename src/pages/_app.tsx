import { Inter } from '@next/font/google';
import { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';

import '../../styles/globals.css';
import { CartContextProvider } from '../components/cart/cartContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      <style global jsx>
        {`
          :root {
            --font-inter: ${inter.style.fontFamily};
          }
        `}
      </style>
      <CartContextProvider>
        <Component {...pageProps} />
      </CartContextProvider>
    </>
  );
}

export default App;
