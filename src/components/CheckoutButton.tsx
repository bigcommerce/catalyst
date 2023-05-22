import { Link } from '@reactant/components/Link';
import getCheckoutUrl from '@api/browser/storefront/checkout';
import { BaseSyntheticEvent } from 'react';

function getCartId(): string | null {
  for (const cookie of document.cookie.split(';')) {
    const [key, value] = cookie.split('=');
    if (key.trim() === 'cartId') {
      return value;
    }
  }
  return null;
}

async function onCheckoutClick(e: BaseSyntheticEvent) {
  e.preventDefault();
  // TODO replace getCartId with a function that returns the cartId from the cookie or elsewhere
  const cartId = getCartId();
  if (cartId) {
    const url = await getCheckoutUrl(cartId);
    window.location.href = url;
  }
}

export const CheckoutButton: React.FC = () => {
  return (
    <Link className="px-8 py-3 bg-[#053FB0] text-white font-semibold" onClick={onCheckoutClick}>
      Proceed to checkout
    </Link>
  );
};
