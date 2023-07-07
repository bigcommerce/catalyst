import { clsx } from 'clsx';
import { ComponentPropsWithoutRef } from 'react';

import { ProductCard } from '../ProductCard';
import { Warning } from '../Warning';

type CardProps = ComponentPropsWithoutRef<typeof ProductCard>;

export interface ProductCardsProps {
  cards: Array<Omit<CardProps, 'className'>>;
  className?: string;
}

export function ProductCards({ cards, className }: ProductCardsProps) {
  if (cards.length === 0) {
    return <Warning className={className}>There are no product cards</Warning>;
  }

  return (
    <div className={clsx(className, 'grid grid-cols-2 gap-0.5 sm:grid-cols-4')}>
      {cards.map((card, index) => (
        <ProductCard {...card} key={index} />
      ))}
    </div>
  );
}
