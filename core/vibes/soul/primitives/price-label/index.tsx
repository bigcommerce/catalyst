import { clsx } from 'clsx';

export interface PriceRange {
  type: 'range';
  minValue: string;
  maxValue: string;
}

export interface PriceSale {
  type: 'sale';
  previousValue: string;
  currentValue: string;
}

export type Price = string | PriceRange | PriceSale;

interface Props {
  className?: string;
  colorScheme?: 'light' | 'dark';
  price: Price | [Price, Price];
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
  if (Array.isArray(price)) {
    return (
      <>
        <PriceLabel className={className} colorScheme={colorScheme} price={price[0]} />
        <PriceLabel className={className} colorScheme={colorScheme} price={price[1]} />
      </>
    );
  }

  if (typeof price === 'string') {
    return (
      <span
        className={clsx(
          'block font-semibold',
          {
            light: 'text-[var(--price-light-text,hsl(var(--foreground)))]',
            dark: 'text-[var(--price-dark-text,hsl(var(--background)))]',
          }[colorScheme],
          className,
        )}
      >
        {price}
      </span>
    );
  }

  switch (price.type) {
    case 'range':
      return (
        <span
          className={clsx(
            'block font-semibold',
            {
              light: 'text-[var(--price-light-text,hsl(var(--foreground)))]',
              dark: 'text-[var(--price-dark-text,hsl(var(--background)))]',
            }[colorScheme],
            className,
          )}
        >
          {price.minValue}
          &nbsp;&ndash;&nbsp;
          {price.maxValue}
        </span>
      );

    case 'sale':
      return (
        <span className={clsx('block font-semibold', className)}>
          <span
            className={clsx(
              'font-normal line-through opacity-50',
              {
                light: 'text-[var(--price-light-text,hsl(var(--foreground)))]',
                dark: 'text-[var(--price-dark-text,hsl(var(--background)))]',
              }[colorScheme],
            )}
          >
            {price.previousValue}
          </span>{' '}
          <span
            className={clsx(
              {
                light: 'text-[var(--price-light-sale-text,hsl(var(--foreground)))]',
                dark: 'text-[var(--price-dark-sale-text,hsl(var(--background)))]',
              }[colorScheme],
            )}
          >
            {price.currentValue}
          </span>
        </span>
      );

    default:
      return null;
  }
}
