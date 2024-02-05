import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';

import { useCartProvider } from '~/app/contexts/CartContext';
import { getSessionCustomerId } from '~/auth';
import { Footer } from '~/components/Footer/Footer';
import { Header } from '~/components/Header';
import { Cart } from '~/components/Header/cart';

import { useCustomerProvider } from '../../contexts/CustomerContext';

export default async function DynamicLayout({ children }: PropsWithChildren) {
  const customerId = await getSessionCustomerId();
  const cartId = cookies().get('cartId')?.value;

  useCustomerProvider(customerId);
  useCartProvider(cartId);

  return (
    <>
      <Header cart={<Cart />} />
      <main className="flex-1 px-6 2xl:container sm:px-10 lg:px-12 2xl:mx-auto 2xl:px-0">
        {children}
      </main>
      <Footer />
    </>
  );
}
