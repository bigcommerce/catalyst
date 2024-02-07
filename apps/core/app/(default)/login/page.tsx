import { Button } from '@bigcommerce/components/Button';

import { Link } from '~/components/link';

import { LoginForm } from './_components/login-form';

export const metadata = {
  title: 'Login',
};

export default function Login() {
  return (
    <div className="mx-auto my-6 max-w-4xl">
      <h2 className="mb-8 text-h2">Log In</h2>
      <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
        <LoginForm />
        <div className="flex flex-col gap-4 bg-gray-100 p-8">
          <h3 className="mb-3 text-h5">New customer?</h3>
          <p className="text-base font-semibold">
            Create an account with us and you'll be able to:
          </p>
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
      </div>
    </div>
  );
}

export const runtime = 'edge';
