import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';

import { Chip } from '@/vibes/soul/primitives/chip';

import { couponCodeActionFormDataSchema } from '../schema';

interface CouponChipProps {
  action: (payload: FormData) => void;
  onSubmit: (formData: FormData) => void;
  couponCode: string;
  removeLabel?: string;
}

export function CouponChip({
  couponCode,
  removeLabel = 'Remove promo code',
  onSubmit,
  action,
}: CouponChipProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: couponCodeActionFormDataSchema({}),
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
        {...getInputProps(fields.couponCode, {
          type: 'hidden',
        })}
        value={couponCode}
      />
      <Chip name="intent" removeLabel={removeLabel} value="delete">
        {couponCode.toUpperCase()}
      </Chip>
    </form>
  );
}
