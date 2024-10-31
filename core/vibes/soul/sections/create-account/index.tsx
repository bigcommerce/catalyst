import { Link } from '~/components/link';

import { Button } from '@/vibes/soul/primitives/button';
import { Dropdown } from '@/vibes/soul/primitives/dropdown';
import { Input } from '@/vibes/soul/primitives/input';

export const CreateAccount = function CreateAccount() {
  return (
    <section className="@container">
      <div className="px-3 py-10 @xl:px-6 @4xl:py-20 @5xl:px-20">
        <h1 className="mb-10 text-4xl font-medium leading-none @xl:text-5xl">Create Account</h1>

        <form className="mb-5 grid grid-cols-1 gap-x-5 gap-y-6 @lg:grid-cols-2">
          <Input type="text" label="Username" required />
          <div />
          <Input type="password" label="Password" required />
          <Input type="password" label="Confirm Password" required />

          <hr className="my-10 border-contrast-100 @lg:col-span-2" />

          <Input type="text" label="First Name" required />
          <Input type="text" label="Last Name" required />
          <Input type="text" label="Company Name" />
          <Input type="text" label="Phone Number" />

          <hr className="my-10 border-contrast-100 @lg:col-span-2" />

          <Input type="text" label="Address Line 1" required />
          <Input type="text" label="Address Line 2" />

          <Input type="text" label="Suburb/City" required />
          <Dropdown
            label="State/Provence"
            labelOnTop
            items={['Georgia', 'Florida', 'California']}
            required
          />
          <Dropdown label="Country" labelOnTop items={['USA', 'England', 'Brazil']} required />
          <Input type="text" label="Zip/PostCode" required />

          <Button variant="secondary" className="mt-4 w-full">
            Create Account
          </Button>
        </form>

        <span className="mr-1.5 text-sm">Already have an account?</span>
        <Link href="#" className="-mb-10 mt-4 text-sm font-semibold">
          Log in
        </Link>
      </div>
    </section>
  );
};
