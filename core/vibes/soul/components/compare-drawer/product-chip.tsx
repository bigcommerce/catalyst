'use client';

import { clsx } from 'clsx';
import { X } from 'lucide-react';

import { Product } from '@/vibes/soul/components/product-card';
import { BcImage } from '~/components/bc-image';

interface Props {
  product: Product;
  setCompareProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const ProductChip = function ProductChip({ product, setCompareProducts }: Props) {
  return (
    <button
      aria-label="Remove product"
      className={clsx(
        'group relative flex items-center whitespace-nowrap rounded-xl border border-contrast-100 bg-background font-semibold transition-all duration-150 hover:bg-contrast-100',
        'ring-primary focus:outline-0 focus:ring-2',
      )}
      onClick={() =>
        setCompareProducts((prevProducts: Product[]) => {
          return prevProducts.filter((p) => p.id !== product.id);
        })
      }
    >
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[11px] bg-primary-highlight bg-opacity-10 @4xl:rounded-r-none">
        {product.image?.src != null ? (
          <BcImage
            alt={product.image.altText}
            className="object-cover"
            height={50}
            src={product.image.src}
            width={50}
          />
        ) : (
          <span className="max-w-full break-all p-1 text-xs text-primary-shadow opacity-20">
            {getInitials(product.name)}
          </span>
        )}
      </div>
      <span className="ml-3 hidden text-foreground @4xl:block">{product.name}</span>
      <div className="absolute -right-1.5 -top-1.5 ml-1 flex h-5 w-5 items-center justify-center rounded-full border border-contrast-100 bg-background text-contrast-400 transition-[colors,transform] duration-150 group-hover:scale-110 group-hover:text-foreground @4xl:relative @4xl:right-auto @4xl:top-auto @4xl:mr-2.5 @4xl:border-none @4xl:bg-transparent">
        <X className="hidden @4xl:block" />
        <div className="h-px w-2.5 bg-foreground @4xl:hidden" />
      </div>
    </button>
  );
};
