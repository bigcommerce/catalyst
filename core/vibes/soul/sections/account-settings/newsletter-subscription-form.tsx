'use client';

import { SubmissionResult } from '@conform-to/react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useState } from 'react';

import { Switch } from '@/vibes/soul/form/switch';
import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: string;
}

export type UpdateNewsletterSubscriptionAction = Action<State, FormData>;

export interface NewsletterSubscriptionFormProps {
  action: UpdateNewsletterSubscriptionAction;
  isAccountSubscribed: boolean;
  label?: string;
  ctaLabel?: string;
}

export function NewsletterSubscriptionForm({
  action,
  isAccountSubscribed,
  label = 'Opt-in to receive emails about new products and promotions.',
  ctaLabel = 'Update',
}: NewsletterSubscriptionFormProps) {
  const t = useTranslations('Account.Settings.NewsletterSubscription');

  const [checked, setChecked] = useState(isAccountSubscribed);
  const [state, formAction, isPending] = useActionState(action, {
    lastResult: null,
  });

  const onCheckedChange = (value: boolean) => {
    setChecked(value);
  };

  useEffect(() => {
    if (state.lastResult?.status === 'success' && state.successMessage != null) {
      toast.success(state.successMessage);
    }

    if (state.lastResult?.error) {
      // eslint-disable-next-line no-console
      console.log(state.lastResult.error);
      toast.error(t('somethingWentWrong'));
    }
  }, [state, t]);

  return (
    <form action={formAction} className="space-y-5">
      <input name="intent" type="hidden" value={checked ? 'subscribe' : 'unsubscribe'} />
      <Switch checked={checked} label={label} onCheckedChange={onCheckedChange} />
      <Button
        disabled={isAccountSubscribed === checked}
        loading={isPending}
        size="small"
        type="submit"
        variant="secondary"
      >
        {ctaLabel}
      </Button>
    </form>
  );
}
