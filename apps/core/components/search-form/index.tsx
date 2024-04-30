'use client';

import { Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';
import { Field, FieldControl, Form, FormSubmit } from '~/components/ui/form';
import { Input } from '~/components/ui/input';

interface Props {
  initialTerm?: string;
}

export const SearchForm = ({ initialTerm = '' }: Props) => {
  const { pending } = useFormStatus();
  const t = useTranslations('NotFound');

  return (
    <div className="flex flex-col gap-8">
      <h3 className="text-3xl font-black lg:text-4xl">{t('searchProducts')}</h3>
      <Form action="/search" className="flex" method="get">
        <Field className="me-4 w-full" name="search">
          <FieldControl asChild>
            <Input
              className="grey-200 border-2 px-8 py-3 font-semibold"
              defaultValue={initialTerm}
              name="term"
              placeholder={t('searchPlaceholder')}
            />
          </FieldControl>
        </Field>
        <FormSubmit asChild>
          <Button className="w-auto" disabled={pending} type="submit">
            {pending ? (
              <>
                <Spinner aria-hidden="true" className="animate-spin" />
                <span className="sr-only">{t('searching')}</span>
              </>
            ) : (
              <span>{t('search')}</span>
            )}
          </Button>
        </FormSubmit>
      </Form>
    </div>
  );
};
