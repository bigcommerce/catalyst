'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';

import { removeItem } from '../_actions/remove-item';

import { RemoveFromCartButton } from './remove-from-cart-button';

export const RemoveItem = ({ lineItemEntityId }: { lineItemEntityId: string }) => {
  const t = useTranslations('Cart.SubmitRemoveItem');

  const onSubmitRemoveItem = async () => {
    const { status } = await removeItem({
      lineItemEntityId,
    });

    if (status === 'error') {
      toast.error(t('errorMessage'), {
        icon: <AlertCircle className="text-error-secondary" />,
      });
    }
  };

  return (
    <form action={onSubmitRemoveItem}>
      <RemoveFromCartButton />
    </form>
  );
};
