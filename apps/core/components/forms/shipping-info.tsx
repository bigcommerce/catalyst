import { Button } from '@bigcommerce/components/button';
import { Field, FieldControl, FieldLabel, Form, FormSubmit } from '@bigcommerce/components/form';
import { Input } from '@bigcommerce/components/input';
import { Select, SelectContent, SelectItem } from '@bigcommerce/components/select';
import { Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { CheckoutContext } from '~/app/[locale]/(default)/cart/_components/checkout-summary';
import { ExistingResultType } from '~/client/util';
import { cn } from '~/lib/utils';

import { getShippingStates } from './_actions/get-shipping-states';
import { submitShippingInfo } from './_actions/submit-shipping-info';
import { ShippingCost } from './shipping-cost';

type StatesList = Array<{
  id: number;
  state: string;
  state_abbreviation: string;
  country_id: number;
}>;

type ShippingInfoData = ExistingResultType<typeof submitShippingInfo>['data'];

const composeFetchStatesOnSelectedCountry =
  (SetterFn: Dispatch<SetStateAction<StatesList | null>>) => async (countryId: number | null) => {
    if (countryId) {
      const res = await getShippingStates(countryId);
      const states = res.status === 'success' && res.data ? res.data : null;

      SetterFn(states);
    }
  };

const SubmitFormButton = () => {
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
  isVisible,
  cartItems,
}: {
  isVisible: boolean;
  cartItems: Array<{ quantity: number; lineItemEntityId: string }>;
}) => {
  const {
    availableShippingCountries,
    checkoutEntityId,
    setIsShippingMethodSelected,
    updateCheckoutSummary,
    currencyCode,
    consignmentEntityId,
  } = useContext(CheckoutContext);
  const t = useTranslations('Cart.ShippingInfo');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedZipCode, setSelectedZipCode] = useState('');
  const [selectedStates, setSelectedStates] = useState<StatesList | null>(null);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfoData | null>(null);

  const fetchStatesOnSelectedCountry = composeFetchStatesOnSelectedCountry(setSelectedStates);
  const onSubmit = async (formData: FormData) => {
    const { status, data } = await submitShippingInfo(formData, {
      cartId: checkoutEntityId,
      cartItems,
      shippingId: consignmentEntityId,
    });

    if (status === 'success' && data) {
      setShippingInfo(data);
    }
  };
  const resetFormFieldsOnCountryChange = () => {
    if (selectedCountry) {
      setSelectedCity('');
      setSelectedZipCode('');
      setIsShippingMethodSelected(false);
      setShippingInfo(null);
      updateCheckoutSummary((prevCehckoutSummary) => ({
        ...prevCehckoutSummary,
        shippingCostTotal: {
          value: 0,
          currencyCode,
        },
        handlingCostTotal: {
          value: 0,
          currencyCode,
        },
        consignmentEntityId: '',
      }));
    }
  };

  // reset shipping method state after it's been selected
  useEffect(() => {
    setIsShippingMethodSelected(false);
  });

  return (
    <>
      <Form
        action={onSubmit}
        className={cn('mx-auto mb-4 mt-4 hidden w-full grid-cols-1 gap-y-4', isVisible && 'grid')}
      >
        <>
          <Field className={cn('relative space-y-2')} name="country">
            <FieldLabel>{t('country')}</FieldLabel>
            <FieldControl asChild>
              <Select
                autoComplete="country"
                onValueChange={(value: string) => {
                  const countryId = value.split('-')[1];

                  if (countryId) {
                    setSelectedCountry(countryId);

                    void fetchStatesOnSelectedCountry(Number(countryId) || null);
                  } else {
                    setSelectedCountry('');
                  }

                  resetFormFieldsOnCountryChange();
                }}
                placeholder={t('countryPlaceholder')}
              >
                <SelectContent>
                  {availableShippingCountries.map(({ id, countryCode, name }) => {
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
          <Field className={cn('relative space-y-2')} name="state">
            <FieldLabel>{t('state')}</FieldLabel>
            <FieldControl asChild>
              {selectedStates ? (
                <Select placeholder={t('statePlaceholder')}>
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
                  placeholder={t('statePlaceholder')}
                  type="text"
                />
              )}
            </FieldControl>
          </Field>
          <Field className={cn('relative space-y-2')} name="city">
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
          <Field className={cn('relative space-y-2')} name="zip">
            <FieldLabel htmlFor="zip-field">{t('postcode')}</FieldLabel>
            <FieldControl asChild>
              <Input
                autoComplete="postal-code"
                id="zip-field"
                onChange={(e) => setSelectedZipCode(e.target.value)}
                placeholder={t('postcodePlaceholder')}
                type="number"
                value={selectedZipCode}
              />
            </FieldControl>
          </Field>
        </>
        <FormSubmit asChild>
          <SubmitFormButton />
        </FormSubmit>
      </Form>
      <div className="flex w-full flex-col">
        {isVisible &&
          shippingInfo &&
          shippingInfo.shippingConsignments &&
          shippingInfo.shippingConsignments.length > 0 &&
          shippingInfo.shippingConsignments.map(({ entityId }) => {
            return (
              <ShippingCost
                consignmentEntityId={entityId}
                key={entityId}
                shippingConsignments={shippingInfo.shippingConsignments}
              />
            );
          })}
      </div>
    </>
  );
};
