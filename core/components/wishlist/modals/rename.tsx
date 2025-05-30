'use client';

import { getInputProps } from '@conform-to/react';
import { useRef } from 'react';

import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { Wishlist } from '@/vibes/soul/sections/wishlist-details';
import { useModalForm } from '~/components/modal/modal-form-provider';

import { renameWishlistSchema } from '../../../app/[locale]/(default)/account/wishlists/_actions/schema';

export const RenameWishlistModal = ({
  id,
  name,
  nameLabel = 'Name',
  requiredError,
}: Wishlist & { requiredError: string; nameLabel: string }) => {
  const defaultValue = useRef<string>(name);
  const { form, fields, state } = useModalForm(
    renameWishlistSchema({ required_error: requiredError }),
  );

  return (
    <>
      <input name="wishlistId" type="hidden" value={id} />
      <Input
        {...getInputProps(fields.wishlistName, { type: 'text' })}
        defaultValue={defaultValue.current}
        errors={fields.wishlistName.errors}
        key={fields.wishlistName.id}
        label={nameLabel}
        onChange={(e) => {
          defaultValue.current = e.target.value;
        }}
      />
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
