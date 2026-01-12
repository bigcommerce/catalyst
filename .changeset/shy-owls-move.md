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
        // persist: option.isVariantOption,
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
Update `product-detail-form.tsx` to include separate handing of the checkbox field:

```ts
const defaultValue = fields.reduce<{
  [Key in keyof SchemaRawShape]?: z.infer<SchemaRawShape[Key]>;
}>(
  (acc, field) => {
    // Checkbox field has to be handled separately because we want to convert checked or unchecked value to true or undefined respectively.
    // This is because the form expects a boolean value, but we want to store the checked or unchecked value in the query params.
    if (field.type === 'checkbox') {
      if (params[field.name] === field.checkedValue) {
        return {
          ...acc,
          [field.name]: 'true',
        };
      }

      if (params[field.name] === field.uncheckedValue) {
        return {
          ...acc,
          [field.name]: undefined,
        };
      }

      return {
        ...acc,
        [field.name]: field.defaultValue, // Default value is either 'true' or undefined
      };
    }

    return {
      ...acc,
      [field.name]: params[field.name] ?? field.defaultValue,
    };
  },
  { quantity: minQuantity ?? 1 },
);

...

const handleChange = useCallback(
  (value: string) => {
    // Checkbox field has to be handled separately because we want to convert 'true' or '' to the checked or unchecked value respectively.
    if (field.type === 'checkbox') {
      void setParams({ [field.name]: value ? field.checkedValue : field.uncheckedValue });
    } else {
      void setParams({ [field.name]: value || null }); // Passing `null` to remove the value from the query params if fieldValue is falsey
    }

    controls.change(value || ''); // If fieldValue is falsey, we set it to an empty string
  },
  [setParams, field, controls],
);
```

### Step 4

Update schema in `core/vibes/soul/sections/product-detail/schema.ts`:

```ts
type CheckboxField = {
  type: 'checkbox';
  defaultValue?: string;
  checkedValue: string; // add
  uncheckedValue: string; // add
} & FormField;
```
