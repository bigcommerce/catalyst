import clsx from 'clsx';
import { ComponentPropsWithoutRef } from 'react';

import { ProductCard } from '../ProductCard';
import { Warning } from '../Warning';

type CardProps = ComponentPropsWithoutRef<typeof ProductCard>;

interface Props {
  cards: Array<Omit<CardProps, 'className'>>;
  className?: string;
}

export function ProductCards({ cards, className }: Props) {
  if (cards.length === 0) {
    return <Warning className={className}>There are no product cards</Warning>;
  }

  return (
    <div className={clsx(className, 'grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 md:gap-x-8')}>
      {cards.map((card, index) => (
        <ProductCard {...card} key={index} />
      ))}
    </div>
  );
}
