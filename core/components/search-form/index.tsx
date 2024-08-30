'use client';

import { useTranslations } from 'next-intl';

import { Button } from '~/components/ui/button';
import { Field, FieldControl, Form, FormSubmit, Input } from '~/components/ui/form';

interface Props {
  initialTerm?: string;
}

export const SearchForm = ({ initialTerm = '' }: Props) => {
  const t = useTranslations('Components.SearchForm');

  return (
    <div className="flex flex-col gap-8 py-16">
      {initialTerm ? (
        <h3 className="text-3xl font-black lg:text-4xl">
          {t('noSearchResults', { term: `"${initialTerm}"` })}
        </h3>
      ) : (
        <h3 className="text-3xl font-black lg:text-4xl">{t('searchProducts')}</h3>
      )}
      <p>{t('checkSpelling')}</p>
      <Form action="/search" className="flex" method="get">
        <Field className="me-4 w-full" name="search">
          <FieldControl asChild>
            <Input defaultValue={initialTerm} name="term" placeholder={t('searchPlaceholder')} />
          </FieldControl>
        </Field>
        <FormSubmit asChild>
          <Button className="w-auto" type="submit">
            {t('search')}
          </Button>
        </FormSubmit>
      </Form>
    </div>
  );
};
