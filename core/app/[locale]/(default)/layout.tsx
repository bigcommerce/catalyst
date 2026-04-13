import { PropsWithChildren } from 'react';

import { Footer } from '~/components/footer';
import { Header } from '~/components/header';

export default function DefaultLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Header />

      <main>{children}</main>

      <Footer />
    </>
  );
}
