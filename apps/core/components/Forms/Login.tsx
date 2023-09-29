import { Button } from '@bigcommerce/reactant/Button';
import { cs } from '@bigcommerce/reactant/cs';
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
  Form,
  FormSubmit,
} from '@bigcommerce/reactant/Form';
import { Input } from '@bigcommerce/reactant/Input';
import { Loader2 as Spinner } from 'lucide-react';
import Link from 'next/link';
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import { experimental_useFormStatus as useFormStatus } from 'react-dom';

import { submitLoginForm } from './_actions/submitLoginForm';

export const Login = ({ onFormSubmit }: { onFormSubmit: Dispatch<SetStateAction<boolean>> }) => {
  const { pending } = useFormStatus();
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const onSubmit = async (formData: FormData) => {
    const { status } = await submitLoginForm(formData);

    if (status === 'failed') {
      onFormSubmit(true);
    }
  };

  const handleInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const validationStatus = e.target.validity.valueMissing;

    if (e.target.name === 'email') {
      return setIsEmailValid(!validationStatus);
    }

    return setIsPasswordValid(!validationStatus);
  };

  return (
    <Form
      action={onSubmit}
      className=" mb-14 inline-flex w-full flex-col md:gap-y-3 md:p-8 lg:mb-0 lg:me-8 lg:w-max lg:px-0"
    >
      <Field className={cs('relative space-y-2 pb-7')} name="email">
        <FieldLabel>Email</FieldLabel>
        <FieldControl asChild>
          <Input
            autoComplete="email"
            onChange={handleInputValidation}
            onInvalid={handleInputValidation}
            required
            type="email"
            variant={!isEmailValid ? 'error' : undefined}
          />
        </FieldControl>
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-red-200"
          match="valueMissing"
        >
          Enter your email.
        </FieldMessage>
      </Field>
      <Field className={cs('relative space-y-2 pb-7')} name="password">
        <FieldLabel>Password</FieldLabel>
        <FieldControl asChild>
          <Input
            onChange={handleInputValidation}
            onInvalid={handleInputValidation}
            required
            type="password"
            variant={!isPasswordValid ? 'error' : undefined}
          />
        </FieldControl>
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-red-200"
          match="valueMissing"
        >
          Enter your password.
        </FieldMessage>
      </Field>
      <div className="mt-3 flex flex-col gap-y-5 md:mt-0 md:flex-row md:gap-x-10">
        <FormSubmit asChild>
          <Button className="w-fit items-center px-8 py-2" disabled={pending} variant="primary">
            {pending ? (
              <>
                <Spinner aria-hidden="true" className="animate-spin" />
                <span className="sr-only">Submitting...</span>
              </>
            ) : (
              <span>Log in</span>
            )}
          </Button>
        </FormSubmit>
        <Link
          className="inline-flex items-center justify-start text-blue-primary hover:text-blue-secondary"
          href={{
            pathname: '/login',
            query: { action: 'reset_password' },
          }}
        >
          Forgot your password?
        </Link>
      </div>
    </Form>
  );
};
