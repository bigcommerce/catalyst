import { clsx } from 'clsx';
import { SubHeading } from '~/alto/alto-avios';

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
  if (typeof price === 'string') {
    return (
      <SubHeading as="span" foregroundColor="accentPrimary" size="xs">
        {price}
      </SubHeading>
    );
  }

  switch (price.type) {
    case 'range':
      return (
        <SubHeading as="span" foregroundColor="accentPrimary" size="xs">
          {price.minValue}
          &nbsp;&ndash;&nbsp;
          {price.maxValue}
        </SubHeading>
      );

    case 'sale':
      return (
        <SubHeading as="span" foregroundColor="accentPrimary" size="xs">
          <SubHeading as="span" foregroundColor="accentPrimary" size="xs">
            {price.previousValue}
          </SubHeading>{' '}
          <SubHeading as="span" foregroundColor="accentPrimary" size="xs">
            {price.currentValue}
          </SubHeading>
        </SubHeading>
      );

    default:
      return null;
  }
}
