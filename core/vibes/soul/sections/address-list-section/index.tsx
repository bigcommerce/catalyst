'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { startTransition, useActionState, useEffect, useOptimistic, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';

import { Input } from '@/vibes/soul/form/input';
import { Badge } from '@/vibes/soul/primitives/badge';
import { Button } from '@/vibes/soul/primitives/button';
import { Spinner } from '@/vibes/soul/primitives/spinner';

import { DynamicForm } from '../../primitives/dynamic-form';
import { Field, FieldGroup } from '../../primitives/dynamic-form/schema';

import { schema } from './schema';

export type Address = z.infer<typeof schema>;

export interface DefaultAddressConfiguration {
  id: string | null;
}

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

interface State<A extends Address, F extends Field> {
  addresses: A[];
  defaultAddress?: DefaultAddressConfiguration;
  lastResult: SubmissionResult | null;
  fields: Array<F | FieldGroup<F>>;
}

interface Props<A extends Address, F extends Field> {
  title?: string;
  addresses: A[];
  fields: Array<F | FieldGroup<F>>;
  minimumAddressCount?: number;
  defaultAddress?: DefaultAddressConfiguration;
  addressAction: Action<State<A, F>, FormData>;
  editLabel?: string;
  deleteLabel?: string;
  updateLabel?: string;
  createLabel?: string;
  showAddFormLabel?: string;
  setDefaultLabel?: string;
  cancelLabel?: string;
  firstNameLabel?: string;
  lastNameLabel?: string;
  companyLabel?: string;
  phoneLabel?: string;
  addressLine1Label?: string;
  addressLine2Label?: string;
  addressLevel1Label?: string;
  addressLevel2Label?: string;
  countryLabel?: string;
  postalCodeLabel?: string;
}

