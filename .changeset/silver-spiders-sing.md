---
"@bigcommerce/catalyst-core": patch
---

Fix issue where delete button is not displayed if you have only 1 address

## Migration steps:

Update `/core/app/[locale]/(default)/account/addresses/page.tsx` and pass the `minimumAddressCount={0}` prop to the AddressListSection component.

Example:

```tsx
return (
  <AddressListSection
    addressAction={addressAction}
    addresses={addresses}
    cancelLabel={t('cancel')}
    createLabel={t('create')}
    deleteLabel={t('delete')}
    editLabel={t('edit')}
    fields={[...fields, { name: 'id', type: 'hidden', label: 'ID' }]}
    minimumAddressCount={0}
    setDefaultLabel={t('setDefault')}
    showAddFormLabel={t('cta')}
    title={t('title')}
    updateLabel={t('update')}
  />
);
```
