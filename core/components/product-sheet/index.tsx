'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from '~/components/ui/sheet';

import { ProductSheetContent } from './product-sheet-content';

export const ProductSheet = () => {
  const t = useTranslations('Product.ProductSheet');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const productId = searchParams.get('showQuickAdd');

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!!productId);
  }, [productId]);

  const handleOnOpenChange = (newOpenState: boolean) => {
    if (open && !newOpenState) {
      const updatedParams = new URLSearchParams(searchParams.toString());

      // Remove the 'showQuickAdd' parameter
      updatedParams.delete('showQuickAdd');

      // Remove any parameters that are numerical
      // Numerical params are product options
      Array.from(updatedParams.keys()).forEach((key) => {
        if (!Number.isNaN(Number(key))) {
          updatedParams.delete(key);
        }
      });

      // Update the URL with the modified parameters
      router.replace(`${pathname}?${updatedParams.toString()}`, { scroll: false });
    }
  };

  return (
    <Sheet onOpenChange={handleOnOpenChange} open={open}>
      <SheetOverlay className="bg-transparent, backdrop-blur-none">
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle asChild>
              <h2>{t('title')}</h2>
            </SheetTitle>
            <SheetClose />
          </SheetHeader>
          {open && <ProductSheetContent />}
        </SheetContent>
      </SheetOverlay>
    </Sheet>
  );
};
