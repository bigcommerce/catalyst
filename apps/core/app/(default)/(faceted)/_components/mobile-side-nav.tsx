'use client';

import { Button } from '@bigcommerce/components/Button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
  SheetTrigger,
} from '@bigcommerce/components/Sheet';
import { Filter } from 'lucide-react';
import { PropsWithChildren, useEffect, useState } from 'react';

export const MobileSideNav = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [children]);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button className="items-center md:w-auto lg:hidden" variant="secondary">
          <Filter className="me-3" /> <span>Show Filters</span>
        </Button>
      </SheetTrigger>
      <SheetOverlay className="bg-transparent, backdrop-blur-none lg:hidden">
        <SheetContent className="lg:hidden">
          <SheetHeader>
            <SheetTitle asChild>
              <h2>Filters</h2>
            </SheetTitle>
            <SheetClose />
          </SheetHeader>
          {children}
        </SheetContent>
      </SheetOverlay>
    </Sheet>
  );
};
