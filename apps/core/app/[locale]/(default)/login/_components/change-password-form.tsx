'use client';

import { Button } from '@bigcommerce/components/button';
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
  Form,
  FormSubmit,
} from '@bigcommerce/components/form';
import { Input } from '@bigcommerce/components/input';
import { Message } from '@bigcommerce/components/message';
import { Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { logout } from '~/components/header/_actions/logout';
import { useRouter } from '~/navigation';

import { submitChangePasswordForm } from '../_actions/submit-change-password-form';
import { submitCustomerChangePasswordForm } from '../_actions/submit-customer-change-password-form';

interface Props {
  customerId?: number;
  customerToken?: string;
  isLoggedIn: boolean;
}

const SubmitButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('Account.SubmitChangePassword');

  return (
    <Button
      className="relative w-fit items-center px-8 py-2"
      data-button
      disabled={pending}
      variant="primary"
    >
      <>
        {pending && (
          <>
            <span className="absolute z-10 flex h-full w-full items-center justify-center bg-gray-400">
              <Spinner aria-hidden="true" className="animate-spin" />
            </span>
            <span className="sr-only">{t('spinnerText')}</span>
          </>
        )}
        <span aria-hidden={pending}>{t('submitText')}</span>
      </>
    </Button>
  );
};

export const ChangePasswordForm = ({ customerId, customerToken, isLoggedIn }: Props) => {
  const form = useRef<HTMLFormElement>(null);
  const t = useTranslations('Account.ChangePassword');
  const router = useRouter();
  const submitFormAction = isLoggedIn ? submitCustomerChangePasswordForm : submitChangePasswordForm;
  const [state, formAction] = useFormState(submitFormAction, {
    status: 'idle',
    message: '',
  });

  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(true);
  const [isNewPasswordValid, setIsNewPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

  let messageText = '';

  if (state.status === 'error') {
    messageText = state.message;
  }

  if (state.status === 'success') {
    messageText = t('successMessage');
  }

  const handleCurrentPasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setIsCurrentPasswordValid(!e.target.validity.valueMissing);
  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    let currentPasswordValue: FormDataEntryValue | null = null;
    let isValid = true;
    const newPasswordValue = e.target.value;

    if (e.target.form) {
      currentPasswordValue = new FormData(e.target.form).get('current-password');
    }

    if (isLoggedIn) {
      isValid = !e.target.validity.valueMissing && newPasswordValue !== currentPasswordValue;
    } else {
      isValid = !e.target.validity.valueMissing;
    }

    setIsNewPasswordValid(isValid);
  };
  const handleConfirmPasswordValidation = (e: ChangeEvent<HTMLInputElement>) => {
    let newPasswordValue: FormDataEntryValue | null = null;
    const confirmPasswordValue = e.target.value;

    if (e.target.form) {
      newPasswordValue = new FormData(e.target.form).get('new-password');
    }

    setIsConfirmPasswordValid(
      confirmPasswordValue.length > 0 && newPasswordValue === confirmPasswordValue,
    );
  };

  if (state.status === 'success' && !isLoggedIn) {
    setTimeout(() => router.push('/login'), 2000);
  }

  if (state.status === 'success' && isLoggedIn) {
    void logout();
  }

  return (
    <>
      {(state.status === 'error' || state.status === 'success') && (
        <Message className="mb-8 w-full text-gray-500" variant={state.status}>
          <p>{messageText}</p>
        </Message>
      )}

      <Form action={formAction} className="mb-14 flex flex-col gap-4 md:py-4 lg:p-0" ref={form}>
        {Boolean(customerId) && (
          <Field className="hidden" name="customer-id">
            <FieldControl asChild>
              <Input id="customer-id" readOnly type="number" value={customerId} />
            </FieldControl>
          </Field>
        )}
        {Boolean(customerToken) && (
          <Field className="hidden" name="customer-token">
            <FieldControl asChild>
              <Input id="customer-token" readOnly type="text" value={customerToken} />
            </FieldControl>
          </Field>
        )}
        {isLoggedIn && (
          <Field className="relative space-y-2 pb-7" name="current-password">
            <FieldLabel htmlFor="current-password" isRequired={true}>
              {t('currentPasswordLabel')}
            </FieldLabel>
            <FieldControl asChild>
              <Input
                autoComplete="none"
                id="current-password"
                onChange={handleCurrentPasswordChange}
                onInvalid={handleCurrentPasswordChange}
                required
                type="password"
                variant={!isCurrentPasswordValid || state.status === 'error' ? 'error' : undefined}
              />
            </FieldControl>
            <FieldMessage
              className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-gray-500"
              match="valueMissing"
            >
              {t('notEmptyMessage')}
            </FieldMessage>
          </Field>
        )}
        <Field className="relative space-y-2 pb-7" name="new-password">
          <FieldLabel htmlFor="new-password" isRequired={true}>
            {t('newPasswordLabel')}
          </FieldLabel>
          <FieldControl asChild>
            <Input
              autoComplete="none"
              id="new-password"
              onChange={handleNewPasswordChange}
              onInvalid={handleNewPasswordChange}
              required
              type="password"
              variant={!isNewPasswordValid || state.status === 'error' ? 'error' : undefined}
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-gray-500"
            match="valueMissing"
          >
            {t('notEmptyMessage')}
          </FieldMessage>
          {isLoggedIn && (
            <FieldMessage
              className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-gray-500"
              match={(newPasswordValue: string, formData: FormData) => {
                const currentPasswordValue = formData.get('current-password');
                const isMatched = currentPasswordValue === newPasswordValue;

                setIsNewPasswordValid(!isMatched);

                return isMatched;
              }}
            >
              {t('newPasswordValidationMessage')}
            </FieldMessage>
          )}
        </Field>
        <Field className="relative space-y-2 pb-7" name="confirm-password">
          <FieldLabel htmlFor="confirm-password" isRequired={true}>
            {t('confirmPasswordLabel')}
          </FieldLabel>
          <FieldControl asChild>
            <Input
              autoComplete="none"
              id="confirm-password"
              onChange={handleConfirmPasswordValidation}
              onInvalid={handleConfirmPasswordValidation}
              required
              type="password"
              variant={!isConfirmPasswordValid || state.status === 'error' ? 'error' : undefined}
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-gray-500"
            match="valueMissing"
          >
            {t('notEmptyMessage')}
          </FieldMessage>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-gray-500"
            match={(confirmPasswordValue: string, formData: FormData) => {
              const newPasswordValue = formData.get('new-password');
              const isMatched = confirmPasswordValue === newPasswordValue;

              setIsConfirmPasswordValid(isMatched);

              return !isMatched;
            }}
          >
            {t('confirmPasswordValidationMessage')}
          </FieldMessage>
        </Field>
        <FormSubmit asChild>
          <SubmitButton />
        </FormSubmit>
      </Form>
    </>
  );
};
