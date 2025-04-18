'use client';

import { useActionState, useEffect, useTransition } from 'react';

import { Switch } from '@/ui/form/switch';
import { toast } from '@/ui/primitives/toaster';
import { Wishlist } from '@/ui/sections/wishlist-details';

import { toggleWishlistVisibility } from '../../_actions/change-wishlist-visibility';

export const WishlistVisibilitySwitch = ({
  id,
  visibility: { isPublic, publicLabel, privateLabel },
}: Wishlist) => {
  const [state, formAction] = useActionState(toggleWishlistVisibility, { lastResult: null });
  const [isPending, startTransition] = useTransition();
  const onCheckedChange = (value: boolean) => {
    startTransition(() => {
      const formData = new FormData();

      formData.append('wishlistId', id);
      formData.append('wishlistIsPublic', value ? 'true' : 'false');

      formAction(formData);
    });
  };

  useEffect(() => {
    if (state.lastResult?.status === 'error' && Boolean(state.errorMessage)) {
      toast.error(state.errorMessage);
    }
  }, [state]);

  return (
    <Switch
      checked={isPublic}
      label={{ on: publicLabel, off: privateLabel }}
      labelPosition="right"
      loading={isPending}
      onCheckedChange={onCheckedChange}
      size="small"
    />
  );
};
