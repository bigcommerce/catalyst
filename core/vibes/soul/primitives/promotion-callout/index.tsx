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
      <div className="flex items-stretch divide-x divide-[hsl(var(--contrast-300))] font-[family-name:var(--promotion-callout-font-family,var(--font-family-body))] text-sm text-[var(--promotion-callout-text,hsl(var(--foreground)))] md:justify-center">
        {callouts.map((callout) => (
          <span
            className="flex flex-1 items-center justify-center px-4 text-center md:flex-none"
            key={callout.id}
          >
            {callout.text}
          </span>
        ))}
      </div>
    </div>
  );
}
