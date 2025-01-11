import { DynamicForm, DynamicFormAction } from '@/vibes/soul/primitives/dynamic-form';
import { Field, FieldGroup } from '@/vibes/soul/primitives/dynamic-form/schema';
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
    <SectionLayout className={className} containerSize="lg">
      {Boolean(title) && (
        <header className="mx-auto w-full max-w-4xl pb-8 @2xl:pb-12 @4xl:pb-16">
          <h1 className="mb-5 font-heading text-4xl font-medium leading-none @xl:text-5xl">
            {title}
          </h1>
          {Boolean(subtitle) && subtitle !== '' && (
            <p className="mb-10 text-base font-light leading-none @xl:text-lg">{subtitle}</p>
          )}
        </header>
      )}
      <div className="mx-auto w-full max-w-4xl">
        <DynamicForm action={action} fields={fields} submitLabel={submitLabel} />
      </div>
    </SectionLayout>
  );
}
