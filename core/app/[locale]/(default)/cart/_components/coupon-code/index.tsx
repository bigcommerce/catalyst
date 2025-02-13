'use client';

import { AlertCircle } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

import { FragmentOf } from '~/client/graphql';
import { Button } from '~/components/ui/button';
import { Field, FieldControl, FieldMessage, Form, FormSubmit, Input } from '~/components/ui/form';

import { applyCouponCode } from './apply-coupon-code';
import { CouponCodeFragment } from './fragment';
import { removeCouponCode } from './remove-coupon-code';

const SubmitButton = () => {
  const t = useTranslations('Cart.SubmitCouponCode');
  const { pending } = useFormStatus();

  return (
    <Button
      className="items-center px-8 py-2"
      loading={pending}
      loadingText={t('spinnerText')}
      variant="secondary"
    >
      {t('submitText')}
    </Button>
  );
};

export const RemoveButton = () => {
  const t = useTranslations('Cart.CheckoutSummary');
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-auto items-center p-0 text-primary hover:bg-transparent disabled:text-primary disabled:hover:text-primary"
      loading={pending}
      loadingText={t('spinnerText')}
      type="submit"
      variant="subtle"
    >
      {t('remove')}
    </Button>
  );
};

interface Props {
  checkout: FragmentOf<typeof CouponCodeFragment>;
}

export const CouponCode = ({ checkout }: Props) => {
  const t = useTranslations('Cart.CheckoutSummary');
  const format = useFormatter();

  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(checkout.coupons.at(0) || null);

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
    document.cookie = 'ztcpn_data=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    const { status } = await removeCouponCode(formData);

    if (status === 'error') {
      toast.error(t('couponCodeRemoveFailed'), {
        icon: <AlertCircle className="text-error-secondary" />,
      });
    }
  };

  return selectedCoupon ? (
    <div className="flex flex-col gap-2 ">
      <div className="flex justify-between">
        <span className="font-normal">
          {t('coupon')} ({selectedCoupon.code})
        </span>
        <span>
          {format.number(selectedCoupon.discountedAmount.value * -1, {
            style: 'currency',
            currency: checkout.cart?.currencyCode,
          })}
        </span>
      </div>
      <form action={onSubmitRemoveCouponCode} className=''>
        <input name="checkoutEntityId" type="hidden" value={checkout.entityId} />
        <input name="couponCode" type="hidden" value={selectedCoupon.code} />
        <RemoveButton />
      </form>
    </div>
  ) : (
    <div className="flex flex-col gap-2 ">
      <div className="flex justify-between !bg-[#E7F5F8] leading-[32px] font-[400]">
        <span className="font-normal">{t('couponCode')}</span>
        <Button
          aria-controls="coupon-code-form"
          className="w-fit p-0 text-primary font-normal hover:bg-transparent"
          onClick={() => setShowAddCoupon((open) => !open)}
          variant="subtle"
        >
          {showAddCoupon ? t('cancel') : t('add')}
        </Button>
      </div>
      {showAddCoupon && (
        <Form
        // border: 1px solid #4EAECC;
        // border-radius: 3px;
          action={onSubmitApplyCouponCode}
          className="flex flex-col gap-[5px] [&>button]:border [&>button]:rounded-[3px] [&>button]:border-[#4EAECC] 
          [&>input]:!h-[44px] [&>input]:!border [&_input]:!border-[#cccbcb] [&>input]:!rounded-[3px]"
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
