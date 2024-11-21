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
  price: Price;
}

export function PriceLabel({ className, price }: Props) {
  if (typeof price === 'string') {
    return <span className={clsx('block font-semibold', className)}>{price}</span>;
  }

  switch (price.type) {
    case 'range':
      return (
        <span className={clsx('block font-semibold', className)}>
          {price.minValue}–{price.maxValue}
        </span>
      );

    case 'sale':
      return (
        <span className={clsx('block font-semibold', className)}>
          <span className="font-normal text-contrast-400 line-through">{price.previousValue}</span>{' '}
          <span className="text-error">{price.currentValue}</span>
        </span>
      );

    default:
      return null;
  }
}
