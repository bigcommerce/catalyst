import { clsx } from 'clsx';
import { Tag } from 'lucide-react';

export interface PromotionCalloutItem {
  id: string;
  text: string;
}

interface PromotionCalloutProps {
  callouts: PromotionCalloutItem[];
  collapsed?: boolean;
  moreLabel?: string;
  className?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --promotion-callout-text: hsl(var(--accent));
 *   --promotion-callout-font-family: var(--font-family-body);
 *   --promotion-callout-icon-color: hsl(var(--accent));
 * }
 * ```
 */
export function PromotionCallout({
  callouts,
  collapsed = false,
  moreLabel = '+{count} more',
  className,
}: PromotionCalloutProps) {
  if (callouts.length === 0) {
    return null;
  }

  const visibleCallouts = collapsed ? callouts.slice(0, 1) : callouts;
  const remainingCount = callouts.length - 1;

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {visibleCallouts.map((callout) => (
        <div
          className="flex items-center gap-1.5 font-[family-name:var(--promotion-callout-font-family,var(--font-family-body))] text-xs leading-tight text-[var(--promotion-callout-text,hsl(var(--accent)))]"
          key={callout.id}
        >
          <Tag
            aria-hidden
            className="h-3 w-3 shrink-0 text-[var(--promotion-callout-icon-color,hsl(var(--accent)))]"
          />
          <span>{callout.text}</span>
        </div>
      ))}
      {collapsed && remainingCount > 0 && (
        <span className="text-xs text-[var(--promotion-callout-text,hsl(var(--accent)))]">
          {moreLabel.replace('{count}', String(remainingCount))}
        </span>
      )}
    </div>
  );
}
