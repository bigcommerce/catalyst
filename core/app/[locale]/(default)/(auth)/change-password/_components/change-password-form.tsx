'use client';

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
  Input,
} from '~/components/ui/form';
import { Message } from '~/components/ui/message';
import { useRouter } from '~/i18n/routing';

import { useAccountStatusContext } from '../../../account/(tabs)/_components/account-status-provider';
import { changePassword } from '../_actions/change-password';

interface Props {
  customerId: string;
  customerToken: string;
}

const SubmitButton = () => {
  const t = useTranslations('ChangePassword.Form');

  const { pending } = useFormStatus();

  return (
    <Button
      className="relative w-fit items-center px-8 py-2"
      data-button
      loading={pending}
      loadingText={t('submitting')}
      variant="primary"
    >
      {t('submit')}
    </Button>
  );
};

export const ChangePasswordForm = ({ customerId, customerToken }: Props) => {
  const t = useTranslations('ChangePassword.Form');

  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [state, formAction] = useFormState(changePassword, {
    status: 'idle',
    message: '',
  });

  const [newPassword, setNewPasssword] = useState('');
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
  const { setAccountState } = useAccountStatusContext();

  let messageText = '';

  if (state.status === 'error') {
    messageText = state.message;
  }

  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setNewPasssword(e.target.value);
  const handleConfirmPasswordValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value;

    setIsConfirmPasswordValid(confirmPassword === newPassword);
  };

  if (state.status === 'success') {
    setAccountState({ status: 'success', message: t('confirmChangePassword') });
    router.push('/login');
  }

  return (
    <>
      {state.status === 'error' && (
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
              error={state.status === 'error'}
              id="new-password"
              onChange={handleNewPasswordChange}
              required
              type="password"
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
              error={!isConfirmPasswordValid || state.status === 'error'}
              id="confirm-password"
              onChange={handleConfirmPasswordValidation}
              onInvalid={handleConfirmPasswordValidation}
              required
              type="password"
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
