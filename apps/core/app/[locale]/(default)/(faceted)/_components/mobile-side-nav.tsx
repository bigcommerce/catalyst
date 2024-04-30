'use client';

import { Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PropsWithChildren, useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';

export const MobileSideNav = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations('FacetedGroup.MobileSideNav');

  useEffect(() => {
    setOpen(false);
  }, [children]);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button className="items-center md:w-auto lg:hidden" variant="secondary">
          <Filter className="me-3" /> <span>{t('showFilters')}</span>
        </Button>
      </SheetTrigger>
      <SheetOverlay className="bg-transparent, backdrop-blur-none lg:hidden">
        <SheetContent className="lg:hidden">
          <SheetHeader>
            <SheetTitle asChild>
              <h2>{t('filters')}</h2>
            </SheetTitle>
            <SheetClose />
          </SheetHeader>
          {children}
        </SheetContent>
      </SheetOverlay>
    </Sheet>
  );
};
