'use client';

import { Button } from '@bigcommerce/components/button';
import { Field, FieldControl, Form, FormSubmit } from '@bigcommerce/components/form';
import { Input } from '@bigcommerce/components/input';
import { Loader2 as Spinner } from 'lucide-react';
import { useFormStatus } from 'react-dom';

interface Props {
  initialTerm?: string;
}

export const SearchForm = ({ initialTerm = '' }: Props) => {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col gap-8">
      <h3 className="text-3xl font-black lg:text-4xl">Search for products</h3>
      <Form action="/search" className="flex" method="get">
        <Field className="me-4 w-full" name="search">
          <FieldControl asChild>
            <Input
              className="grey-200 border-2 px-8 py-3 font-semibold"
              defaultValue={initialTerm}
              name="term"
              placeholder="Placeholder..."
            />
          </FieldControl>
        </Field>
        <FormSubmit asChild>
          <Button className="w-auto" disabled={pending} type="submit">
            {pending ? (
              <>
                <Spinner aria-hidden="true" className="animate-spin" />
                <span className="sr-only">Searching...</span>
              </>
            ) : (
              <span>Search</span>
            )}
          </Button>
        </FormSubmit>
      </Form>
    </div>
  );
};
