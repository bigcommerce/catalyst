---
"@bigcommerce/catalyst-core": patch
---

Persist the checkbox product modifier since it can modify pricing and other product data. By persisting this and tracking in the url, this will trigger a product refetch when added or removed. Incidentally, now we manually control what fields are persisted, since `option.isVariantOption` doesn't apply to `checkbox`, additionally multi options modifiers that are not variant options can also modify price and other product data.

## Migration

### Step 1

Update `product-options-transformer.ts` to manually track persisted fields:

```ts
case 'DropdownList': {
    return {
        // before
        persist: option.isVariantOption,
        // after (manually persist)
        persist: true,
        type: 'select',
        label: option.displayName,
        required: option.isRequired,
        name: option.entityId.toString(),
        defaultValue: values.find((value) => value.isDefault)?.entityId.toString(),
        options: values.map((value) => ({
        label: value.label,
        value: value.entityId.toString(),
        })),
    };
}
```

Fields that persist and can affect product pricing when selected:
- Swatch
- RectangleBoxes
- RadioButtons
- ProductPickList
- ProductPickListWithImages
- CheckboxOption

### Step 2

Remove `isVariantOption` from GQL query since we no longer use it:

```ts
export const ProductOptionsFragment = graphql(
  `
    fragment ProductOptionsFragment on Product {
      entityId
      productOptions(first: 50) {
        edges {
          node {
            __typename
            entityId
            displayName
            isRequired
            isVariantOption // remove this
            ...MultipleChoiceFieldFragment
            ...CheckboxFieldFragment
            ...NumberFieldFragment
            ...TextFieldFragment
            ...MultiLineTextFieldFragment
            ...DateFieldFragment
          }
        }
      }
    }
  `,
  [
    MultipleChoiceFieldFragment,
    CheckboxFieldFragment,
    NumberFieldFragment,
    TextFieldFragment,
    MultiLineTextFieldFragment,
    DateFieldFragment,
  ],
);
```

### Step 3
Update `product-detail-form.tsx` to handle checkbox persist logic:

```ts
case 'checkbox':
    return (
        <Checkbox
            checked={controls.value === field.checkedValue} // add this
            errors={formField.errors}
            key={formField.id}
            label={field.label}
            name={formField.name}
            onBlur={controls.blur}
            onCheckedChange=(value) => handleChange(value ? field.checkedValue.toString() : ''); // add this
            onFocus={controls.focus}
            required={formField.required}
            value={controls.value ?? ''}
        />
    );
```

Simplify `handleChange`:

```ts
const handleChange = useCallback(
    (value: string) => {
        void setParams({ [field.name]: value || null }); // Passing `null` to remove the value from the query params if fieldValue is falsey
        controls.change(value || ''); // If fieldValue is falsey, we set it to an empty string
    },
    [setParams, field, controls],
);
```

Update default value logic to handle checkbox case:

```ts
const defaultValue = fields.reduce<{
  [Key in keyof SchemaRawShape]?: z.infer<SchemaRawShape[Key]>;
}>(
  (acc, field) => {
    // Checkbox fields need to be handled differently since we keep track of the checkedValue and not the boolean value of the default value.
    if (field.type === 'checkbox') {
      return {
        ...acc,
        [field.name]:
          (params[field.name] ?? field.defaultValue === 'true') ? field.checkedValue : '',
      };
    }

    return {
      ...acc,
      [field.name]: params[field.name] ?? field.defaultValue,
    };
  },
  { quantity: minQuantity ?? 1 },
);
```

### Step 4

Include update schema in `core/vibes/soul/sections/product-detail/schema.ts`:

```ts
type CheckboxField = {
  type: 'checkbox';
  defaultValue?: string;
  checkedValue: string;
  uncheckedValue: string;
} & FormField;
```

### Step 5
Simplify `core/app/[locale]/(default)/product/[slug]/_actions/add-to-cart.tsx`:

```ts
case 'checkbox':
    checkboxOptionInput = {
        optionEntityId: Number(field.name),
        optionValueEntityId: Number(optionValueEntityId),
    };

    if (accum.checkboxes) {
        return { ...accum, checkboxes: [...accum.checkboxes, checkboxOptionInput] };
    }

    return { ...accum, checkboxes: [checkboxOptionInput] };
```
