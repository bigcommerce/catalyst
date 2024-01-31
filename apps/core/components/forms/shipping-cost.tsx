import { Button } from '@bigcommerce/components/button';
import { Field, FieldLabel, Form, FormSubmit } from '@bigcommerce/components/form';
import { Label } from '@bigcommerce/components/label';
import { Message } from '@bigcommerce/components/message';
import { RadioGroup, RadioItem } from '@bigcommerce/components/radio-group';
import { Loader2 as Spinner } from 'lucide-react';
import { useContext } from 'react';
import { useFormStatus } from 'react-dom';

import {
  CheckoutContext,
  createCurrencyFormatter,
} from '~/app/[locale]/(default)/cart/_components/checkout-summary';
import { addCheckoutShippingInfo } from '~/client/mutations/add-checkout-shipping-info';
import { ExistingResultType } from '~/client/util';
import { cn } from '~/lib/utils';

import { submitShippingCosts } from './_actions/submit-shipping-costs';

type ShippingConsignments = ExistingResultType<
  typeof addCheckoutShippingInfo
>['shippingConsignments'];

const SubmitFormButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full items-center px-8 py-2" disabled={pending} variant="secondary">
      {pending ? (
        <>
          <Spinner aria-hidden="true" className="animate-spin" />
          <span className="sr-only">Submitting...</span>
        </>
      ) : (
        <span>Update shipping costs</span>
      )}
    </Button>
  );
};

export const ShippingCost = ({
  consignmentEntityId,
  shippingConsignments,
}: {
  consignmentEntityId: string;
  shippingConsignments: ShippingConsignments;
}) => {
  const extractShippingOptions = (consignments: ShippingConsignments) => {
    if (consignments) {
      return consignments.flatMap(({ availableShippingOptions }) => {
        const shippingOptionsRes = availableShippingOptions
          ? availableShippingOptions.map(
              ({ cost, description, entityId: shippingOptionEntityId, isRecommended }) => ({
                cost: cost.value,
                description,
                shippingOptionEntityId,
                isDefault: isRecommended,
              }),
            )
          : [];

        return shippingOptionsRes;
      });
    }

    return null;
  };
  const shippingOptions = shippingConsignments ? extractShippingOptions(shippingConsignments) : [];
  const { checkoutEntityId, currencyCode, setIsShippingMethodSelected, updateCheckoutSummary } =
    useContext(CheckoutContext);
  const currencyFormatter = createCurrencyFormatter(currencyCode);

  const onSubmit = async (formData: FormData) => {
    const { status, data } = await submitShippingCosts(
      formData,
      checkoutEntityId,
      consignmentEntityId,
    );

    if (status === 'success' && data) {
      setIsShippingMethodSelected(true);

      const { shippingCostTotal, handlingCostTotal, shippingConsignments: shippingCosts } = data;
      const shippingId = shippingCosts && shippingCosts[0] ? shippingCosts[0].entityId : '';

      updateCheckoutSummary((prevCheckoutSummary) => ({
        ...prevCheckoutSummary,
        shippingCostTotal: {
          value: shippingCostTotal?.value ?? 0,
          currencyCode,
        },
        handlingCostTotal: {
          value: handlingCostTotal?.value ?? 0,
          currencyCode,
        },
        consignmentEntityId: shippingId,
      }));
    }

    return null;
  };

  return shippingOptions && shippingOptions.length > 0 ? (
    <Form action={onSubmit} className={cn('mx-auto mb-4 mt-4 grid w-full grid-cols-1 gap-y-4')}>
      <Field className={cn('relative space-y-2')} id="shipping-option" name="option">
        <FieldLabel htmlFor="shipping-option">Available options</FieldLabel>
        <RadioGroup
          aria-label="Available shipping options"
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
        <SubmitFormButton />
      </FormSubmit>
    </Form>
  ) : (
    <Message aria-labelledby="error-message" aria-live="polite" role="region" variant="error">
      <p id="error-message">
        There are no available options for shipping. Please check provided details and try again!
      </p>
    </Message>
  );
};
