import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';

export type TaxMode = 'INC' | 'EX' | 'BOTH';

export interface Money {
  inc: string;
  ex: string;
}

export interface PricePlain {
  type: 'plain';
  money: Money;
  mode?: TaxMode;
}

export interface PriceRange {
  type: 'range';
  min: Money;
  max: Money;
  mode?: TaxMode;
}

export interface PriceSale {
  type: 'sale';
  previous: Money;
  current: Money;
  mode?: TaxMode;
}

export type Price = string | PricePlain | PriceRange | PriceSale;

interface Props {
  className?: string;
  colorScheme?: 'light' | 'dark';
  price: Price;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --price-light-text: hsl(var(--foreground));
 *   --price-light-sale-text: hsl(var(--foreground));
 *   --price-dark-text: hsl(var(--background));
 *   --price-dark-sale-text: hsl(var(--background));
 * }
 * ```
 */
export function PriceLabel({ className, colorScheme = 'light', price }: Props) {
  const t = useTranslations('Components.Price');

  const baseColorClass = {
    light: 'text-[var(--price-light-text,hsl(var(--foreground)))]',
    dark: 'text-[var(--price-dark-text,hsl(var(--background)))]',
  }[colorScheme];

  if (typeof price === 'string') {
    return <span className={clsx('block font-semibold', baseColorClass, className)}>{price}</span>;
  }

  const mode: TaxMode = price.mode ?? 'EX';

  if (mode === 'BOTH') {
    const includingTaxLabel = t('includingTax');
    const excludingTaxLabel = t('excludingTax');
    const includingTaxTooltip = t('includingTaxFull');
    const excludingTaxTooltip = t('excludingTaxFull');

    return (
      <span className={clsx('block font-semibold', baseColorClass, className)}>
        <span className="block">
          <PriceLine colorScheme={colorScheme} price={price} t={t} tax="inc" />{' '}
          <abbr className="cursor-help font-normal opacity-60" title={includingTaxTooltip}>
            {includingTaxLabel}
          </abbr>
        </span>
        <span className="block">
          <PriceLine colorScheme={colorScheme} dim price={price} t={t} tax="ex" />{' '}
          <abbr className="cursor-help font-normal opacity-60" title={excludingTaxTooltip}>
            {excludingTaxLabel}
          </abbr>
        </span>
      </span>
    );
  }

  const tax: 'inc' | 'ex' = mode === 'EX' ? 'ex' : 'inc';

  return (
    <span className={clsx('block font-semibold', baseColorClass, className)}>
      <PriceLine colorScheme={colorScheme} price={price} t={t} tax={tax} />
    </span>
  );
}

function PriceLine({
  price,
  tax,
  t,
  colorScheme,
  dim,
}: {
  price: PricePlain | PriceRange | PriceSale;
  tax: 'inc' | 'ex';
  t: ReturnType<typeof useTranslations<'Components.Price'>>;
  colorScheme: 'light' | 'dark';
  dim?: boolean;
}) {
  const dimClass = dim ? 'opacity-60' : undefined;
  const pick = (m: Money) => m[tax];

  if (price.type === 'plain') {
    return <span className={dimClass}>{pick(price.money)}</span>;
  }

  if (price.type === 'range') {
    return (
      <>
        <span className="sr-only">
          {t('range', { minValue: pick(price.min), maxValue: pick(price.max) })}
        </span>
        <span aria-hidden="true" className={dimClass}>
          {pick(price.min)} - {pick(price.max)}
        </span>
      </>
    );
  }

  const saleColorClass = {
    light: 'text-[var(--price-light-sale-text,hsl(var(--foreground)))]',
    dark: 'text-[var(--price-dark-sale-text,hsl(var(--background)))]',
  }[colorScheme];

  return (
    <>
      <span className="sr-only">{t('originalPrice', { price: pick(price.previous) })}</span>
      <span aria-hidden="true" className="font-normal line-through opacity-50">
        {pick(price.previous)}
      </span>{' '}
      <span className="sr-only">{t('currentPrice', { price: pick(price.current) })}</span>
      <span aria-hidden="true" className={clsx(saleColorClass, dimClass)}>
        {pick(price.current)}
      </span>
    </>
  );
}
