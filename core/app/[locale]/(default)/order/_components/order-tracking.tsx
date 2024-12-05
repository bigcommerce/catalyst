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
      <div className="flex justify-center">
        <div className="w-[70%]">
          <div className="flex flex-col gap-[20px]">
            <div>Home / Find an Order</div>
            <div className="text-[24px] font-[400] leading-[32px] text-[#000]">Find Your Order</div>
            <Form className="flex flex-row items-end gap-[20px] p-0">
              <Field name="email" className="flex flex-1 flex-col gap-[20px]">
                <FieldLabel
                  className="text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-[#008BB7]"
                  htmlFor="email"
                >
                  {t('Form.emailLabel')}
                </FieldLabel>
                <FieldControl asChild>
                  <Input
                    className="flex h-[44px] w-full flex-col items-start justify-center gap-[10px] rounded-[3px] border border-[#CCCBCB] bg-white"
                    autoComplete="email"
                    id="email"
                    required
                    type="email"
                    placeholder="Enter your email"
                  />
                </FieldControl>
              </Field>

              <Field name="orderTracking" className="flex flex-1 flex-col gap-[20px]">
                <FieldLabel
                  className="text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-[#008BB7]"
                  htmlFor="orderTracking"
                >
                  {t('Form.OrderTackingLabel')}
                </FieldLabel>
                <FieldControl asChild>
                  <Input
                    className="flex h-[44px] w-full flex-col items-start justify-center gap-[10px] rounded-[3px] border border-[#CCCBCB] bg-white"
                    autoComplete="off"
                    id="orderTracking"
                    required
                    type="text"
                    placeholder="Enter your tracking number"
                  />
                </FieldControl>
              </Field>

              {/* Submit Button */}
              <div className="">
                <FormSubmit asChild>
                  <Button
                    className="flex h-[42px] flex-row items-center justify-center gap-[5px] rounded bg-[#03465C] p-[5px_10px] text-sm font-[500] leading-8 tracking-[1.25px] text-[#ffffff]"
                    variant="primary"
                  >
                    {t('Form.findOrder')}
                  </Button>
                </FormSubmit>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
