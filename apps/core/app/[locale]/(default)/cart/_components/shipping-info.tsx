import { Button } from '@bigcommerce/components/button';
import { Field, FieldControl, FieldLabel, Form, FormSubmit } from '@bigcommerce/components/form';
import { Input } from '@bigcommerce/components/input';
import { Select, SelectContent, SelectItem } from '@bigcommerce/components/select';
import { AlertCircle, Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

import { getShippingCountries } from '~/app/[locale]/(default)/cart/_actions/get-shipping-countries';
import { getCheckout } from '~/client/queries/get-checkout';
import { ExistingResultType } from '~/client/util';
import { cn } from '~/lib/utils';

import { getShippingStates } from '../_actions/get-shipping-states';
import { submitShippingInfo } from '../_actions/submit-shipping-info';

type StatesList = Array<{
  id: number;
  state: string;
  state_abbreviation: string;
  country_id: number;
}>;

const SubmitButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('Cart.SubmitShippingInfo');

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

export const ShippingInfo = ({
  checkout,
  shippingCountries,
  isVisible,
  hideShippingOptions,
}: {
  checkout: ExistingResultType<typeof getCheckout>;
  shippingCountries: ExistingResultType<typeof getShippingCountries>;
  isVisible: boolean;
  hideShippingOptions: () => void;
}) => {
  const t = useTranslations('Cart.ShippingInfo');

  const shippingConsignment =
    checkout.shippingConsignments?.find((consignment) => consignment.selectedShippingOption) ||
    checkout.shippingConsignments?.[0];

  const selectedShippingCountry = shippingCountries.find(
    (country) => country.countryCode === shippingConsignment?.address.countryCode,
  );

  const [selectedCountry, setSelectedCountry] = useState(
    selectedShippingCountry
      ? `${selectedShippingCountry.countryCode}-${selectedShippingCountry.id}`
      : '',
  );
  const [selectedCity, setSelectedCity] = useState(shippingConsignment?.address.city || '');
  const [selectedZipCode, setSelectedZipCode] = useState(
    shippingConsignment?.address.postalCode || '',
  );
  const [selectedStates, setSelectedStates] = useState<StatesList | null>([]);
  const [selectedState, setSelectedState] = useState(
    shippingConsignment?.address.stateOrProvince || '',
  );

  useEffect(() => {
    if (selectedCountry) {
      const countryId = selectedCountry.split('-')[1];

      const fetchStates = async () => {
        const { status, data } = await getShippingStates(Number(countryId));

        if (status === 'success' && data) {
          setSelectedStates(data);
        } else {
          setSelectedStates(null);
        }
      };

      if (countryId) {
        void fetchStates();
      }
    }
  }, [selectedCountry, t]);

  const onSubmit = async (formData: FormData) => {
    const { status } = await submitShippingInfo(formData, {
      checkoutId: checkout.entityId,
      lineItems:
        checkout.cart?.lineItems.physicalItems.map((item) => ({
          lineItemEntityId: item.entityId,
          quantity: item.quantity,
        })) || [],
      shippingId: shippingConsignment?.entityId ?? '',
    });

    if (status === 'error') {
      toast.error(t('errorMessage'), {
        icon: <AlertCircle className="text-error-secondary" />,
      });
    }
  };

  const resetFormFieldsOnCountryChange = () => {
    if (selectedCountry) {
      setSelectedStates([]);
      setSelectedState('');
      setSelectedCity('');
      setSelectedZipCode('');
      hideShippingOptions();
    }
  };

  return (
    <Form
      action={onSubmit}
      className={cn('mx-auto mb-4 mt-4 hidden w-full grid-cols-1 gap-y-4', isVisible && 'grid')}
    >
      <>
        <Field className="relative space-y-2" name="country">
          <FieldLabel>{t('country')}</FieldLabel>
          <FieldControl asChild>
            <Select
              autoComplete="country"
              onValueChange={(value: string) => {
                const countryId = value.split('-')[1];

                if (countryId) {
                  setSelectedCountry(value);
                } else {
                  setSelectedCountry('');
                }

                resetFormFieldsOnCountryChange();
              }}
              placeholder={t('countryPlaceholder')}
              value={selectedCountry}
            >
              <SelectContent>
                {shippingCountries.map(({ id, countryCode, name }) => {
                  return (
                    <SelectItem key={id} value={`${countryCode}-${id}`}>
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FieldControl>
        </Field>
        <Field className="relative space-y-2" name="state">
          <FieldLabel>{t('state')}</FieldLabel>
          <FieldControl asChild>
            {selectedStates !== null ? (
              <Select
                disabled={selectedStates.length === 0}
                onValueChange={setSelectedState}
                placeholder={t('statePlaceholder')}
                value={selectedState}
              >
                <SelectContent>
                  {selectedStates.map(({ id, state }) => {
                    return (
                      <SelectItem key={id} value={state}>
                        {state}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <Input
                autoComplete="address-level1"
                onChange={(e) => setSelectedState(e.target.value)}
                placeholder={t('statePlaceholder')}
                type="text"
                value={selectedState}
              />
            )}
          </FieldControl>
        </Field>
        <Field className="relative space-y-2" name="city">
          <FieldLabel htmlFor="city-field">{t('city')}</FieldLabel>
          <FieldControl asChild>
            <Input
              autoComplete="address-level2"
              id="city-field"
              onChange={(e) => setSelectedCity(e.target.value)}
              placeholder={t('cityPlaceholder')}
              type="text"
              value={selectedCity}
            />
          </FieldControl>
        </Field>
        <Field className="relative space-y-2" name="zip">
          <FieldLabel htmlFor="zip-field">{t('postcode')}</FieldLabel>
          <FieldControl asChild>
            <Input
              autoComplete="postal-code"
              id="zip-field"
              onChange={(e) => setSelectedZipCode(e.target.value)}
              placeholder={t('postcodePlaceholder')}
              type="text"
              value={selectedZipCode}
            />
          </FieldControl>
        </Field>
      </>
      <FormSubmit asChild>
        <SubmitButton />
      </FormSubmit>
    </Form>
  );
};