export function AddressListSection<A extends Address, F extends Field>({
  title = 'Addresses',
  addresses,
  fields,
  minimumAddressCount = 1,
  defaultAddress,
  addressAction,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  updateLabel = 'Update',
  createLabel = 'Create',
  cancelLabel = 'Cancel',
  showAddFormLabel = 'Add address',
  setDefaultLabel = 'Set as default',
  firstNameLabel,
  lastNameLabel,
  companyLabel,
  phoneLabel,
  addressLine1Label,
  addressLine2Label,
  addressLevel1Label,
  addressLevel2Label,
  countryLabel,
  postalCodeLabel,
}: Props<A, F>) {
  const [state, formAction] = useActionState(addressAction, {
    addresses,
    defaultAddress,
    lastResult: null,
    fields,
  });

  const [optimisticState, setOptimisticState] = useOptimistic<State<Address, F>, FormData>(
    state,
    (prevState, formData) => {
      const intent = formData.get('intent');
      const submission = parseWithZod(formData, { schema });

      console.log(submission);

      if (submission.status !== 'success') return prevState;

      switch (intent) {
        case 'create': {
          const nextAddress = submission.value;

          return {
            ...prevState,
            addresses: [...prevState.addresses, nextAddress],
          };
        }

        case 'update': {
          return {
            ...prevState,
            addresses: prevState.addresses.map((a) =>
              a.id === submission.value.id ? submission.value : a,
            ),
          };
        }

        case 'delete': {
          return {
            ...prevState,
            addresses: prevState.addresses.filter((a) => a.id !== submission.value.id),
          };
        }

        case 'setDefault': {
          return { ...prevState, defaultAddress: { id: submission.value.id } };
        }

        default:
          return prevState;
      }
    },
  );
  const [activeAddressIds, setActiveAddressIds] = useState<string[]>([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <Title>{title}</Title>
        {!showNewAddressForm && (
          <Button onClick={() => setShowNewAddressForm(true)} size="small">
            {showAddFormLabel}
          </Button>
        )}
      </div>
      <div>
        {showNewAddressForm && (
          <div className="border-b border-contrast-200 pb-6 pt-5">
            <AddressForm
              action={(formData) => {
                setShowNewAddressForm(false);

                startTransition(() => {
                  formAction(formData);
                  setOptimisticState(formData);
                });
              }}
              address={{
                id: 'new',
                firstName: '',
                lastName: '',
                street1: '',
                street2: '',
                city: '',
                state: '',
                country: '',
                fieldMetadata: [],
              }}
              addressLevel1Label={addressLevel1Label}
              addressLevel2Label={addressLevel2Label}
              addressLine1Label={addressLine1Label}
              addressLine2Label={addressLine2Label}
              cancelLabel={cancelLabel}
              companyLabel={companyLabel}
              countryLabel={countryLabel}
              firstNameLabel={firstNameLabel}
              intent="create"
              lastNameLabel={lastNameLabel}
              onCancel={() => setShowNewAddressForm(false)}
              phoneLabel={phoneLabel}
              postalCodeLabel={postalCodeLabel}
              submitLabel={createLabel}
            />
          </div>
        )}
        {optimisticState.addresses.map((address) => {
          const addressFields = optimisticState.fields.map<F | FieldGroup<F>>((field) => {
            if (Array.isArray(field)) {
              return field.map((f) => {
                const meta = address.fieldMetadata.find(
                  (metadata) => metadata.id.toString() === f.name,
                );

                return {
                  ...f,
                  defaultValue: meta?.defaultValue,
                };
              });
            }

            const fieldMetadata = address.fieldMetadata.find(
              (metadata) => metadata.id.toString() === field.name,
            );

            return {
              ...field,
              defaultValue: fieldMetadata?.defaultValue,
            };
          });

          return (
            <div className="border-b border-contrast-200 pb-6 pt-5" key={address.id}>
              {activeAddressIds.includes(address.id) ? (
                <div className="w-[480px] space-y-4">
                  <DynamicForm
                    action={(_prevState, formData) => {
                      setActiveAddressIds((prev) => prev.filter((id) => id !== address.id));

                      startTransition(() => {
                        formAction(formData);
                        setOptimisticState(formData);
                      });

                      return {
                        fields: optimisticState.fields,
                        lastResult: optimisticState.lastResult,
                      };
                    }}
                    fields={addressFields}
                    onCancel={() =>
                      setActiveAddressIds((prev) => prev.filter((id) => id !== address.id))
                    }
                    submitLabel={updateLabel}
                    submitName="intent"
                    submitValue="update"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <AddressPreview
                    address={address}
                    isDefault={
                      optimisticState.defaultAddress
                        ? optimisticState.defaultAddress.id === address.id
                        : undefined
                    }
                  />
                  <div className="flex gap-1">
                    <Button
                      aria-label={`${editLabel}: ${address.firstName} ${address.lastName}`}
                      onClick={() => setActiveAddressIds((prev) => [...prev, address.id])}
                      size="small"
                      variant="tertiary"
                    >
                      {editLabel}
                    </Button>
                    {optimisticState.addresses.length > minimumAddressCount && (
                      <AddressActionButton
                        action={formAction}
                        address={address}
                        aria-label={`${deleteLabel}: ${address.firstName} ${address.lastName}`}
                        intent="delete"
                        onSubmit={(formData) => {
                          startTransition(() => {
                            formAction(formData);
                            setOptimisticState(formData);
                          });
                        }}
                      >
                        {deleteLabel}
                      </AddressActionButton>
                    )}

                    {optimisticState.defaultAddress &&
                      optimisticState.defaultAddress.id !== address.id && (
                        <AddressActionButton
                          action={formAction}
                          address={address}
                          aria-label={`${setDefaultLabel}: ${address.firstName} ${address.lastName}`}
                          intent="setDefault"
                          onSubmit={(formData) => {
                            startTransition(() => {
                              formAction(formData);
                              setOptimisticState(formData);
                            });
                          }}
                        >
                          {setDefaultLabel}
                        </AddressActionButton>
                      )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <h1 className="text-4xl">
      {children}
      {pending && (
        <span className="ml-2">
          <Spinner />
        </span>
      )}
    </h1>
  );
}

function AddressPreview({ address, isDefault = false }: { address: Address; isDefault?: boolean }) {
  return (
    <div className="flex gap-10">
      <div className="text-sm">
        <p className="font-bold">
          {address.firstName} {address.lastName}
        </p>
        <p>{address.company}</p>
        <p>{address.street1}</p>
        <p>{address.street2}</p>
        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p className="mb-3">{address.country}</p>
        <p>{address.phone}</p>
      </div>
      <div>{isDefault && <Badge>Default</Badge>}</div>
    </div>
  );
}

function AddressActionButton({
  address,
  intent,
  action,
  onSubmit,
  ...rest
}: {
  address: Address;
  intent: string;
  action: (formData: FormData) => void;
  onSubmit: (formData: FormData) => void;
} & Omit<React.ComponentProps<'button'>, 'onSubmit'>) {
  const [form, fields] = useForm({
    defaultValue: address,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    onSubmit(event, { submission, formData }) {
      event.preventDefault();

      if (submission?.status !== 'success') return;

      onSubmit(formData);
    },
  });

  return (
    <form {...getFormProps(form)} action={action}>
      <input {...getInputProps(fields.id, { type: 'hidden' })} key={fields.id.id} />
      <input {...getInputProps(fields.firstName, { type: 'hidden' })} key={fields.firstName.id} />
      <input {...getInputProps(fields.lastName, { type: 'hidden' })} key={fields.lastName.id} />
      <input {...getInputProps(fields.company, { type: 'hidden' })} key={fields.company.id} />
      <input {...getInputProps(fields.phone, { type: 'hidden' })} key={fields.phone.id} />
      <input {...getInputProps(fields.street1, { type: 'hidden' })} key={fields.street1.id} />
      <input {...getInputProps(fields.street2, { type: 'hidden' })} key={fields.street2.id} />
      <input {...getInputProps(fields.city, { type: 'hidden' })} key={fields.city.id} />
      <input {...getInputProps(fields.state, { type: 'hidden' })} key={fields.state.id} />
      <input {...getInputProps(fields.postalCode, { type: 'hidden' })} key={fields.postalCode.id} />
      <input {...getInputProps(fields.country, { type: 'hidden' })} key={fields.country.id} />
      <Button
        {...rest}
        name="intent"
        size="small"
        type="submit"
        value={intent}
        variant="tertiary"
      />
    </form>
  );
}

function AddressForm({
  address,
  lastResult,
  onCancel,
  action,
  intent,
  cancelLabel = 'Cancel',
  submitLabel = 'Submit',
  firstNameLabel = 'First name',
  lastNameLabel = 'Last name',
  companyLabel = 'Company',
  phoneLabel = 'Phone',
  addressLine1Label = 'Address Line 1',
  addressLine2Label = 'Address Line 1',
  addressLevel1Label = 'State/Province',
  addressLevel2Label = 'City/Town',
  countryLabel = 'Country',
  postalCodeLabel = 'Postal code',
}: {
  address: Address;
  intent: string;
  lastResult?: SubmissionResult | null;
  cancelLabel?: string;
  submitLabel?: string;
  firstNameLabel?: string;
  lastNameLabel?: string;
  companyLabel?: string;
  phoneLabel?: string;
  addressLine1Label?: string;
  addressLine2Label?: string;
  addressLevel1Label?: string;
  addressLevel2Label?: string;
  countryLabel?: string;
  postalCodeLabel?: string;
  onCancel: (e: React.MouseEvent<HTMLButtonElement>) => void;
  action: (formData: FormData) => void;
}) {
  const [form, fields] = useForm({
    lastResult,
    defaultValue: address,
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  useEffect(() => {
    if (lastResult?.error) console.log(lastResult.error);
  }, [lastResult?.error]);

  return (
    <form {...getFormProps(form)} action={action} className="w-[480px] space-y-4">
      <input {...getInputProps(fields.id, { type: 'hidden' })} key={fields.id.id} />
      <div className="flex gap-4">
        <Input
          {...getInputProps(fields.firstName, { type: 'text' })}
          autoComplete="off"
          data-1p-ignore
          data-lpignore
          errors={fields.firstName.errors}
          key={fields.firstName.id}
          label={firstNameLabel}
        />
        <Input
          {...getInputProps(fields.lastName, { type: 'text' })}
          autoComplete="off"
          data-1p-ignore
          data-lpignore
          errors={fields.lastName.errors}
          key={fields.lastName.id}
          label={lastNameLabel}
        />
      </div>

      <Input
        {...getInputProps(fields.company, { type: 'text' })}
        autoComplete={`section-${address.id} company`}
        errors={fields.company.errors}
        key={fields.company.id}
        label={companyLabel}
      />
      <Input
        {...getInputProps(fields.phone, { type: 'tel' })}
        autoComplete={`section-${address.id} phone`}
        errors={fields.phone.errors}
        key={fields.phone.id}
        label={phoneLabel}
      />
      <Input
        {...getInputProps(fields.street1, { type: 'text' })}
        autoComplete={`section-${address.id} address-line1`}
        errors={fields.street1.errors}
        key={fields.street1.id}
        label={addressLine1Label}
      />
      <Input
        {...getInputProps(fields.street2, { type: 'text' })}
        autoComplete={`section-${address.id} address-line2`}
        errors={fields.street2.errors}
        key={fields.street2.id}
        label={addressLine2Label}
      />
      <div className="flex gap-4">
        <Input
          {...getInputProps(fields.city, { type: 'text' })}
          autoComplete={`section-${address.id} address-level2`}
          errors={fields.city.errors}
          key={fields.city.id}
          label={addressLevel2Label}
        />
        <Input
          {...getInputProps(fields.state, { type: 'text' })}
          autoComplete={`section-${address.id} address-level1`}
          errors={fields.state.errors}
          key={fields.state.id}
          label={addressLevel1Label}
        />
      </div>
      <div className="flex gap-4">
        <Input
          {...getInputProps(fields.postalCode, { type: 'text' })}
          autoComplete={`section-${address.id} postal-code`}
          errors={fields.postalCode.errors}
          key={fields.postalCode.id}
          label={postalCodeLabel}
        />
        <Input
          {...getInputProps(fields.country, { type: 'text' })}
          autoComplete={`section-${address.id} country`}
          errors={fields.country.errors}
          key={fields.country.id}
          label={countryLabel}
        />
      </div>

      <div className="flex gap-1">
        <Button
          aria-label={`${cancelLabel} ${submitLabel} ${address.firstName} ${address.lastName}`}
          onClick={onCancel}
          size="small"
          variant="tertiary"
        >
          {cancelLabel}
        </Button>
        <Button
          aria-label={`${submitLabel} ${address.firstName} ${address.lastName}`}
          name="intent"
          size="small"
          type="submit"
          value={intent}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
