'use client';

import { useEffect, useState } from 'react';

import { Checkbox } from '../checkbox';

import { Product } from '.';

interface Props {
  product: Product;
  compareProducts: Product[];
  setCompareProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const Compare = function Compare({ product, compareProducts, setCompareProducts }: Props) {
  const [isProductInArray, setIsProductInArray] = useState(false);

  useEffect(() => {
    setIsProductInArray(compareProducts.some((p) => p.id === product.id));
  }, [compareProducts, product]);

  const handleCheck = () => {
    setCompareProducts((prevProducts: Product[]) => {
      if (isProductInArray) {
        return prevProducts.filter((p) => p.id !== product.id);
      }

      return [...prevProducts, product];
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCheck();
    }
  };

  return (
    <div
      className="absolute right-1.5 top-1.5 z-10 flex cursor-pointer items-center gap-2 rounded-lg p-1 text-foreground transition-colors duration-300 hover:bg-background/80 @lg:bottom-4 @lg:right-4 @lg:top-auto"
      onClick={handleCheck}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <span className="hidden @lg:block">Compare</span>
      <Checkbox checked={isProductInArray} />
    </div>
  );
};
