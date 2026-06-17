import { Fragment } from 'react';

import { clsx } from 'clsx';

export interface PromotionCalloutItem {
  id: string;
  text: string;
}

interface PromotionCalloutProps {
  callouts: PromotionCalloutItem[];
  className?: string;
}

export function PromotionCallout({ callouts, className }: PromotionCalloutProps) {
  if (callouts.length === 0) return null;

  return (
    <div
      className={clsx(
        'w-full bg-[var(--promotion-callout-background,hsl(var(--contrast-100)))] py-2.5',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 font-[family-name:var(--promotion-callout-font-family,var(--font-family-body))] text-sm text-[var(--promotion-callout-text,hsl(var(--foreground)))]">
        {callouts.map((callout, i) => (
          <Fragment key={callout.id}>
            {i > 0 && (
              <span aria-hidden className="select-none text-[hsl(var(--contrast-300))]">
                |
              </span>
            )}
            <span>{callout.text}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
