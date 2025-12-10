---
"@bigcommerce/catalyst-core": minor
---

Add out-of-stock / backorder message to product cards on PLPs based on store settings:
- Add out of stock message if the product is out of stock and stock is set to display it.
- Add the backorder message if the product has no on-hand stock and is available for backorder and the store/product is set to display the backorder message

## Migration

### Option 1: Automatic Migration (Recommended)
For existing Catalyst stores, the simplest way to get the newly added feature is to rebase the existing code with the new release code. The files that will be updated are listed below.

### Option 2: Manual Migration
If you prefer not to rebase or have made customizations that prevent rebasing, follow these manual steps:

#### Step 1: Update GraphQL Fragment
Add the inventory fields to your product card fragment in `core/components/product-card/fragment.ts` under `Product`:
```graphql
inventory {
  hasVariantInventory
  isInStock
  aggregated {
    availableForBackorder
    unlimitedBackorder
    availableOnHand
  }
}
variants(first: 1) {
  edges {
    node {
      entityId
      sku
      inventory {
        byLocation {
          edges {
            node {
              locationEntityId
              backorderMessage
            }
          }
        }
      }
    }
  }
}
```

#### Step 2: Update Product interface in Product Card component
Update the `Product` interface in `core/vibes/soul/primitives/product-card/index.tsx` adding the following field to it:

`inventoryMessage?: string;`

#### Step 3: Update Data Transformer
Modify `core/data-transformers/product-card-transformer.ts` to include inventory message in the transformed data. You can simply copy the whole file from this release as it does not have UI breaking changes.

#### Step 4: Update Product Card Layout
Update `core/vibes/soul/primitives/product-card/index.tsx` layout to display the new `inventoryMessage` product field.

#### Step 5: Update Page Data GraphQL queries
Add inventory settings queries to the pages data. Add the following query to the main GQL query under `site.settings`:
```
inventory {
  defaultOutOfStockMessage
  showOutOfStockMessage
  showBackorderMessage
}
```
to the following page data files:
- `core/app/[locale]/(default)/(faceted)/brand/[slug]/page-data.ts`
- `core/app/[locale]/(default)/(faceted)/category/[slug]/page-data.ts`
- `core/app/[locale]/(default)/(faceted)/search/page-data.ts`
- `core/app/[locale]/(default)/page-data.ts`

#### Step 6: Update Page Components
Update the corresponding page components to use the `productCardTransformer` method (if not already using it) to get the product card, and pass inventory data to those product cards based on the store inventory settings. Use the following code while retrieving the product lists:
```
    const { defaultOutOfStockMessage, showOutOfStockMessage, showBackorderMessage } =
      data.site.settings?.inventory ?? {};

    return productCardTransformer(
      featuredProducts,
      format,
      showOutOfStockMessage ? defaultOutOfStockMessage : undefined,
      showBackorderMessage,
    );
```
in the following files:
- `core/app/[locale]/(default)/(faceted)/brand/[slug]/page.tsx`
- `core/app/[locale]/(default)/(faceted)/category/[slug]/page.tsx`
- `core/app/[locale]/(default)/(faceted)/search/page.tsx`
- `core/app/[locale]/(default)/page.tsx`

### Files Modified in This Change
- `core/app/[locale]/(default)/(faceted)/brand/[slug]/page-data.ts`
- `core/app/[locale]/(default)/(faceted)/brand/[slug]/page.tsx`
- `core/app/[locale]/(default)/(faceted)/category/[slug]/page-data.ts`
- `core/app/[locale]/(default)/(faceted)/category/[slug]/page.tsx`
- `core/app/[locale]/(default)/(faceted)/search/page-data.ts`
- `core/app/[locale]/(default)/(faceted)/search/page.tsx`
- `core/app/[locale]/(default)/page-data.ts`
- `core/app/[locale]/(default)/page.tsx`
- `core/components/product-card/fragment.ts`
- `core/data-transformers/product-card-transformer.ts`
- `core/vibes/soul/primitives/product-card/index.tsx`
