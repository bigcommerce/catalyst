import { Loader2 as Spinner } from 'lucide-react';
import React from 'react';

import { ButtonProps, Button as UIButton } from '~/components/ui/button';
import { cn } from '~/lib/utils';

interface Props extends ButtonProps {
  loadingText?: string;
  loading?: boolean;
}

export const Button = ({
  children,
  className,
  disabled,
  loading = false,
  loadingText,
  ...props
}: Props) => (
  <UIButton className={cn(className)} disabled={disabled || loading} {...props}>
    {loading ? (
      <>
        <Spinner aria-hidden="true" className="animate-spin" />
        <span className="sr-only">{loadingText}</span>
      </>
    ) : (
      children
    )}
  </UIButton>
);
