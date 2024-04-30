import { AlertCircle, Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useReducer } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

import { getShippingCountries } from '~/app/[locale]/(default)/cart/_components/shipping-estimator/get-shipping-countries';
import { FragmentOf } from '~/client/graphql';
import { ExistingResultType } from '~/client/util';
import { Button } from '~/components/ui/button';
import { Field, FieldControl, FieldLabel, Form, FormSubmit } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem } from '~/components/ui/select';
import { cn } from '~/lib/utils';

import { ShippingInfoFragment } from './fragment';
import { getShippingStates } from './get-shipping-states';
import { submitShippingInfo } from './submit-shipping-info';

type StatesList = Array<{
  id: number;
  state: string;
  state_abbreviation: string;
  country_id: number;
}>;

interface FormValues {
  country: string;
  states: StatesList | null;
  state: string;
  city: string;
  postcode: string;
}

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
  checkout: FragmentOf<typeof ShippingInfoFragment>;
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

  const [formValues, setFormValues] = useReducer(
    (currentValues: FormValues, newValues: Partial<FormValues>) => ({
      ...currentValues,
      ...newValues,
    }),
    {
      country: selectedShippingCountry
        ? `${selectedShippingCountry.countryCode}-${selectedShippingCountry.id}`
        : '',
      states: [],
      state: shippingConsignment?.address.stateOrProvince || '',
      city: shippingConsignment?.address.city || '',
      postcode: shippingConsignment?.address.postalCode || '',
    },
  );

  // Fetch states when country changes
  useEffect(() => {
    if (formValues.country) {
      const countryId = formValues.country.split('-')[1];

      const fetchStates = async () => {
        const { status, data } = await getShippingStates(Number(countryId));

        if (status === 'success' && data) {
          setFormValues({ states: data });
        } else {
          setFormValues({ states: null });
        }
      };

      if (countryId) {
        void fetchStates();
      }
    }
  }, [formValues.country, t]);

  // Preselect first state when states array changes and state is empty
  useEffect(() => {
    if (formValues.states && !formValues.state) {
      setFormValues({ state: formValues.states[0]?.state || '' });
    }
  }, [formValues.state, formValues.states]);

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

  return (
    <Form
      action={onSubmit}
      className={cn('mx-auto mb-4 mt-4 hidden w-full grid-cols-1 gap-y-4', isVisible && 'grid')}
    >
      <>
        <Field className="relative space-y-2" name="country">
          <FieldLabel htmlFor="country">{t('country')}</FieldLabel>
          <FieldControl asChild>
            <Select
              autoComplete="country"
              id="country"
              onValueChange={(value: string) => {
                const countryId = value.split('-')[1];

                if (countryId) {
                  setFormValues({ country: value, states: [], state: '', city: '', postcode: '' });
                } else {
                  setFormValues({ country: '', states: [], state: '', city: '', postcode: '' });
                }

                hideShippingOptions();
              }}
              placeholder={t('countryPlaceholder')}
              value={formValues.country}
            >
              <SelectContent position="item-aligned">
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
          <FieldLabel htmlFor="state">{t('state')}</FieldLabel>
          <FieldControl asChild>
            {formValues.states !== null ? (
              <Select
                disabled={formValues.states.length === 0}
                id="state"
                onValueChange={(value) => setFormValues({ state: value })}
                placeholder={t('statePlaceholder')}
                value={formValues.state}
              >
                <SelectContent position="item-aligned">
                  {formValues.states.map(({ id, state }) => {
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
                onChange={(e) => setFormValues({ state: e.target.value })}
                placeholder={t('statePlaceholder')}
                type="text"
                value={formValues.state}
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
              onChange={(e) => setFormValues({ city: e.target.value })}
              placeholder={t('cityPlaceholder')}
              type="text"
              value={formValues.city}
            />
          </FieldControl>
        </Field>
        <Field className="relative space-y-2" name="zip">
          <FieldLabel htmlFor="zip-field">{t('postcode')}</FieldLabel>
          <FieldControl asChild>
            <Input
              autoComplete="postal-code"
              id="zip-field"
              onChange={(e) => setFormValues({ postcode: e.target.value })}
              placeholder={t('postcodePlaceholder')}
              type="text"
              value={formValues.postcode}
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
