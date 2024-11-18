'use client';
import React from 'react';
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
  Form,
  FormSubmit,
  Input,
  Checkbox,
  Label,
} from '~/components/ui/form';
import { useTranslations } from 'next-intl';
import { Button } from '~/components/ui/button';
const SubmitButton = () => {
  const t = useTranslations('OrderTracking');

  return (
    <Button className=" " variant="primary">
      {t('Form.findOrder')}
    </Button>
  );
};
export default function OrderTracking() {
  const t = useTranslations('OrderTracking');
  return (
    <>
      <Form className="m-10 flex w-full flex-row items-center justify-center gap-4">
        {/* Email Field */}
        <div className="m-2 basis-1/3">
          <Field name="email">
            <FieldLabel className="login-label flex items-center tracking-[0.15px]" htmlFor="email">
              {t('Form.emailLabel')}
            </FieldLabel>
            <FieldControl asChild>
              <Input
                className="login-input h-[40px] w-full"
                autoComplete="email"
                id="email"
                required
                type="email"
                placeholder="Enter your email"
              />
            </FieldControl>
          </Field>
        </div>

        {/* Order Tracking Field */}
        <div className="m-2 basis-1/3">
          <Field name="orderTracking">
            <FieldLabel
              className="login-label flex items-center tracking-[0.15px]"
              htmlFor="orderTracking"
            >
              {t('Form.OrderTackingLabel')}
            </FieldLabel>
            <FieldControl asChild>
              <Input
                className="login-input h-[40px] w-full"
                autoComplete="off"
                id="orderTracking"
                required
                type="text"
                placeholder="Enter your tracking number"
              />
            </FieldControl>
          </Field>
        </div>

        {/* Submit Button */}
        <div className="mt-7 flex basis-1/6 items-center justify-center">
          <FormSubmit asChild>
            <Button className="h-[46px] w-full" variant="primary">
              {t('Form.findOrder')}
            </Button>
          </FormSubmit>
        </div>
      </Form>
    </>
  );
}
