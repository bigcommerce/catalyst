---
"@bigcommerce/catalyst-core": patch
---

- Fixes an issue with the checkbox not properly triggering the required validation.
- Fixes an issue with the checkbox not setting the default value from the API.
- Fixes an issue with the field value being incorrectly set as `undefined`

## Migration

Update the props to set a `checked` value and pasa an empty string when checked box is unselected.

```
case 'checkbox':
    return (
    <Checkbox
        checked={controls.value === 'true'}
        errors={formField.errors}
        key={formField.id}
        label={field.label}
        name={formField.name}
        onBlur={controls.blur}
        onCheckedChange={(value) => handleChange(value ? 'true' : '')}
        onFocus={controls.focus}
        required={formField.required}
        value={controls.value ?? ''}
    />
    );
```
