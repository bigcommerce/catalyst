import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';

import { Chip } from '@/vibes/soul/primitives/chip';

import { giftCertificateCodeActionFormDataSchema } from '../schema';

export interface GiftCertificateChipProps {
  action: (payload: FormData) => void;
  onSubmit: (formData: FormData) => void;
  giftCertificateCode: string;
  removeLabel?: string;
}

export function GiftCertificateChip({
  giftCertificateCode,
  removeLabel = 'Remove gift certificate code',
  onSubmit,
  action,
}: GiftCertificateChipProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: giftCertificateCodeActionFormDataSchema({}),
      });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      onSubmit(formData);
    },
  });

  return (
    <form {...getFormProps(form)} action={action}>
      <input
        {...getInputProps(fields.giftCertificateCode, {
          type: 'hidden',
        })}
        value={giftCertificateCode}
      />
      <Chip name="intent" removeLabel={removeLabel} value="delete">
        {giftCertificateCode.toUpperCase()}
      </Chip>
    </form>
  );
}
