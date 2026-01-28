import { Chip } from '@/vibes/soul/primitives/chip';

export interface PromoCodeChipProps {
  action: (payload: FormData) => void;
  onSubmit: (formData: FormData) => void;
  code: string;
  type: 'coupon' | 'gift-certificate';
  removeLabel?: string;
}

export function PromoCodeChip({
  code,
  type,
  removeLabel = type === 'coupon' ? 'Remove promo code' : 'Remove gift certificate code',
  onSubmit,
  action,
}: PromoCodeChipProps) {
  const intent = type === 'coupon' ? 'delete-coupon' : 'delete-gift-certificate';
  const fieldName = type === 'coupon' ? 'couponCode' : 'giftCertificateCode';

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit(formData);
  };

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name={fieldName} value={code} />
      <Chip name="intent" removeLabel={removeLabel} value={intent}>
        {code.toUpperCase()}
      </Chip>
    </form>
  );
}
