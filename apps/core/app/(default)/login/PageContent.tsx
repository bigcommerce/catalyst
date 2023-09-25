'use client';

import { Button } from '@bigcommerce/reactant/Button';
import { Message } from '@bigcommerce/reactant/Message';
import Link from 'next/link';
import { useState } from 'react';

import { Login as LoginForm } from 'components/Forms';

const NewCustomer = () => {
  return (
    <div className="inline-flex w-full flex-col gap-4 bg-gray-100 p-8 lg:w-max">
      <h3 className="text-h5">New customer?</h3>
      <p className="text-base font-semibold">Create an account with us and you'll be able to:</p>
      <ul className="list-disc ps-4">
        <li>Check out faster</li>
        <li>Save multiple shipping addresses</li>
        <li>Access your order history</li>
        <li>Track new orders</li>
        <li>Save items to your Wish List</li>
      </ul>
      <Button asChild className="w-fit items-center px-8 py-2">
        <Link
          href={{
            pathname: '/login',
            query: { action: 'create_account' },
          }}
        >
          Create Account
        </Link>
      </Button>
    </div>
  );
};

export const PageContent = () => {
  const [isFormInvalid, showIsFormInvalid] = useState(false);

  return (
    <div className="mx-auto flex flex-col gap-8">
      <h2 className="mb-3 text-h2">Log In</h2>
      {isFormInvalid && (
        <Message aria-labelledby="error-message" aria-live="polite" role="region" variant="error">
          <p id="error-message">
            Your email address or password is incorrect. Try signing in again or
            <strong> reset your password</strong>.
          </p>
        </Message>
      )}
      <div>
        <LoginForm onFormValidate={showIsFormInvalid} />
        <NewCustomer />
      </div>
    </div>
  );
};
