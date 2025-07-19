'use client';

import React from 'react';
import { TextInput, Style, Select } from '@makeswift/runtime/controls';
import { runtime } from '../../runtime';
import clsx from 'clsx';
import { Input } from '@/vibes/soul/form/input';
import { Textarea } from '@/vibes/soul/form/textarea';
import { Button } from '@/vibes/soul/primitives/button';
import { Alert } from '@/vibes/soul/primitives/alert';

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
    const [form, setForm] = React.useState({
      fullName: '',
      email: '',
      phone: '',
      businessName: '',
      subject: '',
      message: '',
    });
    const [submitting, setSubmitting] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState('');
    // Timer refs to clear timeouts if needed
    const successTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const errorTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Hide success alert after 10 seconds
    React.useEffect(() => {
      if (success) {
        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = setTimeout(() => {
          setSuccess(false);
        }, 10000);
      }
      return () => {
        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      };
    }, [success]);

    // Hide error alert after 10 seconds
    React.useEffect(() => {
      if (error) {
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = setTimeout(() => {
          setError('');
        }, 10000);
      }
      return () => {
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      };
    }, [error]);
    const requiredFieldsFilled =
      form.fullName.trim() && form.email.trim() && form.subject.trim() && form.message.trim();

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setSubmitting(true);
      setError('');
      setSuccess(false);
      try {
        // Replace '/api/send-contact-email' with your actual backend endpoint
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, to: email }),
        });
        if (!res.ok) throw new Error('Failed to send email');
        setSuccess(true);
        setForm({
          fullName: '',
          email: '',
          phone: '',
          businessName: '',
          subject: '',
          message: '',
        });
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setSubmitting(false);
      }
    }

    return (
      <div className={clsx('', className)}>
        <form onSubmit={handleSubmit}>
          <div
            className={clsx(
              'grid gap-5',
              `grid-cols-${itemsPerRowMobile}`,
              `sm:grid-cols-${itemsPerRowTablet}`,
              `lg:grid-cols-${itemsPerRowDesktop}`,
              `xl:grid-cols-${itemsPerRowSuperDesktop}`,
            )}
          >
            <Input
              required
              label="Full name"
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
            />
            <Input
              required
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Phone"
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
            <Input
              label="Business Name"
              type="text"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
            />
            <Input
              required
              label="Subject"
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
            />
          </div>
          <Textarea
            className="mt-4"
            required
            label="Message"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your message here"
            rows={4}
          />
          {error && <Alert message={error} variant="error" />}
          {success && <Alert message={'Message sent successfully!'} variant="success" />}
          <Button
            type="submit"
            className="mt-4"
            variant={buttonTypeVariant}
            loading={submitting}
            disabled={!requiredFieldsFilled || submitting}
          >
            {submitting ? 'Sending...' : buttonText}
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
