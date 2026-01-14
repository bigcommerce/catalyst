---
"@bigcommerce/catalyst-core": patch
---

Refactor DynamicForm actions to decouple fields and passwordComplexity from state, passing them as separate arguments instead. This reduces state payload size by removing fields from state objects and stripping options from fields before passing them to actions (options are only needed for rendering, not processing). All form actions now accept a `DynamicFormActionArgs` object as the first parameter containing fields and optional passwordComplexity, followed by the previous state and formData.

## Migration steps

### Step 1: Changes to DynamicForm component

The `DynamicForm` component and related utilities have been updated to support the new action signature pattern:

**`core/vibes/soul/form/dynamic-form/index.tsx`**:
- Added `DynamicFormActionArgs<F>` interface that contains `fields` and optional `passwordComplexity`
- Updated `DynamicFormAction<F>` type to accept `DynamicFormActionArgs<F>` as the first parameter
- Removed `fields` and `passwordComplexity` from the `State` interface
- Added automatic removal of `options` from fields before passing to actions (options are only needed for rendering)
- Updated action binding to use `action.bind(null, { fields: fieldsWithoutOptions, passwordComplexity })`

**`core/vibes/soul/form/dynamic-form/utils.ts`** (new file):
- Added `removeOptionsFromFields()` utility function that strips the `options` property from field definitions before passing them to actions, reducing the state payload size

```diff
+ export interface DynamicFormActionArgs<F extends Field> {
+   fields: Array<F | FieldGroup<F>>;
+   passwordComplexity?: PasswordComplexitySettings | null;
+ }
+
+ type Action<F extends Field, S, P> = (
+   args: DynamicFormActionArgs<F>,
+   state: Awaited<S>,
+   payload: P,
+ ) => S | Promise<S>;
+
  interface State {
    lastResult: SubmissionResult | null;
-   fields: Array<F | FieldGroup<F>>;
-   passwordComplexity?: PasswordComplexitySettings | null;
  }
```

### Step 2: Update DynamicForm action signatures

All form actions that use `DynamicForm` must be updated to accept `DynamicFormActionArgs<F>` as the first parameter instead of including fields in the state.

Update your form action function signature:

```diff
+ import { DynamicFormActionArgs } from '@/vibes/soul/form/dynamic-form';
  import { Field, FieldGroup, schema } from '@/vibes/soul/form/dynamic-form/schema';

- export async function myFormAction<F extends Field>(
-   prevState: {
-     lastResult: SubmissionResult | null;
-     fields: Array<F | FieldGroup<F>>;
-     passwordComplexity?: PasswordComplexitySettings | null;
-   },
-   formData: FormData,
- ) {
+ export async function myFormAction<F extends Field>(
+   { fields, passwordComplexity }: DynamicFormActionArgs<F>,
+   _prevState: {
+     lastResult: SubmissionResult | null;
+   },
+   formData: FormData,
+ ) {
```

### Step 2: Remove fields and passwordComplexity from state interfaces

Update state interfaces to remove fields and passwordComplexity properties:

```diff
  interface State {
    lastResult: SubmissionResult | null;
-   fields: Array<Field | FieldGroup<Field>>;
-   passwordComplexity?: PasswordComplexitySettings | null;
  }
```

### Step 3: Update action implementations

Remove references to `prevState.fields` and `prevState.passwordComplexity` in action implementations:

```diff
  const submission = parseWithZod(formData, {
-   schema: schema(prevState.fields, prevState.passwordComplexity),
+   schema: schema(fields, passwordComplexity),
  });

  if (submission.status !== 'success') {
    return {
      lastResult: submission.reply(),
-     fields: prevState.fields,
-     passwordComplexity: prevState.passwordComplexity,
    };
  }
```

### Step 4: Update action calls in components

For actions used with `AddressListSection`, update the action signature to accept fields as the first parameter:

```diff
- export async function addressAction(
-   prevState: Awaited<State>,
-   formData: FormData,
- ): Promise<State> {
+ export async function addressAction(
+   fields: Array<Field | FieldGroup<Field>>,
+   prevState: Awaited<State>,
+   formData: FormData,
+ ): Promise<State> {
```

### Step 5: Update DynamicForm usage

No changes needed to `DynamicForm` component usage. The component automatically handles binding fields and passwordComplexity to actions. The `DynamicForm` component now:
- Automatically removes options from fields before passing them to actions (reducing payload size)
- Binds fields and passwordComplexity to the action using `action.bind()`
- Maintains the same props interface, so existing usage continues to work

### Affected files

The following files were updated in this refactor:
- `core/vibes/soul/form/dynamic-form/index.tsx` - Added `DynamicFormActionArgs` type and updated action binding
- `core/vibes/soul/form/dynamic-form/utils.ts` - Added `removeOptionsFromFields` utility function
- `core/app/[locale]/(default)/(auth)/register/_actions/register-customer.ts`
- `core/app/[locale]/(default)/account/addresses/_actions/address-action.ts`
- `core/app/[locale]/(default)/account/addresses/_actions/create-address.ts`
- `core/app/[locale]/(default)/account/addresses/_actions/update-address.ts`
- `core/app/[locale]/(default)/account/addresses/_actions/delete-address.ts`
- `core/app/[locale]/(default)/gift-certificates/purchase/_actions/add-to-cart.tsx`
- `core/app/[locale]/(default)/webpages/[id]/contact/_actions/submit-contact-form.ts`
- `core/vibes/soul/sections/address-list-section/index.tsx`
