import { AlertCircle } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';

import { FragmentOf } from '~/client/graphql';
import { Field, FieldLabel, Form, FormSubmit } from '~/components/ui/form';
import { Label } from '~/components/ui/label';
import { Message } from '~/components/ui/message';
import { RadioGroup, RadioItem } from '~/components/ui/radio-group';

import { ShippingOptionsFragment } from './fragment';
import { SubmitButton } from './submit-button';
import { submitShippingCosts } from './submit-shipping-costs';

interface Props {
  data: FragmentOf<typeof ShippingOptionsFragment>;
  checkoutEntityId: string;
  currencyCode?: string;
}

export const ShippingOptions = ({ data, checkoutEntityId, currencyCode }: Props) => {
  const t = useTranslations('Cart.ShippingCost');
  const format = useFormatter();
  const { availableShippingOptions, entityId } = data;

  const shippingOptions = availableShippingOptions?.map(
    ({ cost, description, entityId: shippingOptionEntityId, isRecommended }) => ({
      cost: cost.value,
      description,
      shippingOptionEntityId,
      isDefault: isRecommended,
    }),
  );

  const onSubmit = async (formData: FormData) => {
    const { status } = await submitShippingCosts(formData, checkoutEntityId, entityId);

    if (status === 'error') {
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
                    <span>
                      {format.number(option.cost, {
                        style: 'currency',
                        currency: currencyCode,
                      })}
                    </span>
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
