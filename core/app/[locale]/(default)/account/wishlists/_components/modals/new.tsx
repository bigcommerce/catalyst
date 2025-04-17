'use client';

import { getInputProps } from '@conform-to/react';
import { useRef } from 'react';

import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { useModalForm } from '~/components/modal/modal-form-provider';

import { newWishlistSchema } from '../../_actions/schema';

export const NewWishlistModal = ({
  nameLabel = 'Name',
  requiredError,
}: {
  requiredError: string;
  nameLabel: string;
}) => {
  const defaultValue = useRef<string>('');
  const { form, fields, state } = useModalForm(
    newWishlistSchema({ required_error: requiredError }),
  );

  return (
    <>
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
