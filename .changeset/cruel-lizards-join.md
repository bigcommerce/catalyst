---
"@bigcommerce/catalyst-core": patch
---

Disable product filters that are no longer available based on the selection.

## Migration steps

### Step 1

Update the `facetsTransformer` function in `core/data-transformers/facets-transformer.ts` to handle disabled filters:

```diff
  return allFacets.map((facet) => {
    const refinedFacet = refinedFacets.find((f) => f.displayName === facet.displayName);

+    if (refinedFacet == null) {
+      return null;
+    }
+
    if (facet.__typename === 'CategorySearchFilter') {
      const refinedCategorySearchFilter =
-        refinedFacet?.__typename === 'CategorySearchFilter' ? refinedFacet : null;
+        refinedFacet.__typename === 'CategorySearchFilter' ? refinedFacet : null;

      return {
        type: 'toggle-group' as const,
        paramName: 'categoryIn',
        label: facet.displayName,
        defaultCollapsed: facet.isCollapsedByDefault,
        options: facet.categories.map((category) => {
          const refinedCategory = refinedCategorySearchFilter?.categories.find(
            (c) => c.entityId === category.entityId,
          );
          const isSelected = filters.categoryEntityIds?.includes(category.entityId) === true;
+          const disabled = refinedCategory == null && !isSelected;
+          const productCountLabel = disabled ? '' : ` (${category.productCount})`;
+          const label = facet.displayProductCount
+            ? `${category.name}${productCountLabel}`
+            : category.name;

          return {
-            label: facet.displayProductCount
-              ? `${category.name} (${category.productCount})`
-              : category.name,
+            label,
            value: category.entityId.toString(),
-            disabled: refinedCategory == null && !isSelected,
+            disabled,
          };
        }),
      };
    }

    if (facet.__typename === 'BrandSearchFilter') {
      const refinedBrandSearchFilter =
-        refinedFacet?.__typename === 'BrandSearchFilter' ? refinedFacet : null;
+        refinedFacet.__typename === 'BrandSearchFilter' ? refinedFacet : null;

      return {
        type: 'toggle-group' as const,
        paramName: 'brand',
        label: facet.displayName,
        defaultCollapsed: facet.isCollapsedByDefault,
        options: facet.brands.map((brand) => {
          const refinedBrand = refinedBrandSearchFilter?.brands.find(
            (b) => b.entityId === brand.entityId,
          );
          const isSelected = filters.brandEntityIds?.includes(brand.entityId) === true;
+          const disabled = refinedBrand == null && !isSelected;
+          const productCountLabel = disabled ? '' : ` (${brand.productCount})`;
+          const label = facet.displayProductCount
+            ? `${brand.name}${productCountLabel}`
+            : brand.name;

          return {
-            label: facet.displayProductCount ? `${brand.name} (${brand.productCount})` : brand.name,
+            label,
            value: brand.entityId.toString(),
-            disabled: refinedBrand == null && !isSelected,
+            disabled,
          };
        }),
      };
    }

    if (facet.__typename === 'ProductAttributeSearchFilter') {
      const refinedProductAttributeSearchFilter =
-        refinedFacet?.__typename === 'ProductAttributeSearchFilter' ? refinedFacet : null;
+        refinedFacet.__typename === 'ProductAttributeSearchFilter' ? refinedFacet : null;

      return {
        type: 'toggle-group' as const,
        paramName: `attr_${facet.filterKey}`,
        label: facet.displayName,
        defaultCollapsed: facet.isCollapsedByDefault,
        options: facet.attributes.map((attribute) => {
          const refinedAttribute = refinedProductAttributeSearchFilter?.attributes.find(
            (a) => a.value === attribute.value,
          );

          const isSelected =
            filters.productAttributes?.some((attr) => attr.values.includes(attribute.value)) ===
            true;

+          const disabled = refinedAttribute == null && !isSelected;
+          const productCountLabel = disabled ? '' : ` (${attribute.productCount})`;
+          const label = facet.displayProductCount
+            ? `${attribute.value}${productCountLabel}`
+            : attribute.value;
+
          return {
-            label: facet.displayProductCount
-              ? `${attribute.value} (${attribute.productCount})`
-              : attribute.value,
+            label,
            value: attribute.value,
-            disabled: refinedAttribute == null && !isSelected,
+            disabled,
          };
        }),
      };
    }

    if (facet.__typename === 'RatingSearchFilter') {
      const refinedRatingSearchFilter =
-        refinedFacet?.__typename === 'RatingSearchFilter' ? refinedFacet : null;
+        refinedFacet.__typename === 'RatingSearchFilter' ? refinedFacet : null;
      const isSelected = filters.rating?.minRating != null;

      return {
        type: 'rating' as const,
        paramName: 'minRating',
        label: facet.displayName,
        disabled: refinedRatingSearchFilter == null && !isSelected,
        defaultCollapsed: facet.isCollapsedByDefault,
      };
    }

    if (facet.__typename === 'PriceSearchFilter') {
      const refinedPriceSearchFilter =
-        refinedFacet?.__typename === 'PriceSearchFilter' ? refinedFacet : null;
+        refinedFacet.__typename === 'PriceSearchFilter' ? refinedFacet : null;
      const isSelected = filters.price?.minPrice != null || filters.price?.maxPrice != null;

      return {
        type: 'range' as const,
        minParamName: 'minPrice',
        maxParamName: 'maxPrice',
        label: facet.displayName,
        min: facet.selected?.minPrice ?? undefined,
        max: facet.selected?.maxPrice ?? undefined,
        disabled: refinedPriceSearchFilter == null && !isSelected,
        defaultCollapsed: facet.isCollapsedByDefault,
      };
    }

    if (facet.freeShipping) {
      const refinedFreeShippingSearchFilter =
-        refinedFacet?.__typename === 'OtherSearchFilter' && refinedFacet.freeShipping
+        refinedFacet.__typename === 'OtherSearchFilter' && refinedFacet.freeShipping
          ? refinedFacet
          : null;
      const isSelected = filters.isFreeShipping === true;

      return {
        type: 'toggle-group' as const,
        paramName: `shipping`,
        label: t('freeShippingLabel'),
        defaultCollapsed: facet.isCollapsedByDefault,
        options: [
          {
            label: t('freeShippingLabel'),
            value: 'free_shipping',
            disabled: refinedFreeShippingSearchFilter == null && !isSelected,
          },
        ],
      };
    }

    if (facet.isFeatured) {
      const refinedIsFeaturedSearchFilter =
-        refinedFacet?.__typename === 'OtherSearchFilter' && refinedFacet.isFeatured
+        refinedFacet.__typename === 'OtherSearchFilter' && refinedFacet.isFeatured
          ? refinedFacet
          : null;
      const isSelected = filters.isFeatured === true;

      return {
        type: 'toggle-group' as const,
        paramName: `isFeatured`,
        label: t('isFeaturedLabel'),
        defaultCollapsed: facet.isCollapsedByDefault,
        options: [
          {
            label: t('isFeaturedLabel'),
            value: 'on',
            disabled: refinedIsFeaturedSearchFilter == null && !isSelected,
          },
        ],
      };
    }

    if (facet.isInStock) {
      const refinedIsInStockSearchFilter =
-        refinedFacet?.__typename === 'OtherSearchFilter' && refinedFacet.isInStock
+        refinedFacet.__typename === 'OtherSearchFilter' && refinedFacet.isInStock
          ? refinedFacet
          : null;
      const isSelected = filters.hideOutOfStock === true;

      return {
        type: 'toggle-group' as const,
        paramName: `stock`,
        label: t('inStockLabel'),
        defaultCollapsed: facet.isCollapsedByDefault,
        options: [
          {
            label: t('inStockLabel'),
            value: 'in_stock',
            disabled: refinedIsInStockSearchFilter == null && !isSelected,
          },
        ],
      };
    }

    return null;
  });
```

