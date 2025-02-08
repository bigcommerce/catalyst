import { ShoppingCart } from 'lucide-react';
import { Suspense } from 'react';
import { Footer } from '~/components/footer/footer';
import { Header, HeaderSkeleton } from '~/components/header';
import { CartLink } from '~/components/header/cart';

import { Page as MakeswiftPage } from '~/lib/makeswift';

export default async function NotFound() {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header
          cart={
            <CartLink>
              <ShoppingCart aria-label="cart" />
            </CartLink>
          }
        />
      </Suspense>
      <main>
        <MakeswiftPage locale={'en'} path="/not-found"/>
     </main>
      <Suspense>
        <Footer />
      </Suspense>
    </>
  );
}

export const runtime = 'edge';