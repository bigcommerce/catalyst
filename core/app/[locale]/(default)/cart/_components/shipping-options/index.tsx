import { AlertCircle } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';

import { FragmentOf } from '~/client/graphql';
import { Field, FieldLabel, Form, FormSubmit, RadioGroup } from '~/components/ui/form';
import { Message } from '~/components/ui/message';

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

  const items = shippingOptions?.map((option) => ({
    value: option.shippingOptionEntityId,
    label: `${option.description} - ${format.number(option.cost, { style: 'currency', currency: currencyCode })}`,
  }));

  const defaultValue = shippingOptions?.find((option) => option.isDefault)?.shippingOptionEntityId;

  return items && items.length > 0 ? (
    <Form action={onSubmit} className="mx-auto mb-4 mt-4 grid w-full grid-cols-1 gap-y-4">
      <Field className="relative space-y-2" id="shipping-option" name="option">
        <FieldLabel htmlFor="shipping-option">{t('shippingOptions')}</FieldLabel>
        <RadioGroup
          aria-label={t('radioGroupAriaLabel')}
          defaultValue={defaultValue}
          items={items}
          name="shippingOption"
          required={true}
        />
      </Field>
      <FormSubmit asChild>
        <SubmitButton />
      </FormSubmit>
    </Form>
  ) : (
    <Message variant="error">
      <p>{t('noAvailableOptions')}</p>
    </Message>
  );
};
