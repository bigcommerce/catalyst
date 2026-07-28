import { SubmissionResult } from '@conform-to/react';

import { Field, FieldGroup } from '@/vibes/soul/form/dynamic-form/schema';
import { Address, DefaultAddressConfiguration } from '@/vibes/soul/sections/address-list-section';

import { createAddress } from './create-address';
import { deleteAddress } from './delete-address';
import { updateAddress } from './update-address';

export interface State {
  addresses: Address[];
  lastResult: SubmissionResult | null;
  defaultAddress?: DefaultAddressConfiguration;
}

export async function addressAction(
  fields: Array<Field | FieldGroup<Field>>,
  prevState: Awaited<State>,
  formData: FormData,
): Promise<State> {
  'use server';

  const intent = formData.get('intent');

  switch (intent) {
    case 'create': {
      return await createAddress(fields, prevState, formData);
    }

    case 'update': {
      return await updateAddress(fields, prevState, formData);
    }

    case 'delete': {
      return await deleteAddress(prevState, formData);
    }

    default: {
      return prevState;
    }
  }
}
