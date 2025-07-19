'use client';

import { TextInput, Style } from '@makeswift/runtime/controls';
import { runtime } from '../../runtime';
import clsx from 'clsx';
import { Input } from '@/vibes/soul/form/input';
import { Textarea } from '@/vibes/soul/form/textarea';
import { Button } from '@/vibes/soul/primitives/button';

interface ContactFormGITProps {
  email: string;
  className?: string;
}

runtime.registerComponent(
  function ContactFormGIT({ email, className, ...props }: ContactFormGITProps) {
    return (
      <div className={clsx('grid grid-cols-2 gap-4', className)}>
        <form>
          <Input required label="Full name" type="text" placeholder="Jhon Doe" />
          <Input required label="Email" type="email" placeholder="jhon.doe@example.com" />
          <Input label="Phone" type="text" placeholder="Your phone number here" />
          <Input label="Business Name" type="text" placeholder="Your business name here" />
          <Input required label="Subject" type="text" placeholder="Your subject here" />
          <Textarea required label="Message" placeholder="Your message here" rows={4} />
          <Button
            type="submit"
            className="col-span-2 mt-4 w-full bg-blue-600 text-white hover:bg-blue-700"
          />
        </form>
      </div>
    );
  },
  {
    type: 'contact-form-git',
    label: 'Contact Form GIT',
    props: {
      className: Style(),
      email: TextInput({
        label: 'Email',
        defaultValue: '',
      }),
    },
  },
);
