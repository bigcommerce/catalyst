'use client';

import { Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
  Form,
  FormSubmit,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Message } from '~/components/ui/message';
import { useRouter } from '~/navigation';

import { submitChangePasswordForm } from '../_actions/submit-change-password-form';

interface Props {
  customerId: string;
  customerToken: string;
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

export const ChangePasswordForm = ({ customerId, customerToken }: Props) => {
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [state, formAction] = useFormState(submitChangePasswordForm, {
    status: 'idle',
    message: '',
  });

  const [newPassword, setNewPasssword] = useState('');
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

  const t = useTranslations('Account.ChangePassword');
  let messageText = '';

  if (state.status === 'error') {
    messageText = state.message;
  }

  if (state.status === 'success') {
    messageText = t('successMessage');
  }

  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setNewPasssword(e.target.value);
  const handleConfirmPasswordValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value;

    return setIsConfirmPasswordValid(confirmPassword === newPassword);
  };

  if (state.status === 'success') {
    setTimeout(() => router.push('/login'), 2000);
  }

  return (
    <>
      {(state.status === 'error' || state.status === 'success') && (
        <Message className="mb-8 w-full text-gray-500" variant={state.status}>
          <p>{messageText}</p>
        </Message>
      )}

      <Form action={formAction} className="mb-14 flex flex-col gap-4 md:py-4 lg:p-0" ref={form}>
        <Field className="hidden" name="customer-id">
          <FieldControl asChild>
            <Input id="customer-id" readOnly type="number" value={customerId} />
          </FieldControl>
        </Field>
        <Field className="hidden" name="customer-token">
          <FieldControl asChild>
            <Input id="customer-token" readOnly type="text" value={customerToken} />
          </FieldControl>
        </Field>
        <Field className="relative space-y-2 pb-7" name="new-password">
          <FieldLabel htmlFor="new-password" isRequired={true}>
            {t('newPasswordLabel')}
          </FieldLabel>
          <FieldControl asChild>
            <Input
              autoComplete="none"
              id="new-password"
              onChange={handleNewPasswordChange}
              required
              type="password"
              variant={state.status === 'error' ? 'error' : undefined}
            />
          </FieldControl>
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
            match={(value: string) => value !== newPassword}
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
