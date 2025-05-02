'use client';

import { FormStatus } from '@/vibes/soul/form/form-status';
import { Wishlist } from '@/vibes/soul/sections/wishlist-details';
import { useModalForm } from '~/components/modal/modal-form-provider';

import { deleteWishlistSchema } from '../../../app/[locale]/(default)/account/wishlists/_actions/schema';

export const DeleteWishlistModal = ({ id, message }: Wishlist & { message: React.ReactNode }) => {
  const { state, form } = useModalForm(deleteWishlistSchema);

  return (
    <>
      {message}
      <input name="wishlistId" type="hidden" value={id} />
      {state.lastResult?.status === 'error' && (
        <div className="mt-4">
          {form.errors?.map((error, index) => (
            <FormStatus key={index} type="error">
              {error}
            </FormStatus>
          ))}
        </div>
      )}
    </>
  );
};
