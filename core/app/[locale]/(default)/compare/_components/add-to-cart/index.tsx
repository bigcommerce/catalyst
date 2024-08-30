'use client';

import { FragmentOf } from 'gql.tada';
import { AlertCircle, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

import { AddToCartButton } from '~/components/add-to-cart-button';
import { Link } from '~/components/link';

import { addToCart } from '../../_actions/add-to-cart';

import { AddToCartFragment } from './fragment';

const Submit = ({ data: product }: { data: FragmentOf<typeof AddToCartFragment> }) => {
  const { pending } = useFormStatus();

  return <AddToCartButton data={product} loading={pending} />;
};

export const AddToCart = ({ data: product }: { data: FragmentOf<typeof AddToCartFragment> }) => {
  const t = useTranslations('Compare.AddToCart');

  return (
    <form
      action={async (formData: FormData) => {
        const result = await addToCart(formData);
        const quantity = Number(formData.get('quantity'));

        if (result.error) {
          toast.error(t('error'), {
            icon: <AlertCircle className="text-error-secondary" />,
          });

          return;
        }

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
      }}
    >
      <input name="product_id" type="hidden" value={product.entityId} />
      <input name="quantity" type="hidden" value={1} />
      <Submit data={product} />
    </form>
  );
};
