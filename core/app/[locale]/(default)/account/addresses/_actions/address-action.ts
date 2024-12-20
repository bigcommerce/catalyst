import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { randomUUID } from 'crypto';

import { Address, DefaultAddressConfiguration } from '@/vibes/soul/sections/address-list-section';
import { schema } from '@/vibes/soul/sections/address-list-section/schema';

import { Field, FieldGroup } from '../../../../../../vibes/soul/primitives/dynamic-form/schema';

export async function addressAction(
  prevState: Awaited<{
    addresses: Address[];
    lastResult: SubmissionResult | null;
    defaultAddress?: DefaultAddressConfiguration;
    fields: Array<Field | FieldGroup<Field>>;
  }>,
  formData: FormData,
): Promise<{
  addresses: Address[];
  lastResult: SubmissionResult | null;
  defaultAddress?: DefaultAddressConfiguration;
  fields: Array<Field | FieldGroup<Field>>;
}> {
  'use server';

  const intent = formData.get('intent');
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: ['Boom!'] }),
    };
  }

  // Simulate a network request
  await new Promise((resolve) => setTimeout(resolve, 1000));

  switch (intent) {
    case 'create': {
      // const newAddress = await createAddress(submission.value)
      const newAddress = { ...submission.value, id: randomUUID() };

      return {
        addresses: [...prevState.addresses, newAddress],
        lastResult: submission.reply({ resetForm: true }),
        defaultAddress: prevState.defaultAddress,
        fields: prevState.fields,
      };
    }

    case 'update': {
      // const newAddress = await updateAddress(submission.value)
      const newAddress = submission.value;

      return {
        addresses: prevState.addresses.map((address) =>
          address.id === newAddress.id ? newAddress : address,
        ),
        lastResult: submission.reply({ resetForm: true }),
        defaultAddress: prevState.defaultAddress,
        fields: prevState.fields,
      };
    }

    case 'delete': {
      // const deletedAddress = await deleteAddress(submission.value)
      const deletedAddress = submission.value;

      return {
        addresses: prevState.addresses.filter((address) => address.id !== deletedAddress.id),
        lastResult: submission.reply({ resetForm: true }),
        defaultAddress: prevState.defaultAddress,
        fields: prevState.fields,
      };
    }

    default: {
      return prevState;
    }
  }
}
