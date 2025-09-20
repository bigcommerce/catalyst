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
    <SectionLayout
      className={clsx(
        'mx-auto mb-24 mt-24 max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-12',
        className,
      )}
      containerSize="lg"
    >
      {title != null && title !== '' && (
        <header className="pb-4 @2xl:pb-4 @4xl:pb-4">
          <h1 className="mb-5 font-heading text-4xl font-medium leading-none @xl:text-5xl">
            {title}
          </h1>
          {subtitle != null && subtitle !== '' && (
            <p className="mb-10 text-base font-light leading-none @xl:text-lg">{subtitle}</p>
          )}
        </header>
      )}
      <DynamicForm action={action} fields={fields} submitLabel={submitLabel} />
    </SectionLayout>
  );
}
