import { Button } from '@bigcommerce/components/button';
import { Field, FieldLabel, Form, FormSubmit } from '@bigcommerce/components/form';
import { Label } from '@bigcommerce/components/label';
import { Message } from '@bigcommerce/components/message';
import { RadioGroup, RadioItem } from '@bigcommerce/components/radio-group';
import { AlertCircle, Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

import { getCheckout } from '~/client/queries/get-checkout';
import { ExistingResultType } from '~/client/util';

interface AvailableShippingOptions {
  cost: {
    value: number;
  };
  description: string;
  entityId: string;
  isRecommended: boolean;
}

import { submitShippingCosts } from '../_actions/submit-shipping-costs';

const SubmitButton = () => {
  const t = useTranslations('Cart.SubmitShippingCost');
  const { pending } = useFormStatus();

  return (
    <Button className="w-full items-center px-8 py-2" disabled={pending} variant="secondary">
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

export const ShippingOptions = ({
  checkout,
  consignmentEntityId,
  availableShippingOptions,
}: {
  checkout: ExistingResultType<typeof getCheckout>;
  consignmentEntityId: string;
  availableShippingOptions: AvailableShippingOptions[] | null;
}) => {
  const t = useTranslations('Cart.ShippingCost');

  const shippingOptions = availableShippingOptions?.map(
    ({ cost, description, entityId: shippingOptionEntityId, isRecommended }) => ({
      cost: cost.value,
      description,
      shippingOptionEntityId,
      isDefault: isRecommended,
    }),
  );

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: checkout.cart?.currencyCode,
  });

  const onSubmit = async (formData: FormData) => {
    const { status } = await submitShippingCosts(formData, checkout.entityId, consignmentEntityId);

    if (status === 'failed') {
      toast.error(t('errorMessage'), {
        icon: <AlertCircle className="text-error-secondary" />,
      });
    }
  };

  return shippingOptions && shippingOptions.length > 0 ? (
    <Form action={onSubmit} className="mx-auto mb-4 mt-4 grid w-full grid-cols-1 gap-y-4">
      <Field className="relative space-y-2" id="shipping-option" name="option">
        <FieldLabel htmlFor="shipping-option">{t('shippingOptions')}</FieldLabel>
        <RadioGroup
          aria-label={t('radioGroupAriaLabel')}
          defaultValue={shippingOptions.find((option) => option.isDefault)?.shippingOptionEntityId}
          name="shippingOption"
          required={true}
        >
          {shippingOptions.map((option) => {
            return (
              <div className="mb-2 flex" key={option.shippingOptionEntityId}>
                <RadioItem
                  id={option.shippingOptionEntityId}
                  value={option.shippingOptionEntityId}
                />
                <Label
                  className="w-full cursor-pointer ps-4 font-normal"
                  htmlFor={option.shippingOptionEntityId}
                >
                  <p className="inline-flex w-full justify-between">
                    <span>{option.description}</span>
                    <span>{currencyFormatter.format(option.cost)}</span>
                  </p>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </Field>
      <FormSubmit asChild>
        <SubmitButton />
      </FormSubmit>
    </Form>
  ) : (
    <Message aria-labelledby="error-message" aria-live="polite" role="region" variant="error">
      <p id="error-message">{t('noAvailableOptions')}</p>
    </Message>
  );
};
