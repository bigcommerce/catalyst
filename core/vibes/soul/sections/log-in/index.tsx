import { Link } from '~/components/link';

import { clsx } from 'clsx';

import { Button } from '@/vibes/soul/primitives/button';
import { Input } from '@/vibes/soul/primitives/input';

export interface LogInProps {
  className?: string;
}

export const LogIn = function LogIn({ className }: LogInProps) {
  return (
    <div className={clsx('@container', className)}>
      <div className="flex flex-col justify-center gap-y-24 px-3 py-10 @xl:flex-row @xl:px-6 @4xl:py-20 @5xl:px-20">
        <div className="flex w-full flex-col @xl:max-w-md @xl:border-r @xl:pr-10 @4xl:pr-20">
          <h1 className="mb-10 text-4xl font-medium leading-none @xl:text-5xl">Log In</h1>
          <form className="flex flex-grow flex-col gap-5">
            <Input type="text" placeholder="hello@example.com" label="Username" />
            <Input type="password" label="Password" className="mb-6" />
            <Button variant="secondary" className="mt-auto w-full">
              Log In
            </Button>
          </form>
          <Link href="#" className="-mb-10 mt-4 text-sm font-semibold">
            Forgot your password?
          </Link>
        </div>

        <div className="flex w-full flex-col @xl:max-w-md @xl:pl-10 @4xl:pl-20">
          <h2 className="mb-10 text-4xl font-medium leading-none @xl:text-5xl">New Customer?</h2>
          <p>Create an account with us and you&apos;ll be able to:</p>
          <ul className="mb-10 ml-4 mt-4 list-disc">
            <li>Check out faster</li>
            <li>Save multiple shipping addresses</li>
            <li>Access your order history</li>
            <li>Track new orders</li>
            <li>Save items to your Wish List</li>
          </ul>
          <Button variant="secondary" className="mt-auto w-full">
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
};
