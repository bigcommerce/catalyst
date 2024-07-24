'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { AlertCircle, Check } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

import { FragmentOf } from '~/client/graphql';
import { AddToCartButton } from '~/components/add-to-cart-button';
import { Button } from '~/components/ui/button';

import { Link } from '../../link';
import { addToCart } from '../_actions/add-to-cart';

import { AddToCartFragment } from './fragment';

interface Props {
  data: FragmentOf<typeof AddToCartFragment>;
}

const Submit = ({ data: product }: Props) => {
  const { pending } = useFormStatus();

  return <AddToCartButton className="mt-2" data={product} loading={pending} />;
};

export const AddToCart = ({ data: product }: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const t = useTranslations('AddToCart');

  const newSearchParams = new URLSearchParams(searchParams);

  newSearchParams.set('showQuickAdd', String(product.entityId));

  const productOptions = removeEdgesAndNodes(product.productOptions);

  return Array.isArray(productOptions) && productOptions.length > 0 ? (
    <Button asChild>
      <Link
        className="mt-2 hover:text-white"
        href={`${pathname}?${newSearchParams.toString()}`}
        scroll={false}
      >
        {t('quickAdd')}
      </Link>
    </Button>
  ) : (
    <form
      action={async (formData: FormData) => {
        const result = await addToCart(formData);
        const quantity = Number(formData.get('quantity'));

        if (result.error) {
          toast.error(t('errorAddingProductToCart'), {
            icon: <AlertCircle className="text-error-secondary" />,
          });

          return;
        }

        toast.success(
          () => (
            <div className="flex items-center gap-3">
              <span>
                {t.rich('addedProductQuantity', {
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
