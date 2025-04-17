import { clsx } from 'clsx';

import { DynamicForm, DynamicFormAction } from '@/vibes/soul/form/dynamic-form';
import { Field, FieldGroup } from '@/vibes/soul/form/dynamic-form/schema';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';

interface Props<F extends Field> {
  title?: string;
  subtitle?: string;
  action: DynamicFormAction<F>;
  fields: Array<F | FieldGroup<F>>;
  submitLabel?: string;
  className?: string;
}

export function DynamicFormSection<F extends Field>({
  className,
  title,
  subtitle,
  fields,
  submitLabel,
  action,
}: Props<F>) {
  return (
    <SectionLayout className={clsx('mx-auto w-full max-w-4xl', className)} containerSize="lg">
      {title != null && title !== '' && (
        <header className="pb-8 @2xl:pb-12 @4xl:pb-16">
          <h1 className="font-heading mb-5 text-4xl leading-none font-medium @xl:text-5xl">
            {title}
          </h1>
          {subtitle != null && subtitle !== '' && (
            <p className="mb-10 text-base leading-none font-light @xl:text-lg">{subtitle}</p>
          )}
        </header>
      )}
      <DynamicForm action={action} fields={fields} submitLabel={submitLabel} />
    </SectionLayout>
  );
}
