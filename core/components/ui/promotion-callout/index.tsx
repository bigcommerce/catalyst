import { useTranslations } from 'next-intl';

import { cn } from '~/lib/utils';

export interface PromotionCallout {
  entityId: number;
  text: string;
}

interface PromotionCalloutListProps {
  callouts: PromotionCallout[];
  variant?: 'compact' | 'full';
  className?: string;
}

export const PromotionCalloutList = ({
  callouts,
  variant = 'compact',
  className,
}: PromotionCalloutListProps) => {
  const t = useTranslations('Product.PromotionCallout');

  if (callouts.length === 0) {
    return null;
  }

  if (variant === 'compact') {
    const [first, ...rest] = callouts;

    return (
      <div className={cn('flex flex-wrap items-center gap-1', className)}>
        <span className="inline-block rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
          {first?.text}
        </span>
        {rest.length > 0 && (
          <span className="text-xs text-gray-500">{t('more', { count: rest.length })}</span>
        )}
      </div>
    );
  }

  return (
    <ul className={cn('flex flex-col gap-1', className)}>
      {callouts.map((callout) => (
        <li key={callout.entityId}>
          <span className="inline-block rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
            {callout.text}
          </span>
        </li>
      ))}
    </ul>
  );
};
