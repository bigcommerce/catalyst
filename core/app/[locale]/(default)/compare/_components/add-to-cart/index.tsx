'use client';

import { FragmentOf } from 'gql.tada';
import { AlertCircle, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { toast } from 'react-hot-toast';

import { AddToCartButton } from '~/components/add-to-cart-button';
import { useCart } from '~/components/header/cart-provider';
import { Link } from '~/components/link';

import { addToCart } from '../../_actions/add-to-cart';

import { AddToCartFragment } from './fragment';

export const AddToCart = ({ data: product }: { data: FragmentOf<typeof AddToCartFragment> }) => {
  const t = useTranslations('Compare.AddToCart');
  const cart = useCart();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const quantity = Number(formData.get('quantity'));

    // Optimistic update
    cart.increment(quantity);
    toast.success(
      () => (
        <div className="flex items-center gap-3">
          <span>
            {t.rich('success', {
              cartItems: quantity,
              cartLink: (chunks) => (
                <Link
                  className="font-semibold text-primary"
                  href="/cart"
                  prefetch="viewport"
                  prefetchKind="full"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </div>
      ),
      { icon: <Check className="text-success-secondary" /> },
    );

    startTransition(async () => {
      const result = await addToCart(formData);

      if (result.error) {
        cart.decrement(quantity);

        toast.error(t('error'), {
          icon: <AlertCircle className="text-error-secondary" />,
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="product_id" type="hidden" value={product.entityId} />
      <input name="quantity" type="hidden" value={1} />

      <AddToCartButton data={product} loading={isPending} />
    </form>
  );
};
