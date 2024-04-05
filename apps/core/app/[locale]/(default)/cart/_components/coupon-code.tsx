'use client';

import { Button } from '@bigcommerce/components/button';
import { Field, FieldControl, FieldMessage, Form, FormSubmit } from '@bigcommerce/components/form';
import { Input } from '@bigcommerce/components/input';
import { AlertCircle, Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

import { getCheckout } from '~/client/queries/get-checkout';
import { ExistingResultType } from '~/client/util';

import { applyCouponCode } from '../_actions/apply-coupon-code';
import { removeCouponCode } from '../_actions/remove-coupon-code';

type Checkout = ExistingResultType<typeof getCheckout>;

const SubmitButton = () => {
  const t = useTranslations('Cart.SubmitCouponCode');
  const { pending } = useFormStatus();

  return (
    <Button className="items-center px-8 py-2" disabled={pending} variant="secondary">
      {pending ? (
        <>
          <Spinner aria-hidden="true" className="animate-spin" />
          <span className="sr-only">{t('spinnerText')}</span>
        </>
      ) : (
        <span>{t('submitText')}</span>
      )}
    </Button>
  );
};

export const CouponCode = ({ checkout }: { checkout: ExistingResultType<typeof getCheckout> }) => {
  const t = useTranslations('Cart.CheckoutSummary');
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Checkout['coupons'][number] | null>(
    checkout.coupons.at(0) || null,
  );

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: checkout.cart?.currencyCode,
  });

  useEffect(() => {
    if (checkout.coupons[0]) {
      setSelectedCoupon(checkout.coupons[0]);
      setShowAddCoupon(false);

      return;
    }

    setSelectedCoupon(null);
  }, [checkout]);

  const onSubmitApplyCouponCode = async (formData: FormData) => {
    const { status } = await applyCouponCode(formData);

    if (status === 'error') {
      toast.error(t('couponCodeInvalid'), {
        icon: <AlertCircle className="text-error-secondary" />,
      });
    }
  };

  const onSubmitRemoveCouponCode = async (formData: FormData) => {
    const { status } = await removeCouponCode(formData);

    if (status === 'error') {
      toast.error(t('couponCodeRemoveFailed'), {
        icon: <AlertCircle className="text-error-secondary" />,
      });
    }
  };

  return selectedCoupon ? (
    <div className="flex flex-col gap-2 border-t border-t-gray-200 py-4">
      <div className="flex justify-between">
        <span className="font-semibold">
          {t('coupon')} ({selectedCoupon.code})
        </span>
        <span>{currencyFormatter.format(selectedCoupon.discountedAmount.value * -1)}</span>
      </div>
      <form action={onSubmitRemoveCouponCode}>
        <input name="checkoutEntityId" type="hidden" value={checkout.entityId} />
        <input name="couponCode" type="hidden" value={selectedCoupon.code} />
        <Button
          className="w-fit p-0 text-primary hover:bg-transparent"
          type="submit"
          variant="subtle"
        >
          {t('remove')}
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex flex-col gap-2 border-t border-t-gray-200 py-4">
      <div className="flex justify-between">
        <span className="font-semibold">{t('couponCode')}</span>
        <Button
          aria-controls="coupon-code-form"
          className="w-fit p-0 text-primary hover:bg-transparent"
          onClick={() => setShowAddCoupon((open) => !open)}
          variant="subtle"
        >
          {showAddCoupon ? t('cancel') : t('add')}
        </Button>
      </div>
      {showAddCoupon && (
        <Form
          action={onSubmitApplyCouponCode}
          className="my-4 flex flex-col gap-2"
          id="coupon-code-form"
        >
          <input name="checkoutEntityId" type="hidden" value={checkout.entityId} />
          <Field name="couponCode">
            <FieldControl asChild>
              <Input
                aria-label={t('couponCode')}
                placeholder={t('enterCouponCode')}
                required
                type="text"
              />
            </FieldControl>
            <FieldMessage className="text-xs text-error" match="valueMissing">
              {t('couponCodeRequired')}
            </FieldMessage>
          </Field>
          <FormSubmit asChild>
            <SubmitButton />
          </FormSubmit>
        </Form>
      )}
    </div>
  );
};