### Step 2

Fix the disabled state CSS classes in `core/vibes/soul/form/toggle-group/index.tsx`:

```diff
          <ToggleGroupPrimitive.Item
            aria-label={option.label}
            className={clsx(
-              'data-disabled:pointer-events-none data-disabled:opacity-50 h-12 whitespace-nowrap rounded-full border px-4 font-body text-sm font-normal leading-normal transition-colors focus-visible:outline-0 focus-visible:ring-2',
+              'h-12 whitespace-nowrap rounded-full border px-4 font-body text-sm font-normal leading-normal transition-colors focus-visible:outline-0 focus-visible:ring-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
              {
                light:
                  'border-[var(--toggle-group-light-border,hsl(var(--contrast-100)))] ring-[var(--toggle-group-light-focus,hsl(var(--primary)))] data-[state=on]:border-[var(--toggle-group-light-on-border,hsl(var(--foreground)))] data-[state=off]:bg-[var(--toggle-group-light-off-background,hsl(var(--background)))] data-[state=on]:bg-[var(--toggle-group-light-on-background,hsl(var(--foreground)))] data-[state=off]:text-[var(--toggle-group-light-off-text,hsl(var(--foreground)))] data-[state=on]:text-[var(--toggle-group-light-on-text,hsl(var(--background)))] data-[state=off]:hover:border-[var(--toggle-group-light-off-border-hover,hsl(var(--contrast-200)))] data-[state=off]:hover:bg-[var(--toggle-group-light-off-background-hover,hsl(var(--contrast-100)))]',
```

### Step 3

Update the FiltersPanel component in `core/vibes/soul/sections/products-list-section/filters-panel.tsx`

