'use client';

import { Button } from '@bigcommerce/reactant/Button';
import { cs } from '@bigcommerce/reactant/cs';
import { Field, FieldControl, Form } from '@bigcommerce/reactant/Form';
import { Input, InputIcon } from '@bigcommerce/reactant/Input';
import { Search, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface Props {
  className?: string;
  initialTerm?: string;
}

export const QuickSearch = ({ className, initialTerm = '' }: Props) => {
  const [term, setTerm] = useState(initialTerm);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTermChange = (e: React.FormEvent<HTMLInputElement>) => setTerm(e.currentTarget.value);
  const handleTermClear = () => {
    setTerm('');
    inputRef.current?.focus();
  };

  return (
    <Form action="/search" className={cs('flex', className)} method="get">
      <Field className="w-full" name="search">
        <FieldControl asChild>
          <Input
            className="grey-200 peer appearance-none border-2 px-12 py-3 font-semibold"
            name="term"
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
                className="absolute end-1.5 top-1/2 w-auto -translate-y-1/2 border-0 bg-transparent p-1.5 text-black hover:bg-transparent focus:text-blue-primary peer-hover:text-blue-primary peer-focus:text-blue-primary"
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
  );
};
