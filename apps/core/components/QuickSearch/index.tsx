'use client';

import { Button } from '@bigcommerce/reactant/Button';
import { Field, FieldControl, Form } from '@bigcommerce/reactant/Form';
import { Input, InputIcon } from '@bigcommerce/reactant/Input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetOverlay,
  SheetTrigger,
} from '@bigcommerce/reactant/Sheet';
import { Search, X } from 'lucide-react';
import { PropsWithChildren, useRef, useState } from 'react';

interface SearchProps extends PropsWithChildren {
  initialTerm?: string;
}

export const QuickSearch = ({ children, initialTerm = '' }: SearchProps) => {
  const [term, setTerm] = useState(initialTerm);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTermChange = (e: React.FormEvent<HTMLInputElement>) => setTerm(e.currentTarget.value);
  const handleTermClear = () => {
    setTerm('');
    inputRef.current?.focus();
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          aria-label="Open search popup"
          className="border-0 bg-transparent p-3 text-black hover:bg-transparent hover:text-blue-primary focus:text-blue-primary"
        >
          <Search />
        </Button>
      </SheetTrigger>
      <SheetOverlay className="bg-transparent backdrop-blur-none">
        <SheetContent className="px-6 pb-8 pt-4 md:px-10 md:pt-4 lg:px-12" side="top">
          <div className="grid grid-cols-5 items-center">
            <div className="me-2 hidden lg:block lg:justify-self-start">{children}</div>
            <Form
              action="/search"
              className="col-span-4 flex lg:col-span-3"
              method="get"
              role="search"
            >
              <Field className="w-full" name="term">
                <FieldControl asChild>
                  <Input
                    className="peer appearance-none border-2 px-12 py-3"
                    onChange={handleTermChange}
                    placeholder="Search..."
                    ref={inputRef}
                    value={term}
                  >
                    <InputIcon className="start-3 peer-hover:text-blue-primary peer-focus:text-blue-primary">
                      <Search />
                    </InputIcon>
                    {term.length > 0 ? (
                      <Button
                        aria-label="Clear search"
                        className="absolute end-1.5 top-1/2 w-auto -translate-y-1/2 border-0 bg-transparent p-1.5 text-black hover:bg-transparent hover:text-blue-primary focus:text-blue-primary peer-hover:text-blue-primary peer-focus:text-blue-primary"
                        onClick={handleTermClear}
                        type="button"
                      >
                        <X />
                      </Button>
                    ) : null}
                  </Input>
                </FieldControl>
              </Field>
            </Form>
            <SheetClose asChild>
              <Button
                aria-label="Close search popup"
                className="w-auto justify-self-end border-0 bg-transparent p-2.5 text-black hover:bg-transparent hover:text-blue-primary focus:text-blue-primary peer-hover:text-blue-primary peer-focus:text-blue-primary"
              >
                <small className="me-2 hidden text-base md:inline-flex">Close</small>
                <X />
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </SheetOverlay>
    </Sheet>
  );
};