```diff
import { clsx } from 'clsx';
import { parseAsString, useQueryStates } from 'nuqs';
-import { Suspense, useOptimistic, useState, useTransition } from 'react';
+import { useOptimistic, useState, useTransition } from 'react';

import { Checkbox } from '@/vibes/soul/form/checkbox';
import { RangeInput } from '@/vibes/soul/form/range-input';
import { ToggleGroup } from '@/vibes/soul/form/toggle-group';
-import { Streamable, useStreamable } from '@/vibes/soul/lib/streamable';
+import { Stream, Streamable, useStreamable } from '@/vibes/soul/lib/streamable';
import { Accordion, AccordionItem } from '@/vibes/soul/primitives/accordion';
import { Button } from '@/vibes/soul/primitives/button';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Rating } from '@/vibes/soul/primitives/rating';
import { Link } from '~/components/link';

import { getFilterParsers } from './filter-parsers';
```

```diff
  rangeFilterApplyLabel?: Streamable<string>;
}

+type InnerProps = Props & { filters: Filter[] };
+
function getParamCountLabel(params: Record<string, string | null | string[]>, key: string) {
  const value = params[key];

  if (Array.isArray(value) && value.length > 0) return `(${value.length})`;

  return '';
}

export function FiltersPanel({
  className,
-  filters,
+  filters: streamableFilters,
  resetFiltersLabel,
  rangeFilterApplyLabel,
}: Props) {
  return (
-    <Suspense fallback={<FiltersSkeleton />}>
-      <FiltersPanelInner
-        className={className}
-        filters={filters}
-        rangeFilterApplyLabel={rangeFilterApplyLabel}
-        resetFiltersLabel={resetFiltersLabel}
-      />
-    </Suspense>
+    <Stream fallback={<FiltersSkeleton />} value={streamableFilters}>
+      {(filters) => (
+        <FiltersPanelInner
+          className={className}
+          filters={filters}
+          rangeFilterApplyLabel={rangeFilterApplyLabel}
+          resetFiltersLabel={resetFiltersLabel}
+        />
+      )}
+    </Stream>
  );
}

export function FiltersPanelInner({
  className,
-  filters: streamableFilters,
+  filters,
  resetFiltersLabel: streamableResetFiltersLabel,
  rangeFilterApplyLabel: streamableRangeFilterApplyLabel,
  paginationInfo: streamablePaginationInfo,
-}: Props) {
-  const filters = useStreamable(streamableFilters);
+}: InnerProps) {
  const resetFiltersLabel = useStreamable(streamableResetFiltersLabel) ?? 'Reset filters';
  const rangeFilterApplyLabel = useStreamable(streamableRangeFilterApplyLabel);
  const paginationInfo = useStreamable(streamablePaginationInfo);
  const startCursorParamName = paginationInfo?.startCursorParamName ?? 'before';
  const endCursorParamName = paginationInfo?.endCursorParamName ?? 'after';
  const [params, setParams] = useQueryStates(
    {
      ...getFilterParsers(filters),
      [startCursorParamName]: parseAsString,
      [endCursorParamName]: parseAsString,
    },
    {
      shallow: false,
      history: 'push',
    },
  );
  const [isPending, startTransition] = useTransition();
  const [optimisticParams, setOptimisticParams] = useOptimistic(params);
-  const [accordionItems, setAccordionItems] = useState(() =>
+  const [expandedItems, setExpandedItems] = useState(() => {
+    const initial = new Set<string>();
+
    filters
      .filter((filter) => filter.type !== 'link-group')
-      .map((filter, index) => ({
-        key: index.toString(),
-        value: index.toString(),
+      .slice(0, 3)
+      .forEach((filter) => {
+        initial.add(filter.label.toLowerCase());
+      });
+
+    return initial;
+  });
+
+  const accordionItems = filters
+    .filter((filter) => filter.type !== 'link-group')
+    .map((filter) => {
+      return {
+        key: filter.label.toLowerCase(),
+        value: filter.label.toLowerCase(),
        filter,
-        expanded: index < 3,
-      })),
-  );
+        expanded: expandedItems.has(filter.label.toLowerCase()),
+      };
+    });

  if (filters.length === 0) return null;

  const linkGroupFilters = filters.filter(
    (filter): filter is LinkGroupFilter => filter.type === 'link-group',
  );
```

```diff
      ))}
      <Accordion
-        onValueChange={(items) =>
-          setAccordionItems((prevItems) =>
-            prevItems.map((prevItem) => ({
-              ...prevItem,
-              expanded: items.includes(prevItem.value),
-            })),
-          )
-        }
+        onValueChange={(items) => {
+          setExpandedItems(new Set(items));
+        }}
        type="multiple"
        value={accordionItems.filter((item) => item.expanded).map((item) => item.value)}
      >
```


