'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/vibes/soul/components/button';
import { CompareCard, CompareCardSkeleton } from '@/vibes/soul/components/compare-card';
import { Product } from '@/vibes/soul/components/product-card';
import { SidePanel } from '@/vibes/soul/components/side-panel';

interface Props {
  compareProducts: Product[];
}

export const ComparePanel = function ComparePanel({ compareProducts }: Props) {
  const [compareOpen, setCompareOpen] = useState(false);

  return (
    <SidePanel
      content={
        <>
          <VisuallyHidden.Root>
            <Dialog.Title className="DialogTitle">Compare</Dialog.Title>
          </VisuallyHidden.Root>
          <div className="mb-12 flex flex-wrap-reverse items-center justify-between gap-x-4">
            <h1 className="text-2xl font-medium leading-none @xl:text-4xl">
              Compare <span className="text-contrast-300">{compareProducts.length} Products</span>
            </h1>
            <Button
              asChild
              className="-mr-2 ml-auto [&_div]:!px-1"
              onClick={() => setCompareOpen(false)}
              size="small"
              variant="tertiary"
            >
              <div>
                <X className="text-background" size={18} strokeWidth={1.5} />
              </div>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-10 @xl:grid-cols-2">
            {compareProducts.length > 0
              ? compareProducts.map((product) => <CompareCard key={product.id} {...product} />)
              : Array.from({ length: 5 }).map((_, index) => <CompareCardSkeleton key={index} />)}
          </div>
        </>
      }
      isOpen={compareOpen}
      setOpen={setCompareOpen}
      trigger={
        <Button asChild>
          <div className="flex">
            Compare<span className="hidden @4xl:block">&nbsp;Items</span>
          </div>
        </Button>
      }
    />
  );
};
