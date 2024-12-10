import { DynamicForm, DynamicFormAction } from '@/vibes/soul/primitives/dynamic-form';
import { Field, FieldGroup } from '@/vibes/soul/primitives/dynamic-form/schema';

interface Props<F extends Field> {
  title?: string;
  action: DynamicFormAction<F>;
  fields: Array<F | FieldGroup<F>>;
  submitLabel?: string;
}

export function SignUpSection<F extends Field>({
  title = 'Create Account',
  fields,
  submitLabel,
  action,
}: Props<F>) {
  return (
    <div className="@container">
      <div className="flex flex-col justify-center gap-y-24 px-3 py-10 @xl:flex-row @xl:px-6 @4xl:py-20 @5xl:px-20">
        <div className="flex w-full flex-col @xl:max-w-lg @xl:pr-10 @4xl:pr-20">
          <h1 className="mb-10 text-4xl font-medium leading-none @xl:text-5xl">{title}</h1>
          <DynamicForm action={action} fields={fields} submitLabel={submitLabel} />
        </div>
      </div>
    </div>
  );
}
