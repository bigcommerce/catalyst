---
"@bigcommerce/catalyst-core": patch
---

Fix WishlistDetails page from exceeding GraphQL complexity limit, and fix wishlist e2e tests.

Additionally, add the `required` prop to `core/components/wishlist/modals/new.tsx` and `core/components/wishlist/modals/rename.tsx`

## Migration

### Step 1: Update wishlist GraphQL fragments

In `core/components/wishlist/fragment.ts`, replace the `WishlistItemProductFragment` to use explicit fields instead of `ProductCardFragment`:

```typescript
export const WishlistItemProductFragment = graphql(
  `
    fragment WishlistItemProductFragment on Product {
      entityId
      name
      defaultImage {
        altText
        url: urlTemplate(lossy: true)
      }
      path
      brand {
        name
        path
      }
      reviewSummary {
        numberOfReviews
        averageRating
      }
      sku
      showCartAction
      inventory {
        isInStock
      }
      availabilityV2 {
        status
      }
      ...PricingFragment
    }
  `,
  [PricingFragment],
);
```

Remove `ProductCardFragment` from all fragment dependencies in the same file.

### Step 2: Update product card transformer

In `core/data-transformers/product-card-transformer.ts`:

1. Import the `WishlistItemProductFragment`:
   ```typescript
   import { WishlistItemProductFragment } from '~/components/wishlist/fragment';
   ```

2. Update the `singleProductCardTransformer` function signature to accept both fragment types:
   ```typescript
   product: ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>
   ```

3. Add a conditional check for the `inventoryMessage` field:
   ```typescript
   inventoryMessage:
     'variants' in product
       ? getInventoryMessage(product, outOfStockMessage, showBackorderMessage)
       : undefined,
   ```

4. Update the `productCardTransformer` function signature similarly:
   ```typescript
   products: Array<ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>>
   ```

### Step 3: Fix wishlist e2e tests

In `core/tests/ui/e2e/account/wishlists.spec.ts`, update label selectors to use `{ exact: true }` for specificity:

Update all locators for the wishlist name input selectors:
  ```diff
  - page.getByLabel(t('Form.nameLabel'))
  + page.getByLabel(t('Form.nameLabel'), { exact: true })
  ```

### Step 4: Fix mobile wishlist e2e tests

In `core/tests/ui/e2e/account/wishlists.mobile.spec.ts`, update translation calls to use namespace prefixes:

1. Update the translation initialization:
  ```diff
  - const t = await getTranslations('Account.Wishlist');
  + const t = await getTranslations();
  ```

2. Update all translation keys to include the namespace:
  ```diff
  - await locator.getByRole('button', { name: t('actionsTitle') }).click();
  - await page.getByRole('menuitem', { name: t('share') }).click();
  + await locator.getByRole('button', { name: t('Wishlist.actionsTitle') }).click();
  + await page.getByRole('menuitem', { name: t('Wishlist.share') }).click();
  ```

  ```diff
  - await expect(page.getByText(t('shareSuccess'))).toBeVisible();
  + await expect(page.getByText(t('Wishlist.shareSuccess'))).toBeVisible();
  ```

### Step 5: Add `required` prop to wishlist modals

Update the modal forms to include the `required` prop on the name input field:

In `core/components/wishlist/modals/new.tsx`:
```diff
      <Input
        {...getInputProps(fields.wishlistName, { type: 'text' })}
        defaultValue={defaultValue.current}
        errors={fields.wishlistName.errors}
        key={fields.wishlistName.id}
        label={nameLabel}
        onChange={(e) => {
          defaultValue.current = e.target.value;
        }}
+       required
      />
```

In `core/components/wishlist/modals/rename.tsx`:
```diff
      <Input
        {...getInputProps(fields.wishlistName, { type: 'text' })}
        defaultValue={defaultValue.current}
        errors={fields.wishlistName.errors}
        key={fields.wishlistName.id}
        label={nameLabel}
        onChange={(e) => {
          defaultValue.current = e.target.value;
        }}
+       required
      />
```

