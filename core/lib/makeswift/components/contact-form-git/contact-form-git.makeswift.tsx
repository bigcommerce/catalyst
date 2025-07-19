'use client';

import { TextInput, Style, Select } from '@makeswift/runtime/controls';
import { runtime } from '../../runtime';
import clsx from 'clsx';
import { Input } from '@/vibes/soul/form/input';
import { Textarea } from '@/vibes/soul/form/textarea';
import { Button } from '@/vibes/soul/primitives/button';

interface ContactFormGITProps {
  email: string;
  className?: string;
  itemsPerRowSuperDesktop: string;
  itemsPerRowDesktop: string;
  itemsPerRowTablet: string;
  itemsPerRowMobile: string;
  buttonTypeVariant: 'primary' | 'danger' | 'ghost' | 'secondary' | 'tertiary' | undefined;
  buttonText: string;
}

runtime.registerComponent(
  function ContactFormGIT({
    email,
    className,
    itemsPerRowDesktop,
    itemsPerRowMobile,
    itemsPerRowSuperDesktop,
    itemsPerRowTablet,
    buttonTypeVariant,
    buttonText,
    ...props
  }: ContactFormGITProps) {
    return (
      <div className={clsx('', className)}>
        <form>
          <div
            className={clsx(
              'grid gap-5',
              `grid-cols-${itemsPerRowMobile}`,
              `sm:grid-cols-${itemsPerRowTablet}`,
              `lg:grid-cols-${itemsPerRowDesktop}`,
              `xl:grid-cols-${itemsPerRowSuperDesktop}`,
            )}
          >
            <Input required label="Full name" type="text" placeholder="Jhon Doe" />
            <Input required label="Email" type="email" placeholder="jhon.doe@example.com" />
            <Input label="Phone" type="text" placeholder="Your phone number here" />
            <Input label="Business Name" type="text" placeholder="Your business name here" />
            <Input required label="Subject" type="text" placeholder="Your subject here" />
          </div>
          <Textarea
            className="mt-4"
            required
            label="Message"
            placeholder="Your message here"
            rows={4}
          />
          <Button type="submit" className="mt-4" variant={buttonTypeVariant}>
            {buttonText}
          </Button>
        </form>
      </div>
    );
  },
  {
    type: 'contact-form-git',
    label: 'GIT / Contact Form (GIT)',
    props: {
      className: Style(),
      email: TextInput({
        label: 'Email',
        defaultValue: '',
      }),
      buttonText: TextInput({
        label: 'Button Text',
        defaultValue: 'Send Message',
      }),
      buttonTypeVariant: Select({
        label: 'Button Type Variant',
        defaultValue: 'primary',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'danger', label: 'Danger' },
          { value: 'ghost', label: 'Ghost' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'tertiary', label: 'Tertiary' },
        ],
      }),
      itemsPerRowSuperDesktop: Select({
        label: 'Items Per Row (Super Desktop)',
        defaultValue: '2',
        options: [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
        ],
      }),
      itemsPerRowDesktop: Select({
        label: 'Items Per Row (Desktop)',
        defaultValue: '2',
        options: [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
        ],
      }),
      itemsPerRowTablet: Select({
        label: 'Items Per Row (Tablet)',
        defaultValue: '2',
        options: [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
        ],
      }),
      itemsPerRowMobile: Select({
        label: 'Items Per Row (Mobile)',
        defaultValue: '2',
        options: [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
        ],
      }),
    },
  },
);
