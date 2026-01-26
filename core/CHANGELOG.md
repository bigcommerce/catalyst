# Changelog

## 1.4.1

### Patch Changes

- [#2827](https://github.com/bigcommerce/catalyst/pull/2827) [`49b1097`](https://github.com/bigcommerce/catalyst/commit/49b1097c5d4f56b8c3a8d3d97181b09cb79a4070) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Filter out child cart items (items with `parentEntityId`) from cart and cart analytics to prevent duplicate line items when products have parent-child relationships, such as product bundles.

  ## Migration steps

  ### Step 1: GraphQL Fragment Updates

  The `parentEntityId` field has been added to both physical and digital cart item fragments to identify child items.

  Update `core/app/[locale]/(default)/cart/page-data.ts`:

  ```diff
    export const PhysicalItemFragment = graphql(`
      fragment PhysicalItemFragment on CartPhysicalItem {
        entityId
        quantity
        productEntityId
        variantEntityId
  +     parentEntityId
        listPrice {
          currencyCode
          value
        }
      }
    `);

    export const DigitalItemFragment = graphql(`
      fragment DigitalItemFragment on CartDigitalItem {
        entityId
        quantity
        productEntityId
        variantEntityId
  +     parentEntityId
        listPrice {
          currencyCode
          value
        }
      }
    `);
  ```

  ### Step 2: Cart Display Filtering

  Cart line items are now filtered to exclude child items when displaying the cart.

  Update `core/app/[locale]/(default)/cart/page.tsx`:

  ```diff
    const lineItems = [
      ...cart.lineItems.giftCertificates,
      ...cart.lineItems.physicalItems,
      ...cart.lineItems.digitalItems,
  - ];
  + ].filter((item) => !('parentEntityId' in item) || !item.parentEntityId);
  ```

  ### Step 3: Analytics Data Filtering

  Analytics data collection now only includes top-level items to prevent duplicate tracking.

  Update `core/app/[locale]/(default)/cart/page.tsx` in the `getAnalyticsData` function:

  ```diff
  - const lineItems = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems];
  + const lineItems = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems].filter(
  +   (item) => !item.parentEntityId, // Only include top-level items
  + );
  ```

  ### Step 4: Styling Update

  Cart subtitle text color has been updated for improved contrast.

  Update `core/vibes/soul/sections/cart/client.tsx`:

  ```diff
  -                  <span className="text-[var(--cart-subtext-text,hsl(var(--contrast-300)))] contrast-more:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
  +                  <span className="text-[var(--cart-subtext-text,hsl(var(--contrast-400)))] contrast-more:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
                       {lineItem.subtitle}
                     </span>
  ```

- [#2811](https://github.com/bigcommerce/catalyst/pull/2811) [`b57bffa`](https://github.com/bigcommerce/catalyst/commit/b57bffaf28b8c9714f99f7af581871f6e9f6f944) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Fix pagination cursor persistence when changing sort order. The `before` and `after` query parameters are now cleared when the sort option changes, preventing stale pagination cursors from causing incorrect results or empty pages.

- [#2833](https://github.com/bigcommerce/catalyst/pull/2833) [`a520dbc`](https://github.com/bigcommerce/catalyst/commit/a520dbcf14e78b54e10a38c05e11f427b30431c1) Thanks [@jamesqquick](https://github.com/jamesqquick)! - Add placeholders for gift certificate inputs and remove redundant placeholders in the gift certificate purchase form.

- [#2818](https://github.com/bigcommerce/catalyst/pull/2818) [`74e4dd1`](https://github.com/bigcommerce/catalyst/commit/74e4dd11ebf00c312695013c86aab29930fd7a53) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Disable product filters that are no longer available based on the selection.

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

- [#2822](https://github.com/bigcommerce/catalyst/pull/2822) [`5c3e4d2`](https://github.com/bigcommerce/catalyst/commit/5c3e4d25c2d929af2b86cee3e4133838e5f3987b) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Run E2E tests on PRs, add 'required' prop to cart shipping calculator

  ## Migration

  Add `required` prop to the Country selector and Country input fields in `core/vibes/soul/sections/cart/shipping-form/index.tsx` on lines 280 and 289.

- [#2813](https://github.com/bigcommerce/catalyst/pull/2813) [`ea9d633`](https://github.com/bigcommerce/catalyst/commit/ea9d6337d2bb8e5c166cb1de3385631e12fea4a3) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Delete duplicate Select component.

- [#2823](https://github.com/bigcommerce/catalyst/pull/2823) [`dcad856`](https://github.com/bigcommerce/catalyst/commit/dcad8565d5eb835a5a68785f59811a67149d0137) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Refactor DynamicForm actions to decouple fields and passwordComplexity from state, passing them as separate arguments instead. This reduces state payload size by removing fields from state objects and stripping options from fields before passing them to actions (options are only needed for rendering, not processing). All form actions now accept a `DynamicFormActionArgs` object as the first parameter containing fields and optional passwordComplexity, followed by the previous state and formData.

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

- [#2816](https://github.com/bigcommerce/catalyst/pull/2816) [`b4b87a3`](https://github.com/bigcommerce/catalyst/commit/b4b87a361790bf2edd7614bab1d97490d91ed22f) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Add support for additional HTML attributes on script tags. The scripts transformer now extracts and passes through attributes like `async`, `defer`, `crossorigin`, and `data-*` attributes from BigCommerce script tags to the C15T consent manager, ensuring scripts load with their intended behavior.

- [#2817](https://github.com/bigcommerce/catalyst/pull/2817) [`d469078`](https://github.com/bigcommerce/catalyst/commit/d4690786b17a7d05ef32f8941e4090101980f8bc) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Persist the checkbox product modifier since it can modify pricing and other product data. By persisting this and tracking in the url, this will trigger a product refetch when added or removed. Incidentally, now we manually control what fields are persisted, since `option.isVariantOption` doesn't apply to `checkbox`, additionally multi options modifiers that are not variant options can also modify price and other product data.

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

- [#2820](https://github.com/bigcommerce/catalyst/pull/2820) [`a50fa6f`](https://github.com/bigcommerce/catalyst/commit/a50fa6fda64cbb1370862f43d272b0069f6d6307) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Fix WishlistDetails page from exceeding GraphQL complexity limit, and fix wishlist e2e tests.

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
     product: ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>;
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
     products: Array<ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>>;
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

- [#2814](https://github.com/bigcommerce/catalyst/pull/2814) [`fcb946e`](https://github.com/bigcommerce/catalyst/commit/fcb946e47aafc8be2e63bf3fe776ec6caab1fa72) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Shoppers will now see the store's actual password complexity requirements in the tooltip on the new customer registration form, preventing confusion and failed registration attempts. The schema() function in core/vibes/soul/form/dynamic-form/schema.ts now accepts an optional second parameter passwordComplexity to enable dynamic password validation. The DynamicForm, DynamicFormSection components and their associated server actions also accept an optional passwordComplexity prop that flows through to the schema. Action Required: If you have custom registration or password forms and want to use store-specific password complexity settings, fetch passwordComplexitySettings from the GraphQL API (under site.settings.customers.passwordComplexitySettings) and pass it to your DynamicFormSection component and maintain it in your server action's state. If you don't pass it, password validation defaults to: minimum 8 characters, at least one number, and at least one special character. Conflict Resolution: If merging into custom forms, ensure the passwordComplexity prop is threaded through: Page → DynamicFormSection → DynamicForm → useActionState → schema(). In server actions, add passwordComplexity?: Parameters<typeof schema>[1] to your state type and include it in all return statements to maintain state consistency.

- [#2821](https://github.com/bigcommerce/catalyst/pull/2821) [`e5a03f6`](https://github.com/bigcommerce/catalyst/commit/e5a03f6a73fe16da55b96b75de70d3bbd846dfba) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Fix data-disabled class selectors in UI components

  ## Migration

  Updated Tailwind CSS class selectors from `data-disabled:` to `data-[disabled]:` in the following components:
  - `vibes/soul/form/button-radio-group/index.tsx`
  - `vibes/soul/form/card-radio-group/index.tsx`
  - `vibes/soul/form/radio-group/index.tsx`
  - `vibes/soul/form/rating-radio-group/index.tsx`
  - `vibes/soul/form/swatch-radio-group/index.tsx`
  - `vibes/soul/form/switch/index.tsx`
  - `vibes/soul/primitives/dropdown-menu/index.tsx`

  If you have customized any of these components, update your class names:

  ```diff
  - data-disabled:pointer-events-none data-disabled:opacity-50
  + data-[disabled]:pointer-events-none data-[disabled]:opacity-50
  ```

  This change ensures proper styling of disabled states using the correct Tailwind CSS data attribute syntax.

- [#2819](https://github.com/bigcommerce/catalyst/pull/2819) [`a1f1ed8`](https://github.com/bigcommerce/catalyst/commit/a1f1ed857eab954e085ba67956a954fb2b63882a) Thanks [@jamesqquick](https://github.com/jamesqquick)! - The login form input data will no longer reset on a failed login attempt.

- [#2836](https://github.com/bigcommerce/catalyst/pull/2836) [`06fd9aa`](https://github.com/bigcommerce/catalyst/commit/06fd9aa921ad2c4b8b60706e114a9f425f049d40) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#2826](https://github.com/bigcommerce/catalyst/pull/2826) [`b5f460c`](https://github.com/bigcommerce/catalyst/commit/b5f460c0a5fa5161c853884e18816796b9ea73d9) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#2815](https://github.com/bigcommerce/catalyst/pull/2815) [`52ee85e`](https://github.com/bigcommerce/catalyst/commit/52ee85ef1b08fc6114aa953f7a7e67c11876e7e2) Thanks [@jamesqquick](https://github.com/jamesqquick)! - Add default optional text to form input labels for inputs that are not required.

  ## Migration

  The new required props are optional, so they are backwards compatible. However, this does mean that the `(optional)` text will now show up on fields that aren't explicitly marked as required by passing the required prop to the Label component.

- [#2829](https://github.com/bigcommerce/catalyst/pull/2829) [`8096cc5`](https://github.com/bigcommerce/catalyst/commit/8096cc5ebaf983431f06bd2bd94a9a81899c2b29) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Improve accessibility for price displays by adding screen reader announcements for original prices, sale prices, and price ranges. Visual price elements are hidden from assistive technologies using `aria-hidden="true"` to prevent duplicate announcements, while visually hidden text provides context about pricing information.

  ## Migration steps

  ### Step 1: Update Cart Price Display

  Update `core/vibes/soul/sections/cart/client.tsx` to add accessibility labels for sale prices:

  ```diff
          {lineItem.salePrice && lineItem.salePrice !== lineItem.price ? (
            <span className="font-medium @xl:ml-auto">
  -           <span className="line-through">{lineItem.price}</span> {lineItem.salePrice}
  +           <span className="sr-only">{t('originalPrice', { price: lineItem.price })}</span>
  +           <span aria-hidden="true" className="line-through">
  +             {lineItem.price}
  +           </span>{' '}
  +           <span className="sr-only">{t('currentPrice', { price: lineItem.salePrice })}</span>
  +           <span aria-hidden="true">{lineItem.salePrice}</span>
            </span>
          ) : (
            <span className="font-medium @xl:ml-auto">{lineItem.price}</span>
          )}
  ```

  ### Step 2: Update PriceLabel Component

  Update `core/vibes/soul/primitives/price-label/index.tsx` to add accessibility improvements for sale prices and price ranges:

  ```diff
    import { clsx } from 'clsx';
  + import { useTranslations } from 'next-intl';

    export function PriceLabel({ className, colorScheme = 'light', price }: Props) {
  +   const t = useTranslations('Components.Price');

      if (typeof price === 'string') {
        return (
          ...
        );
      }

      switch (price.type) {
        case 'range':
          return (
            <span ...>
  -           {price.minValue}
  -           &nbsp;&ndash;&nbsp;
  -           {price.maxValue}
  +           <span className="sr-only">
  +             {t('range', { minValue: price.minValue, maxValue: price.maxValue })}
  +           </span>
  +           <span aria-hidden="true">
  +             {price.minValue} - {price.maxValue}
  +           </span>
            </span>
          );

        case 'sale':
          return (
            <span className={clsx('block font-semibold', className)}>
  +           <span className="sr-only">{t('originalPrice', { price: price.previousValue })}</span>
              <span
  +             aria-hidden="true"
                className={clsx(
                  'font-normal line-through opacity-50',
                  ...
                )}
              >
                {price.previousValue}
              </span>{' '}
  +           <span className="sr-only">{t('currentPrice', { price: price.currentValue })}</span>
              <span
  +             aria-hidden="true"
                className={clsx(
                  ...
                )}
              >
                {price.currentValue}
              </span>
            </span>
          );
      }
    }
  ```

  ### Step 3: Add Translation Keys

  Update `core/messages/en.json` to include new translation keys for price accessibility:

  ```diff
    "Cart": {
      "title": "Cart",
      "heading": "Your cart",
      "proceedToCheckout": "Proceed to checkout",
      "increment": "Increase quantity",
      "decrement": "Decrease quantity",
      "removeItem": "Remove item",
      "cartCombined": "We noticed you had items saved in a previous cart, so we've added them to your current cart for you.",
      "cartRestored": "You started a cart on another device, and we've restored it here so you can pick up where you left off.",
      "cartUpdateInProgress": "You have a cart update in progress. Are you sure you want to leave this page? Your changes may be lost.",
  +   "originalPrice": "Original price was {price}.",
  +   "currentPrice": "Current price is {price}.",
  ```

  ```diff
      },
  +   "Price": {
  +     "originalPrice": "Original price was {price}.",
  +     "currentPrice": "Current price is {price}.",
  +     "range": "Price from {minValue} to {maxValue}."
  +   }
    },
    "GiftCertificates": {
  ```

- [#2809](https://github.com/bigcommerce/catalyst/pull/2809) [`dd559b2`](https://github.com/bigcommerce/catalyst/commit/dd559b2d9f354387e19d7c81a809eed97bfc9be3) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Minor UX improvements for the Reviews section:
  - Show `totalCount` for reviews.
  - Show `averageRating` up to the first decimal.
  - Hide `averageRating` next to rating stars when there are no reviews.

## 1.4.0

### Minor Changes

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Upgrade c15t to 1.8.2, migrate from custom mode to offline mode, refactor consent cookie handling to use c15t's compact format, add script location support for HEAD/BODY rendering, and add privacy policy link support to CookieBanner.

  ## What Changed
  - Upgraded `@c15t/nextjs` to version `1.8.2`
  - Changed consent manager mode from `custom` (with endpoint handlers) to `offline` mode
    - Removed custom `handlers.ts` implementation
  - Added `enabled` prop to `C15TConsentManagerProvider` to control consent manager functionality
  - Removed custom consent cookie encoder/decoder implementations (`decoder.ts`, `encoder.ts`)
  - Added `parse-compact-format.ts` to handle c15t's compact cookie format
    - Compact format: `i.t:timestamp,c.necessary:1,c.functionality:1,etc...`
  - Updated cookie parsing logic in both client and server to use the new compact format parser
  - Scripts now support `location` field from BigCommerce API and can be rendered in `<head>` or `<body>` based on the `target` property
  - `CookieBanner` now supports the `privacyPolicyUrl` field from BigCommerce API and will be rendered in the banner description if available.

  ## Migration Path

  ### Consent Manager Provider Changes

  The `ConsentManagerProvider` now uses `offline` mode instead of `custom` mode with endpoint handlers. The provider configuration has been simplified:

  **Before:**

  ```typescript
  <C15TConsentManagerProvider
    options={{
      mode: 'custom',
      consentCategories: ['necessary', 'functionality', 'marketing', 'measurement'],
      endpointHandlers: {
        showConsentBanner: () => showConsentBanner(isCookieConsentEnabled),
        setConsent,
        verifyConsent,
      },
    }}
  >
    <ClientSideOptionsProvider scripts={scripts}>
      {children}
    </ClientSideOptionsProvider>
  </C15TConsentManagerProvider>
  ```

  **After:**

  ```typescript
  <C15TConsentManagerProvider
    options={{
      mode: 'offline',
      storageConfig: {
        storageKey: CONSENT_COOKIE_NAME,
        crossSubdomain: true,
      },
      consentCategories: ['necessary', 'functionality', 'marketing', 'measurement'],
      enabled: isCookieConsentEnabled,
    }}
  >
    <ClientSideOptionsProvider scripts={scripts}>
      {children}
    </ClientSideOptionsProvider>
  </C15TConsentManagerProvider>
  ```

  **Key changes:**
  - `mode` changed from `'custom'` to `'offline'`
  - Removed `endpointHandlers` - no longer needed in offline mode
  - Added `enabled` prop to control consent manager functionality
  - Added `storageConfig` for cookie storage configuration

  ### Cookie Handling

  If you have custom code that directly reads or writes consent cookies, you'll need to update it:

  **Before:**
  The previous implementation used custom encoding/decoding. If you were directly accessing consent cookie values, you would have needed to use the custom decoder.

  **After:**
  The consent cookie now uses c15t's compact format. The public API for reading cookies remains the same:

  ```typescript
  import { getConsentCookie } from '~/lib/consent-manager/cookies/client'; // client-side
  // or
  import { getConsentCookie } from '~/lib/consent-manager/cookies/server'; // server-side

  const consent = getConsentCookie();
  ```

  The `getConsentCookie()` function now internally uses `parseCompactFormat()` to parse the compact format cookie string. If you were directly parsing cookie values, you should now use the `getConsentCookie()` helper instead.

  `getConsentCookie` now returns a compact version of the consent values:

  ```typescript
  {
    i.t: 123456789,
    c.necessary: true,
    c.functionality: true,
    c.marketing: false,
    c.measurment: false
  }
  ```

  Updated instances where `getConsentCookie` is used to reflect this new schema.

  Removed `setConsentCookie` from server and client since this is now handled by the c15t library.

  ### Script Location Support

  Scripts now support rendering in either `<head>` or `<body>` based on the `location` field from the BigCommerce API:

  ```typescript
  // Scripts transformer now includes target based on location
  target: script.location === 'HEAD' ? 'head' : 'body';
  ```

  The `ScriptsFragment` GraphQL query now includes the `location` field, allowing scripts to be placed in the appropriate DOM location. `FOOTER` location is still not supported.

  ### Privacy Policy

  The `RootLayoutMetadataQuery` GraphQL query now includes the `privacyPolicyUrl` field, which renders a provicy policy link in the `CookieBanner` description.

  ```typescript
  <CookieBanner
    privacyPolicyUrl="https://example.com/privacy-policy"
    // ... other props
  />
  ```

  The privacy policy link:
  - Opens in a new tab (`target="_blank"`)
  - Only renders if `privacyPolicyUrl` is provided as a non-empty string

  Add translatable `privacyPolicy` field to `Components.ConsentManager.CookieBanner` translation namespace for the privacy policy link text.

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Conditionally display product ratings in the storefront based on `site.settings.display.showProductRating`. The storefront logic when this setting is enabled/disabled matches exactly the logic of Stencil + Cornerstone.

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Adds product review submission functionality to the product detail page via a modal form with validation for rating, title, review text, name, and email fields. Integrates with BigCommerce's GraphQL API using Conform and Zod for form validation and real-time feedback.

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Introduce displayName and displayKey fields to facets for improved labeling and filtering

  Facet filters now use the `displayName` field for more descriptive labels in the UI, replacing the deprecated `name` field. Product attribute facets now support the `filterKey` field for consistent parameter naming. The facet transformer has been updated to use `displayName` with a fallback to `filterName` when `displayName` is not available.

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Updated product and brand pages to include the number of reviews in the product data. Fixed visual spacing within product cards. Enhanced the Rating component to display the number of reviews alongside the rating. Introduced a new RatingLink component for smooth scrolling to reviews section on PDP.

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Make newsletter signup component on homepage render conditionally based on BigCommerce settings.

  ## What Changed
  - Newsletter signup component (`Subscribe`) on homepage now conditionally renders based on `showNewsletterSignup` setting from BigCommerce.
  - Added `showNewsletterSignup` field to `HomePageQuery` GraphQL query to fetch newsletter settings.
  - Newsletter signup now uses `Stream` component with `Streamable` pattern for progressive loading.

  ## Migration

  To make newsletter signup component render conditionally based on BigCommerce settings, update your homepage code:

  ### 1. Update GraphQL Query (`page-data.ts`)

  Add the `newsletter` field to your `HomePageQuery`:

  ```typescript
  const HomePageQuery = graphql(
    `
      query HomePageQuery($currencyCode: currencyCode) {
        site {
          // ... existing fields
          settings {
            inventory {
              defaultOutOfStockMessage
              showOutOfStockMessage
              showBackorderMessage
            }
            newsletter {
              showNewsletterSignup
            }
          }
        }
      }
    `,
    [FeaturedProductsCarouselFragment, FeaturedProductsListFragment],
  );
  ```

  ### 2. Update Homepage Component (`page.tsx`)

  Import `Stream` and create a streamable for newsletter settings:

  ```typescript
  import { Stream, Streamable } from '@/vibes/soul/lib/streamable';

  // Inside your component, create the streamable:
  const streamableShowNewsletterSignup = Streamable.from(async () => {
    const data = await streamablePageData;
    const { showNewsletterSignup } = data.site.settings?.newsletter ?? {};
    return showNewsletterSignup;
  });

  // Replace direct rendering with conditional Stream:
  <Stream fallback={null} value={streamableShowNewsletterSignup}>
    {(showNewsletterSignup) => showNewsletterSignup && <Subscribe />}
  </Stream>
  ```

  **Before:**

  ```typescript
  <Subscribe />
  ```

  **After:**

  ```typescript
  <Stream fallback={null} value={streamableShowNewsletterSignup}>
    {(showNewsletterSignup) => showNewsletterSignup && <Subscribe />}
  </Stream>
  ```

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Refactor the `ReviewForm` to accept `trigger` prop instead of `formButtonLabel` for flexible rendering.

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Adds OpenTelemetry instrumentation for Catalyst, enabling the collection of spans for Catalyst storefronts.

  ### Migration

  Change is new code only, so just copy over `/core/instrumentation.ts` and `core/lib/otel/tracers.ts`.

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Implement functional newsletter subscription feature with BigCommerce GraphQL API integration.

  ## What Changed
  - Replaced the mock implementation in `subscribe.ts` with a real BigCommerce GraphQL API call using the `SubscribeToNewsletterMutation`.
  - Added comprehensive error handling for invalid emails, already-subscribed users, and unexpected errors.
  - Improved form error handling in `InlineEmailForm` to use `form.errors` instead of field-level errors for better error display.
  - Added comprehensive E2E tests and test fixtures for subscription functionality.

  ## Migration Guide

  Replace the `subscribe` action in `core/components/subscribe/_actions/subscribe.ts` with the latest changes to include:
  - BigCommerce GraphQL mutation for newsletter subscription
  - Error handling for invalid emails, already-subscribed users, and unexpected errors
  - Proper error messages returned via Conform's `submission.reply()`

  Update `inline-email-form` to fix issue of not showing server-side error messages from form actions.

  **`core/vibes/soul/primitives/inline-email-form/index.tsx`**
  1. Add import for `FieldError` component:

  ```tsx
  import { FieldError } from '@/vibes/soul/form/field-error';
  ```

  2. Remove the field errors extraction:

  ```tsx
  // Remove: const { errors = [] } = fields.email;
  ```

  3. Update border styling to check both form and field errors:

  ```tsx
  // Changed from:
  errors.length ? 'border-error' : 'border-black',

  // Changed to:
  form.errors?.length || fields.email.errors?.length
    ? 'border-error focus-within:border-error'
    : 'border-black focus-within:border-primary',
  ```

  4. Update error rendering to display both field-level and form-level errors:

  ```tsx
  // Changed from:
  {
    errors.map((error, index) => (
      <FormStatus key={index} type="error">
        {error}
      </FormStatus>
    ));
  }

  // Changed to:
  {
    fields.email.errors?.map((error) => <FieldError key={error}>{error}</FieldError>);
  }
  {
    form.errors?.map((error, index) => (
      <FormStatus key={index} type="error">
        {error}
      </FormStatus>
    ));
  }
  ```

  This change ensures that server-side error messages returned from form actions (like `formErrors` from Conform's `submission.reply()`) are now properly displayed to users.

  Add the following translation keys to your locale files (e.g., `messages/en.json`):

  ```json
  {
    "Components": {
      "Subscribe": {
        "title": "Sign up for our newsletter",
        "placeholder": "Enter your email",
        "description": "Stay up to date with the latest news and offers from our store.",
        "subscribedToNewsletter": "You have been subscribed to our newsletter!",
        "Errors": {
          "invalidEmail": "Please enter a valid email address.",
          "somethingWentWrong": "Something went wrong. Please try again later."
        }
      }
    }
  }
  ```

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Separate first and last name fields on user session object.

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Conditionally enable storefront reviews functionality based on `site.settings.reviews.enabled`. The storefront logic when this setting is enabled/disabled matches exactly the logic of Stencil + Cornerstone.

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Add out-of-stock / backorder message to product cards on PLPs based on store settings:
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

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Add newsletter subscription toggle to account settings page, allowing customers to manage their marketing preferences directly from their account.

  ## What Changed
  - Added `NewsletterSubscriptionForm` component with a toggle switch for subscribing/unsubscribing to newsletters
  - Created `updateNewsletterSubscription` server action that handles both subscribe and unsubscribe operations via BigCommerce GraphQL API
  - Updated `AccountSettingsSection` to conditionally display the newsletter subscription form when enabled
  - Enhanced `CustomerSettingsQuery` to fetch `isSubscribedToNewsletter` status and `showNewsletterSignup` store setting
  - Updated account settings page to pass newsletter subscription props and bind customer info to the action
  - Added translation keys for newsletter subscription UI in `Account.Settings.NewsletterSubscription` namespace
  - Added E2E tests for subscribing and unsubscribing functionality

  ## Migration Guide

  To add the newsletter subscription toggle to your account settings page:

  ### Step 1: Copy the server action

  Copy the new server action file to your account settings directory:

  ```bash
  cp core/app/[locale]/(default)/account/settings/_actions/update-newsletter-subscription.ts \
     your-app/app/[locale]/(default)/account/settings/_actions/update-newsletter-subscription.ts
  ```

  ### Step 2: Update the GraphQL query

  Update `core/app/[locale]/(default)/account/settings/page-data.tsx` to include newsletter subscription fields:

  ```tsx
  // Renamed CustomerSettingsQuery to AccountSettingsQuery
  const AccountSettingsQuery = graphql(`
    query AccountSettingsQuery(...) {
      customer {
        ...
        isSubscribedToNewsletter  # Add this field
      }
      site {
        settings {
          ...
          newsletter {            # Add this section
            showNewsletterSignup
          }
        }
      }
    }
  `);
  ```

  Also update the return statement to include `newsletterSettings`:

  ```tsx
  const newsletterSettings = response.data.site.settings?.newsletter;

  return {
    ...newsletterSettings, // Add this
  };
  ```

  ### Step 3: Copy the NewsletterSubscriptionForm component

  Copy the new form component:

  ```bash
  cp core/vibes/soul/sections/account-settings/newsletter-subscription-form.tsx \
     your-app/vibes/soul/sections/account-settings/newsletter-subscription-form.tsx
  ```

  ### Step 4: Update AccountSettingsSection

  Update `core/vibes/soul/sections/account-settings/index.tsx`:
  1. Import the new component:

  ```tsx
  import {
    NewsletterSubscriptionForm,
    UpdateNewsletterSubscriptionAction,
  } from './newsletter-subscription-form';
  ```

  2. Add props to the interface:

  ```tsx
  export interface AccountSettingsSectionProps {
    ...
    newsletterSubscriptionEnabled?: boolean;
    isAccountSubscribed?: boolean;
    newsletterSubscriptionTitle?: string;
    newsletterSubscriptionLabel?: string;
    newsletterSubscriptionCtaLabel?: string;
    updateNewsletterSubscriptionAction?: UpdateNewsletterSubscriptionAction;
  }
  ```

  3. Add the form section in the component (after the change password form):

  ```tsx
  {
    newsletterSubscriptionEnabled && updateNewsletterSubscriptionAction && (
      <div className="border-t border-[var(--account-settings-section-border,hsl(var(--contrast-100)))] pt-12">
        <h1 className="@xl:text-2xl mb-10 font-[family-name:var(--account-settings-section-font-family,var(--font-family-heading))] text-2xl font-medium leading-none text-[var(--account-settings-section-text,var(--foreground))]">
          {newsletterSubscriptionTitle}
        </h1>
        <NewsletterSubscriptionForm
          action={updateNewsletterSubscriptionAction}
          ctaLabel={newsletterSubscriptionCtaLabel}
          isAccountSubscribed={isAccountSubscribed}
          label={newsletterSubscriptionLabel}
        />
      </div>
    );
  }
  ```

  ### Step 5: Update the account settings page

  Update `core/app/[locale]/(default)/account/settings/page.tsx`:
  1. Import the action:

  ```tsx
  import { updateNewsletterSubscription } from './_actions/update-newsletter-subscription';
  ```

  2. Extract newsletter settings from the query:

  ```tsx
  const newsletterSubscriptionEnabled = accountSettings.storeSettings?.showNewsletterSignup;
  const isAccountSubscribed = accountSettings.customerInfo.isSubscribedToNewsletter;
  ```

  3. Bind customer info to the action:

  ```tsx
  const updateNewsletterSubscriptionActionWithCustomerInfo = updateNewsletterSubscription.bind(
    null,
    {
      customerInfo: accountSettings.customerInfo,
    },
  );
  ```

  4. Pass props to `AccountSettingsSection`:

  ```tsx
  <AccountSettingsSection
    ...
    isAccountSubscribed={isAccountSubscribed}
    newsletterSubscriptionCtaLabel={t('cta')}
    newsletterSubscriptionEnabled={newsletterSubscriptionEnabled}
    newsletterSubscriptionLabel={t('NewsletterSubscription.label')}
    newsletterSubscriptionTitle={t('NewsletterSubscription.title')}
    updateNewsletterSubscriptionAction={updateNewsletterSubscriptionActionWithCustomerInfo}
  />
  ```

  ### Step 6: Add translation keys

  Add the following keys to your locale files (e.g., `messages/en.json`):

  ```json
  {
    "Account": {
      "Settings": {
        ...
        "NewsletterSubscription": {
          "title": "Marketing preferences",
          "label": "Opt-in to receive emails about new products and promotions.",
          "marketingPreferencesUpdated": "Marketing preferences have been updated successfully!",
          "somethingWentWrong": "Something went wrong. Please try again later."
        }
      }
    }
  }
  ```

  ### Step 7: Verify the feature
  1. Ensure your BigCommerce store has newsletter signup enabled in store settings
  2. Navigate to `/account/settings` as a logged-in customer
  3. Verify the newsletter subscription toggle appears below the change password form
  4. Test subscribing and unsubscribing functionality

  The newsletter subscription form will only display if `newsletterSubscriptionEnabled` is `true` (controlled by the `showNewsletterSignup` store setting).

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Add the following backorder messages to PDP based on the store inventory settings and the product backorders data:
  - Backorder availability prompt
  - Quantity on backorder
  - Backorder message

  ## Migration

  For existing Catalyst stores, to get the newly added feature, simply rebase the existing code with the new release code. The files to be rebased for this change to be applied are:
  - core/messages/en.json
  - core/app/[locale]/(default)/product/[slug]/page-data.ts
  - core/app/[locale]/(default)/product/[slug]/page.tsx
  - core/app/[locale]/(default)/product/[slug]/\_components/product-viewed/fragment.ts
  - core/vibes/soul/sections/product-detail/index.tsx
  - core/vibes/soul/sections/product-detail/product-detail-form.tsx

### Patch Changes

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Update /login/token route error handling and messaging

  ## Migration steps

  ### 1. Add `invalidToken` translation key to the `Auth.Login` namespace:

  ```json
  "invalidToken": "Your login link is invalid or has expired. Please try logging in again.",
  ```

  ### 2. In `core/app/[locale]/(default)/(auth)/login/token/[token]/route.ts`, add a `console.error` in the `catch` block to log the error details:

  ```typescript
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    // ...
  }
  ```

  ### 3. In `core/app/[locale]/(default)/(auth)/login/page.tsx`, add `error` prop to searchParams and pass it down into the `SignInSection` component:

  ```typescript
  export default async function Login({ params, searchParams }: Props) {
    const { locale } = await params;
    const { redirectTo = '/account/orders', error } = await searchParams;

    setRequestLocale(locale);

    const t = await getTranslations('Auth.Login');
    const vanityUrl = buildConfig.get('urls').vanityUrl;
    const redirectUrl = new URL(redirectTo, vanityUrl);
    const redirectTarget = redirectUrl.pathname + redirectUrl.search;
    const tokenErrorMessage = error === 'InvalidToken' ? t('invalidToken') : undefined;

    return (
      <>
        <ForceRefresh />
        <SignInSection
          action={login.bind(null, { redirectTo: redirectTarget })}
          emailLabel={t('email')}
          error={tokenErrorMessage}
          ...
  ```

  ### 4. Update `core/vibes/soul/sections/sign-in-section/index.tsx` and add the `error` prop, and pass it down to `SignInForm`:

  ```typescript
  interface Props {
    // ... existing props
    error?: string;
  }

  // ...

  export function SignInSection({
    // ... existing variables
    error,
  }: Props) {
    // ...
    <SignInForm
      action={action}
      emailLabel={emailLabel}
      error={error}
  ```

  ### 5. Update `core/vibes/soul/sections/sign-in-section/sign-in-form.tsx` to take the error prop and display it in the form errors:

  ```typescript
  interface Props {
    // ... existing props
    error?: string;
  }

  export function SignInForm({
    // ... existing variables
    error,
  }: Props) {
    // ...
    useEffect(() => {
      // If the form errors change when an "error" search param is in the URL,
      // the search param should be removed to prevent showing stale errors.
      if (form.errors) {
        const url = new URL(window.location.href);

        if (url.searchParams.has('error')) {
          url.searchParams.delete('error');
          window.history.replaceState({}, '', url.toString());
        }
      }
    }, [form.errors]);

    const formErrors = () => {
      // Form errors should take precedence over the error prop that is passed in.
      // This ensures that the most recent errors are displayed to avoid confusion.
      if (form.errors) {
        return form.errors;
      }

      if (error) {
        return [error];
      }

      return [];
    };

    return (
      <form {...getFormProps(form)} action={formAction} className="flex grow flex-col gap-5">
        // ...
        <SubmitButton>{submitLabel}</SubmitButton>
        {formErrors().map((err, index) => (
          <FormStatus key={index} type="error">
            {err}
          </FormStatus>
        ))}
      </form>
    );
  }
  ```

  ### 6. Copy all changes in the `core/tests` directory

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Passes `formButtonLabel` from `Reviews` to `ReviewsEmptyState` (was missing) and sets a default value for `formButtonLabel`

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Remove "Exclusive Offers" field temporarily. Currently, the field is not fully implemented in GraphQL, so it may be misleading to display it on the storefront if it's not actually doing anything when registering a customer.

  Once the Register Customer operation takes this field into account, we can display it again.

  ## Migration

  Update `core/app/[locale]/(default)/(auth)/register/page.tsx` and add the function:

  ```ts
  // There is currently a GraphQL gap where the "Exclusive Offers" field isn't accounted for
  // during customer registration, so the field should not be shown on the Catalyst storefront until it is hooked up.
  function removeExlusiveOffersField(field: Field | Field[]): boolean {
    if (Array.isArray(field)) {
      // Exclusive offers field will always have ID '25', since it is made upon store creation and is also read-only.
      return !field.some((f) => f.id === '25');
    }

    return field.id !== '25';
  }
  ```

  Then, add the following code at the end of the `const fields` declaration:

  ```ts
      })
      .filter(exists)
      .filter(removeExlusiveOffersField); // <---
  ```

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Add missing check for optional text field in `core/vibes/soul/form/dynamic-form/schema.ts`.

  ## Migration

  Add `if (field.required !== true) fieldSchema = fieldSchema.optional();` to `text` case in `core/vibes/soul/form/dynamic-form/schema.ts`:

  ```typescript
  case 'text':
      fieldSchema = z.string();

      if (field.pattern != null) {
      fieldSchema = fieldSchema.regex(new RegExp(field.pattern), {
          message: 'Invalid format.',
      });
      }

      if (field.required !== true) fieldSchema = fieldSchema.optional();

      break;
  ```

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Improved login error handling to display a custom error message when BigCommerce indicates a password reset is required, instead of showing a generic error message.

  ## What's Fixed

  When attempting to log in with an account that requires a password reset, users now see an informative error message: "Password reset required. Please check your email for instructions to reset your password."

  **Before**: Generic "something went wrong" error message
  **After**: Clear error message explaining the password reset requirement

  ## Migration

  ### Step 1: Update Translation Files

  Add this translation key to your locale files (e.g., `core/messages/en.json`):

  ```json
  {
    "Auth": {
      "Login": {
        "passwordResetRequired": "Password reset required. Please check your email for instructions to reset your password."
      }
    }
  }
  ```

  Repeat for all supported locales if you maintain custom translations.

  ### Step 2: Update Login Server Action

  In your login server action (e.g., `core/app/[locale]/(default)/(auth)/login/_actions/login.ts`):

  Add the password reset error handling block:

  ```typescript
  if (
    error instanceof AuthError &&
    error.type === 'CallbackRouteError' &&
    error.cause &&
    error.cause.err instanceof BigCommerceGQLError &&
    error.cause.err.message.includes('Reset password"')
  ) {
    return submission.reply({ formErrors: [t('passwordResetRequired')] });
  }
  ```

  This should be placed in your error handling, before the generic "Invalid credentials" check.

- [#2803](https://github.com/bigcommerce/catalyst/pull/2803) [`dbd80fe`](https://github.com/bigcommerce/catalyst/commit/dbd80fe8d74d4e97252fa94c6568115748b6bbea) Thanks [@jorgemoya](https://github.com/jorgemoya)! - - Added optional `salePrice?: string` property to the `CartLineItem` interface
  - Cart UI now displays sale prices with a strikethrough on the original price when `salePrice` is provided and differs from `price`

  ## Migration

  If you're using the `Cart` component with custom line items, you can now optionally include a `salePrice` property:

  ```tsx
  const lineItems = [
    {
      // ... other properties
      price: '$100.00',
      salePrice: '$80.00', // Optional: when provided, displays as strikethrough price + sale price
    },
  ];
  ```

  ### Backward Compatibility

  This change is **fully backward compatible**. The `salePrice` property is optional, so existing implementations will continue to work without modification. If `salePrice` is not provided or equals `price`, only the regular price will be displayed.

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Update translations.

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Update translations.

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Update translations.

- [#2806](https://github.com/bigcommerce/catalyst/pull/2806) [`becb67d`](https://github.com/bigcommerce/catalyst/commit/becb67df001e4a85a3e59ece24c3e44bd3a24cf6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Update translations.

## 1.3.7

### Patch Changes

- [#2772](https://github.com/bigcommerce/catalyst/pull/2772) [`2670f4d`](https://github.com/bigcommerce/catalyst/commit/2670f4d0837d843e425a179bff588119f689567f) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Catalyst has been upgraded to Next.js 15.5.9. This is a patch version upgrade that requires migration steps for existing stores to fix a security vulnerability.

  ## 🔒 Security Update

  **This upgrade addresses a security vulnerability ([CVE-2025-55184 + CVE-2025-55183](https://nextjs.org/blog/security-update-2025-12-11))** that affects React Server Components. These vulnerabilities allow a Denial of Service attack and Source Code Exposure attach. This upgrade includes:
  - Next.js 15.5.9 with the security patch
  - React 19.1.4 and React DOM 19.1.4 with the security patch

  **All users are strongly encouraged to upgrade immediately.**

  ## Key Changes
  - ⚡ **Next.js 15.5.9**: Upgraded from Next.js 15.5.7 to 15.5.9
  - ⚛️ **React 19**: Upgraded to React 19.1.4 and React DOM 19.1.4

  ## Migration Guide

  ### Update Dependencies

  If you're maintaining a custom Catalyst store, update your `package.json`:

  ```json
  {
    "dependencies": {
      "next": "15.5.9",
      "react": "19.1.4",
      "react-dom": "19.1.4"
    },
    "devDependencies": {
      "@next/bundle-analyzer": "15.5.9",
      "eslint-config-next": "15.5.9"
    }
  }
  ```

  Then run:

  ```bash
  pnpm install
  ```

## 1.3.6

### Patch Changes

- [#2762](https://github.com/bigcommerce/catalyst/pull/2762) [`7f3a184`](https://github.com/bigcommerce/catalyst/commit/7f3a184508acb50a09ecbdb811ec5ce34865e363) Thanks [@chanceaclark](https://github.com/chanceaclark)! - # Next.js 15.5.8 Upgrade

  Catalyst has been upgraded to Next.js 15.5.8. This is a patch version upgrade that requires migration steps for existing stores to fix a security vulnerability.

  ## 🔒 Critical Security Update

  **This upgrade addresses a critical security vulnerability ([CVE-2025-55184 + CVE-2025-55183](https://nextjs.org/blog/security-update-2025-12-11))** that affects React Server Components. These vulnerabilities allow a Denial of Service attack and Source Code Exposure attach. This upgrade includes:
  - Next.js 15.5.8 with the security patch
  - React 19.1.3 and React DOM 19.1.3 with the security patch

  **All users are strongly encouraged to upgrade immediately.**

  ## Key Changes
  - ⚡ **Next.js 15.5.8**: Upgraded from Next.js 15.5.7 to 15.5.8
  - ⚛️ **React 19**: Upgraded to React 19.1.3 and React DOM 19.1.3

  ## Migration Guide

  ### Update Dependencies

  If you're maintaining a custom Catalyst store, update your `package.json`:

  ```json
  {
    "dependencies": {
      "next": "15.5.8",
      "react": "19.1.3",
      "react-dom": "19.1.3"
    },
    "devDependencies": {
      "@next/bundle-analyzer": "15.5.8",
      "eslint-config-next": "15.5.8"
    }
  }
  ```

  Then run:

  ```bash
  pnpm install
  ```

## 1.3.5

### Patch Changes

- [#2744](https://github.com/bigcommerce/catalyst/pull/2744) [`720fe17`](https://github.com/bigcommerce/catalyst/commit/720fe1722295841a995277ec514bc8280644b879) Thanks [@chanceaclark](https://github.com/chanceaclark)! - # Next.js 15.5.7 Upgrade

  Catalyst has been upgraded to Next.js 15.5.7. This is a patch version upgrade that requires migration steps for existing stores to fix a security vulnerability.

  ## 🔒 Critical Security Update

  **This upgrade addresses a critical security vulnerability ([CVE-2025-55182](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components))** that affects React Server Components. The vulnerability allowed unauthenticated remote code execution on servers running React Server Components. This upgrade includes:
  - Next.js 15.5.7 with the security patch
  - React 19.1.2 and React DOM 19.1.2 with the security patch

  **All users are strongly encouraged to upgrade immediately.**

  ## Key Changes
  - ⚡ **Next.js 15.5.7**: Upgraded from Next.js 15.5.1-canary.4 to 15.5.7 (no more canary)
  - ⚛️ **React 19**: Upgraded to React 19.1.2 and React DOM 19.1.2
  - 🔄 **Partial Prerendering (PPR) Removed**: Removed partial prerendering as it's unsupported in non-canary versions of Next.js 15.

  ### ⚠️ Partial Prerendering (PPR) Removed

  **Important**: PPR (Partial Prerendering) has been **removed** in this release as it's unsupported in non-canary versions of Next.js 15.
  - The `ppr` experimental flag has been removed from `next.config.ts`
  - Full support for Next.js 16's and it's new cache component patterns will be added in a future release
  - This may result in different performance characteristics compared to the Next.js 15 + PPR setup

  ## Migration Guide

  ### Step 1: Update Dependencies

  If you're maintaining a custom Catalyst store, update your `package.json`:

  ```json
  {
    "dependencies": {
      "next": "15.5.7",
      "react": "^19.1.2",
      "react-dom": "^19.1.2"
    },
    "devDependencies": {
      "@next/bundle-analyzer": "15.5.7",
      "eslint-config-next": "15.5.7"
    }
  }
  ```

  Then run:

  ```bash
  pnpm install
  ```

  ### Step 2: Update next.config.ts

  Remove or comment out PPR configuration:

  ```typescript
  // Remove or disable:
  // experimental: {
  //   ppr: 'incremental',
  // }
  ```

  Remove or comment out eslint config

  ```typescript
  // eslint: {
  //     ignoreDuringBuilds: !!process.env.CI,
  //     dirs: [
  //     'app',
  //     'auth',
  //     'build-config',
  //     'client',
  //     'components',
  //     'data-transformers',
  //     'i18n',
  //     'lib',
  //     'middlewares',
  //     'scripts',
  //     'tests',
  //     'vibes',
  //     ],
  // },
  ```

  ### Step 3: Remove `export const experimental_ppr`

  Remove any references to `export const experimental_ppr` in your codebase as it is not being used anymore.

## 1.3.4

### Patch Changes

- [#2720](https://github.com/bigcommerce/catalyst/pull/2720) [`ebd5993`](https://github.com/bigcommerce/catalyst/commit/ebd5993cfbb507da1d2341fb6f1a7276eee50795) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Noop release to account for typecheck issue.

## 1.3.3

### Patch Changes

- [#2695](https://github.com/bigcommerce/catalyst/pull/2695) [`6d565c2`](https://github.com/bigcommerce/catalyst/commit/6d565c2cbf98e3fa0c2b0142734fc68a5d48bd2c) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Add Gift Certificates link to the header/footer.

- [#2694](https://github.com/bigcommerce/catalyst/pull/2694) [`fdedcaa`](https://github.com/bigcommerce/catalyst/commit/fdedcaa99c83d5c32c54dec0974962b7d17447cf) Thanks [@BC-AdamWard](https://github.com/BC-AdamWard)! - Fix anonymous session cookie maxAge calculation to correctly set 7 days instead of 7 hours.

## 1.3.2

### Patch Changes

- [`ce1731f`](https://github.com/bigcommerce/catalyst/commit/ce1731f0cb0f0e411c3ffa4734b0256dbdacafbb) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Updates the scripts transformer to account for inline scripts having a `src` attribute with empty content.

## 1.3.1

### Patch Changes

- [#2679](https://github.com/bigcommerce/catalyst/pull/2679) [`323483a`](https://github.com/bigcommerce/catalyst/commit/323483adfdd7dc1bf925034ae360d7a803d76ab9) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Update the `lint` command to utilize `eslint` CLI directly. `next lint` is deprecated in Next.js version 16 and this provides a lower migration impact when the time comes.

- [#2681](https://github.com/bigcommerce/catalyst/pull/2681) [`cacfb55`](https://github.com/bigcommerce/catalyst/commit/cacfb55b89d7de64c80eb66b671d279898a43a1e) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Minor refactor to improve the performance when navigating from the cart to the checkout.
  - [#2680](https://github.com/bigcommerce/catalyst/pull/2680)
  - [#2681](https://github.com/bigcommerce/catalyst/pull/2681)

  ### Migration

  Use the above PR diffs as a reference.
  1. Remove `core/app/[locale]/(default)/cart/_actions/redirect-to-checkout.ts`
  2. Update `checkoutAction` in `core/app/[locale]/(default)/cart/page.tsx` to `"/checkout"`
  3. Copy changes to `core/app/[locale]/(default)/checkout/route.ts`
  4. Update `core/lib/server-toast.ts` and set the cookie `maxAge` to `1` - this ensures any toast errors live through the redirect back to the `/cart` page
  5. Copy changes in `core/vibes/soul/sections/cart/client.tsx`
  6. Update `en.json` with the updated translation values (optional)

## 1.3.0

### Minor Changes

- [#2659](https://github.com/bigcommerce/catalyst/pull/2659) [`abaa461`](https://github.com/bigcommerce/catalyst/commit/abaa46102d1024b99d6a3fca116ac910c104b719) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Adds consent-aware script loading to Catalyst's consent manager, achieving parity with Stencil's behavior where scripts are conditionally rendered based on user consent preferences. BigCommerce scripts from the Store Scripts API are now transformed and loaded via C15T's ClientSideOptionsProvider, with ESSENTIAL/UNKNOWN scripts rendering by default, all scripts rendering when consent is fully granted, and specific scripts loading based on granular consent selections.

- [#2643](https://github.com/bigcommerce/catalyst/pull/2643) [`391e20d`](https://github.com/bigcommerce/catalyst/commit/391e20d2c03e8f607f6f6c80d294565e79546693) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Adds a new consent manager provider using the `@c15t/nextjs` package to handle cookie consent management with support for multiple consent categories and cookie-based persistence.

- [#2666](https://github.com/bigcommerce/catalyst/pull/2666) [`ed1f615`](https://github.com/bigcommerce/catalyst/commit/ed1f615a9b84a70e24fd7015fbd17bd5abe47695) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Passes the shoppers consent to the checkout redirect mutation

- [#2619](https://github.com/bigcommerce/catalyst/pull/2619) [`19077cd`](https://github.com/bigcommerce/catalyst/commit/19077cd294c5c710dfdeae54f29f13a76401bfa4) Thanks [@Tharaae](https://github.com/Tharaae)! - Add current stock message to product details page based on the store/product inventory settings.

  ## Migration

  For existing Catalyst stores, to get the newly added feature, simply rebase the existing code with the new release code. The files to be rebased for this change to be applied are:
  - core/messages/en.json
  - core/app/[locale]/(default)/product/[slug]/page-data.ts
  - core/app/[locale]/(default)/product/[slug]/page.tsx

- [#2664](https://github.com/bigcommerce/catalyst/pull/2664) [`71cfd62`](https://github.com/bigcommerce/catalyst/commit/71cfd62e99c223391e77d20198e9cf673bc61dd9) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Provides a way to track analytics consent updates within the analytics provider. This also enables a the Google Analytics provider to be able to get the initial consent values so it can initialize the default consent values.

- [#2661](https://github.com/bigcommerce/catalyst/pull/2661) [`be00b44`](https://github.com/bigcommerce/catalyst/commit/be00b44cd3afd82dff84dfa1104eccbcb6df946f) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Integrates Catalyst's consent manager with the BigCommerce Control Panel's Cookie Consent setting, allowing merchants to centrally control whether the consent banner displays on the storefront. When disabled in the Control Panel, the consent banner is suppressed and all script categories are consented implicitly, matching Stencil behavior.

- [#2650](https://github.com/bigcommerce/catalyst/pull/2650) [`416796f`](https://github.com/bigcommerce/catalyst/commit/416796fa4143d28ce41ba89a3f176f3b7fba552c) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Added consent manager UI components with Catalyst styling and next-intl integration. The `CookieBanner` and `ConsentManagerDialog` provide a customizable banner and preference dialog for cookie consent.

### Patch Changes

- [#2577](https://github.com/bigcommerce/catalyst/pull/2577) [`baf07ca`](https://github.com/bigcommerce/catalyst/commit/baf07ca89fdbb65bebf5926738b72690e4e6db60) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove unused exports from core

- [#2551](https://github.com/bigcommerce/catalyst/pull/2551) [`be23108`](https://github.com/bigcommerce/catalyst/commit/be2310809342d83cfc1a3619a537d2abf66dfe79) Thanks [@jkanive](https://github.com/jkanive)! - fix: resolve maintenance page width issues
  - Add w-full classes to ensure proper width expansion
  - Remove flex-1 in favor of w-full for column layout

- [#2574](https://github.com/bigcommerce/catalyst/pull/2574) [`be80d14`](https://github.com/bigcommerce/catalyst/commit/be80d14c1c1051189e629d182dfd46fc60c363b1) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove unused dependencies.

- [#2609](https://github.com/bigcommerce/catalyst/pull/2609) [`4e6f58d`](https://github.com/bigcommerce/catalyst/commit/4e6f58dfda649571c56ec57b642e7addfb92a4aa) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Adds the product count to the facet label if the facet provides the count. This also fixes an issue where the facets weren't respecting the collapse by default setting.

- [#2572](https://github.com/bigcommerce/catalyst/pull/2572) [`337b7ce`](https://github.com/bigcommerce/catalyst/commit/337b7ce05ee71ec3d937c3aa373aec8516896254) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove unused UI files.

- [#2580](https://github.com/bigcommerce/catalyst/pull/2580) [`f790cd6`](https://github.com/bigcommerce/catalyst/commit/f790cd67a4b632ecb4f3dfd5e7d416859cbcb042) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove unused export types from core.

- [#2670](https://github.com/bigcommerce/catalyst/pull/2670) [`d5fbb73`](https://github.com/bigcommerce/catalyst/commit/d5fbb7394696dc77da5cf9b615a2b73eba28e8e5) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Fixed issue with 301 redirect loops when `TRAILING_SLASH` is set to `false`, or when 301 redirects exist targeting the same path but with different capitalization.

- [#2585](https://github.com/bigcommerce/catalyst/pull/2585) [`a40b96f`](https://github.com/bigcommerce/catalyst/commit/a40b96f743ce5462cba4615026cbc6951aa87104) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Add graceful error handling for invalid anonymous JWT cookies

- [#2578](https://github.com/bigcommerce/catalyst/pull/2578) [`bb7940c`](https://github.com/bigcommerce/catalyst/commit/bb7940cedd169f053d55b787cc2b7183f737edba) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove recpatcha code until we're ready to add it at a later point (if needed).

  ## Migration
  - A lot of the code removed was just old commented out blocks.
  - Remove any recaptcha mention from graphql mutation and queries

- [#2656](https://github.com/bigcommerce/catalyst/pull/2656) [`ff9aa17`](https://github.com/bigcommerce/catalyst/commit/ff9aa17a78c4731af02ebb4d220f86960c0e9169) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updates next-auth to the latest beta version

  ## Migration

  Delete the `@ts-expect-error` comments within the `with-auth.ts` middleware.

- [#2662](https://github.com/bigcommerce/catalyst/pull/2662) [`8c6626e`](https://github.com/bigcommerce/catalyst/commit/8c6626e104d81dce09ecc623cdec949a23224ee8) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Replace `StreamableAnalyticsProvider`with simplified `AnalyticsProvider` component.
  - Removed `StreamableAnalyticsProvider` that used `Streamable.from()` for async data loading.
  - Added new `AnalyticsProvider` component that accepts `channelId` and `settings` as direct props.
  - Simplifies analytics initialization by removing unnecessary streaming complexity.
  - Maintains same functionality with cleaner, more straightforward implementation.
  - Fixes issue of events not triggering by properly wrapping `children` inside the provider.

  ## Migration
  - Use new `AnalyticsProvider` component in `core/app/[locale]/layout.tsx`, instead of `StreamableAnalyticsProvider`.

- [#2667](https://github.com/bigcommerce/catalyst/pull/2667) [`c8dbba6`](https://github.com/bigcommerce/catalyst/commit/c8dbba6de4aa70dbe7c4ced3ce29375aea214d1f) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#2589](https://github.com/bigcommerce/catalyst/pull/2589) [`d3391ee`](https://github.com/bigcommerce/catalyst/commit/d3391eea6c87d05629e15f4f47bb5ad54c47f081) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#2675](https://github.com/bigcommerce/catalyst/pull/2675) [`ab9f11e`](https://github.com/bigcommerce/catalyst/commit/ab9f11ed0d75a0f6cd6f3abc039c1652415057a2) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#2608](https://github.com/bigcommerce/catalyst/pull/2608) [`3d47825`](https://github.com/bigcommerce/catalyst/commit/3d4782536022e1f9a33237963c4f013558108cf3) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#2648](https://github.com/bigcommerce/catalyst/pull/2648) [`7914650`](https://github.com/bigcommerce/catalyst/commit/791465079b8abaeae7662745c28e99f67876393c) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

## 1.2.0

### Minor Changes

- [#2475](https://github.com/bigcommerce/catalyst/pull/2475) [`33b574d`](https://github.com/bigcommerce/catalyst/commit/33b574d2fefe8514c4e512acf3f706058a6c8a2f) Thanks [@bookernath](https://github.com/bookernath)! - Implement Vercel Runtime Cache API as replacement for Vercel KV adapter

### Patch Changes

- [#2526](https://github.com/bigcommerce/catalyst/pull/2526) [`2089a58`](https://github.com/bigcommerce/catalyst/commit/2089a58f6bdaeab68a014ad66422932f392e6c46) Thanks [@chanceaclark](https://github.com/chanceaclark)! - The anonymous session cookie had `secure` always set to true regardless if we were prefixing it or not. This change updates the cookie to set `secure` to the same "value" if we prefix the cookie with `__Secure-`.

- [#2564](https://github.com/bigcommerce/catalyst/pull/2564) [`69797a4`](https://github.com/bigcommerce/catalyst/commit/69797a4c9f0bfc8b27b7f144ded5545fdbb5e5cf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add visual queues when the cart state is being updated in the Cart page. Will also warn about pending state when trying to navigate away from page.

  ## Migration
  1. Update `/core/vibes/soul/sections/cart/client.tsx` to include latest changes:
  - Use `isLineItemActionPending` to track when we need to disable checkout button and add a loading state.
  - Add skeletons to checkout summary fields that will update when the pending state is complete.
  - Add side effects to handle when a user `beforeunload` and when user tries to navigate using a link.
  - Add prop to `lineItemActionPendingLabel` to be able to pass in a translatable label to the window alert.
  2. Add label to dictionary of choice.

- [#2521](https://github.com/bigcommerce/catalyst/pull/2521) [`6f6a8af`](https://github.com/bigcommerce/catalyst/commit/6f6a8af4fd7a5754b9d08aef75c4e40ab3057318) Thanks [@bookernath](https://github.com/bookernath)! - Preconnect to checkout domain on cart page to improve checkout load time

- Updated dependencies [[`707ec24`](https://github.com/bigcommerce/catalyst/commit/707ec24745b6a0040551328d64657ff40df4e252), [`a27054f`](https://github.com/bigcommerce/catalyst/commit/a27054f4f22013707d40a100b15122c22354c956)]:
  - @bigcommerce/catalyst-client@1.0.1

## 1.1.0

### Minor Changes

- [#2477](https://github.com/bigcommerce/catalyst/pull/2477) [`02af32c`](https://github.com/bigcommerce/catalyst/commit/02af32c459719f97e8973a19b6889e5fa73d0c38) Thanks [@bookernath](https://github.com/bookernath)! - Add support for Scripts API/Script Manager scripts rendering via next/script

### Patch Changes

- [#2465](https://github.com/bigcommerce/catalyst/pull/2465) [`a438bb6`](https://github.com/bigcommerce/catalyst/commit/a438bb660bc3bd11adacd125769ba99ba2e1c38d) Thanks [@bookernath](https://github.com/bookernath)! - Bump next to 15.4.0-canary.114 to fix issue with PDPs 500ing on Docker builds

- [#2474](https://github.com/bigcommerce/catalyst/pull/2474) [`989bf97`](https://github.com/bigcommerce/catalyst/commit/989bf974c534a7201782ace9a4bf3fe745e8af01) Thanks [@bookernath](https://github.com/bookernath)! - Respect min/max purchase quantity from API in quantity selector

- [#2464](https://github.com/bigcommerce/catalyst/pull/2464) [`474f960`](https://github.com/bigcommerce/catalyst/commit/474f960c4c428e28874022b36ae2b03e0b301e20) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove edge runtime declarations to be able to run Catalyst with OpenNext.

- [#2468](https://github.com/bigcommerce/catalyst/pull/2468) [`8b64931`](https://github.com/bigcommerce/catalyst/commit/8b6493156a70490c0c35c35d45ebd9ad8f23615c) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

## 1.0.1

### Patch Changes

- [#2448](https://github.com/bigcommerce/catalyst/pull/2448) [`e4444a2`](https://github.com/bigcommerce/catalyst/commit/e4444a2ca83b5b73776c842feff56e47f57344dc) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Fixes an issue where the anonymous session wasn't getting cleared after an actual session was established.

## 1.0.0

### Major Changes

- [`6b17bdb`](https://github.com/bigcommerce/catalyst/commit/6b17bdb) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Introduce Soul VIBE UI library to the repository.

- Added a collection of reusable primitives with modern styles
- Prebuilt sections and page templates that are easy to use
- Fast performance and modern patterns leveraging the latest features of Next.js
- Easy customization to best represent your brand
- Utilize @conform-to/react for progressively enhanced HTML forms

Join the discussion [here](https://github.com/bigcommerce/catalyst/discussions/1861) for more details of this major milestone for Catalyst!

### Minor Changes

- [`589c91a`](https://github.com/bigcommerce/catalyst/commit/589c91a) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Enable cart restoration on non-persistent cart logouts.

**Migration**

Update the logout mutation to include the `cartEntityId` variable + the `cartUnassignResult` node and make sure the `client.fetch` method contains the new variable.

```diff
-mutation LogoutMutation {
+mutation LogoutMutation($cartEntityId: String) {
-  logout {
+  logout(cartEntityId: $cartEntityId) {
    result
+    cartUnassignResult {
+      cart {
+        entityId
+      }
+    }
  }
}
```

- [`32a28b9`](https://github.com/bigcommerce/catalyst/commit/32a28b9) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Use isomorphic-dompurify to santize any sort of shopper supplied input.

- [`f039b2c`](https://github.com/bigcommerce/catalyst/commit/f039b2c) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Properly handle `BigCommerceGQLError` in actions, by returning the error messages from the request.

- [`dd66f96`](https://github.com/bigcommerce/catalyst/commit/dd66f96) Thanks [@matthewvolk](https://github.com/matthewvolk)! - In order to maintain parity with Stencil's 404 page, we wanted to allow the user to search from the 404 page. Since the search included with the header component is fully featured, we included a CTA to open the same search that you get when clicking the search icon in the header.

**Migration**

Most changes are additive, so they should hopefully be easy to resolve if flagged for merge conflicts. Change #3 below replaces the Search state with the new search context, be sure to pay attention to the new

1. This change adds a new directory under `core/` called `context/` containing a `search-context.tsx` file. Since this is a new file, there shouldn't be any merge conflicts
2. `SearchProvider` is imported into `core/app/providers` and replaces the React fragment (`<>`) that currently wraps `<Toaster>` and `{children}`
3. In `core/vibes/soul/primitives/navigation`, replace `useState` with `useSearch` imported from the new context file, and update the dependency arrays for the `useEffect`'s in the `Navigation component`
4. Add search `Button` that calls `setIsSearchOpen(true)` to the `NotFound` component in `core/vibes/sections/not-found/index.tsx`

- [`62b891c`](https://github.com/bigcommerce/catalyst/commit/62b891c) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Adds support for nested web page children / trees. Restructure web page routing to support a layout file.

- [`44342ee`](https://github.com/bigcommerce/catalyst/commit/44342ee) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Sets a default session when any user first visits the page.

- [`ff57b8a`](https://github.com/bigcommerce/catalyst/commit/ff57b8a) Thanks [@eugene(yevhenii)kuzmenko](<https://github.com/eugene(yevhenii)kuzmenko>)! - Pass analytics cookies to checkout mutation to preserve the analytics session whenever shopper redirects to the external checkout

- [`067d5a4`](https://github.com/bigcommerce/catalyst/commit/067d5a4) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Move the anonymous session into it's own cookie, separate from Auth.js in order to have better non-persistent cart support.

**Migration**

If you were using `await signIn('anonymous', { redirect: false });`, you'll need to migrate over to using the `await anonymousSignIn()` function. Otherwise, we am only changing the underlying logic in existing API's so pulling in the changes should immediately pick this up.

- [`9b3541d`](https://github.com/bigcommerce/catalyst/commit/9b3541d) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Adds a new analytics provider meant to replace the other provider. This provider is built being framework agnostic but exposes a react provider to use within context. The initial implementation comes with a Google Analytics provider with some basic events to get started. We need to add some other events around starting checkout, banners, consent loading, and search. This change is additive only so no migration is needed until consumption.

- [`bd3bc8b`](https://github.com/bigcommerce/catalyst/commit/bd3bc8b) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Implement the new analytics provider, utilizing the GoogleAnalytics provider as the first analytics solution.

Most changes are additive so merge conflicts should be easy to resolve. In order to use the new provider from the previous provider, if it's already not setup in the BigCommerce control panel for checkout analytics, you'll need to add the GA4 property ID. This will automatically be used by the new GoogleAnalytics provider.

- [`70afa5a`](https://github.com/bigcommerce/catalyst/commit/70afa5a) Thanks [@eugene(yevhenii)kuzmenko](<https://github.com/eugene(yevhenii)kuzmenko>)! - Dispatch Visit started and Product Viewed analytics events

- [`da2a462`](https://github.com/bigcommerce/catalyst/commit/da2a462) Thanks [@bookernath](https://github.com/bookernath)! - Add currency selector to header

- [`f3b4d90`](https://github.com/bigcommerce/catalyst/commit/f3b4d90) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Add Wishlist account pages and public wishlist page

- [`59ff1ce`](https://github.com/bigcommerce/catalyst/commit/59ff1ce) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Fetches the stores URLs on build which can remove the need of setting NEXT_PUBLIC_BIGCOMMERCE_CDN_HOSTNAME. The environment variable is still provided in case customization is needed.

- [`a0e6425`](https://github.com/bigcommerce/catalyst/commit/a0e6425) Thanks [@eugene(yevhenii)kuzmenko](<https://github.com/eugene(yevhenii)kuzmenko>)! - Adds analytics cookies needed for native analytics.

This is a add-only change, so migration should be as simple as pulling in the new code.

- [`a601f7e`](https://github.com/bigcommerce/catalyst/commit/a601f7e) Thanks [@jorgemoya](https://github.com/jorgemoya)! - This refactor optimizes compare for caching and the eventual use of dynamicIO.

**Key modifications include:**

- Our query functions now take in all params required for fetching, instead of accessing dynamic variables internally. This is important to serialize arguments if we want to eventually `use cache`.
- Use `Streamable.from` to generate our streaming props that are passed to our UI components.

**Migration instructions:**

- Updated `/app/[locale]/(default)/compare/page.tsx` to use `Streamable.from` pattern.
- Renamed `getCompareData` query to `getComparedProducts`.
  - Updated query
  - Returns empty `[]` if no product ids are passed

- [`c6e38a6`](https://github.com/bigcommerce/catalyst/commit/c6e38a6) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Reorganize and cleanup files:
- Moved `core/context/search-context` to `core/lib/search`.
- Moved `core/client/mutations/add-cart-line-item.ts` and `core/client/mutations/create-cart.ts` into `core/lib/cart/*`.
- Removed `core/client/queries/get-cart.ts` in favor of a smaller, more focused query within `core/lib/cart/validate-cart.ts`.

**Migration**

- Replace imports from `~/context/search-context` to `~/lib/search`.
- Replace imports from `~/client/mutations/` to `~/lib/cart/`.
- Remove any direct imports from `~/client/queries/get-cart.ts` and use the new `validate-cart.ts` query instead. If you need the previous `getCart` function, you can copy it from the old file and adapt it to your needs.

- [`7b3b81c`](https://github.com/bigcommerce/catalyst/commit/7b3b81c) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Replaces the REST-powered `client.fetchShippingZones` method with a GraphQL-powered query containing the `site.settings.shipping.supportedShippingDestinations` field.

**Migration:**

1. The return type of `getShippingCountries` has the same shape as the `Country` BigCommerce GraphQL type, so you should be able to copy the graphql query from `core/app/[locale]/(default)/cart/page-data.ts` into your project and replace the existing `getShippingCountries` method in there.
2. Remove the argument `data.geography` from the `getShippingCountries` invocation in `core/app/[locale]/(default)/cart/page.tsx`
3. Finally, you should be able to delete the file `core/client/management/get-shipping-zones.ts` assuming it is no longer referenced anywhere in `core/`

- [`53e0b5e`](https://github.com/bigcommerce/catalyst/commit/53e0b5e) Thanks [@jorgemoya](https://github.com/jorgemoya)! - This refactor optimizes category PLP for caching and the eventual use of dynamicIO. With these changes we leverage data caching to hit mostly cache data for guest shoppers in different locales and with different currencies.

**Key modifications include:**

- We don't stream in Category page data, instead it's a blocking call that will redirect to `notFound` when category is not found. Same for metadata.
- Our query functions now take in all params required for fetching, instead of accessing dynamic variables internally. This is important to serialize arguments if we want to eventually `use cache`.
- Use `Streamable.from` to generate our streaming props that are passed to our UI components.
- Remove use of nuqs' `createSearchParamsCache` in favor of nuqs' `createLoader`.

**Migration instructions:**

- Update `/(facted)/category/[slug]/page.tsx`
  - For this page we are now doing a blocking request for category page data. Instead of having functions that each would read from props, we share streamable functions that can be passed to our UI components. We still stream in filter and product data.
- Update `/(facted)/category/[slug]/page-data.tsx`
  - Request now accept `customerAccessToken` as a prop instead of calling internally.
- Update`/(facted)/category/[slug]/fetch-compare-products.ts`
  - Request now accept `customerAccessToken` as a prop instead of calling internally.
- Update `/(faceted)/fetch-faceted-search.ts`
  - Request now accept `customerAccessToken` and `currencyCode` as a prop instead of calling internally.

- [`537db2c`](https://github.com/bigcommerce/catalyst/commit/537db2c) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Add the ability to redirect from the login page. Developers can now append a relative path to the `?redirectTo=` query param on the `/login` page. When a shopper successfully logs in, it'll redirect them to the given relative path. Defaults to `/account/orders` to prevent a breaking change.

- [`b20dfb0`](https://github.com/bigcommerce/catalyst/commit/b20dfb0) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Adds an eslint rule to import expect and test from ~/tests/fixtures instead of the @playwright/test module. This is to create a more consistent testing experience across the codebase.

**Migration**

Any import statements that import `expect` and `test` from `@playwright/test` should be updated to import from `~/tests/fixtures` instead. All other imports from `@playwright/test` should remain unchanged.

```diff
-import { expect, type Page, test } from '@playwright/test';
+import { type Page } from '@playwright/test';
+
+import { expect, test } from '~/tests/fixtures';
```

- [`f0464a8`](https://github.com/bigcommerce/catalyst/commit/f0464a8) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Drops CSS support for Safari < 15 due to those versions only having 0.09% global usage.

- [`1d6cf64`](https://github.com/bigcommerce/catalyst/commit/1d6cf64) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Render address fields for customer registration form.

- [`42ded4a`](https://github.com/bigcommerce/catalyst/commit/42ded4a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - This refactor optimizes home page, header, and footer for caching and the eventual use of dynamicIO. With these changes we leverage data caching to hit mostly cache data for guest shoppers in different locales and with different currencies.

**Key modifications include:**

- Header and Footer now have a blocking request for the shared data that is the same for all users.
- Data that can change for logged in users is now a separate request.
- Our query functions now take in all params required for fetching, instead of accessing dynamic variables internally. This is important to serialize arguments if we want to eventually `use cache`.
- Dynamic fetches (using customerAccessToken or preferred currency) are now all streaming queries.
- Use `Streamable.from` to generate our streaming props that are passed to our UI components.
- Update Header UI component to allow streaming in of currencies data.

**Migration instructions:**

- Renamed `/app/[locale]/(default)/query.ts` to `/app/[locale]/(default)/page-data.ts`, include page query on this page.
- Updated `/app/[locale]/(default)/page.ts` to use `Streamable.from` pattern.
- Split data that can vary by user from `core/components/footer/fragment.ts` and `core/components/header/fragment.ts`
- Updated `core/components/header/index.tsx` and `core/components/footer/index.tsx` to fetch shared data in a blocking request and pass data that varies by customer as streamable data. Updated to use the new `Streamable.from` pattern.
- [`061063f`](https://github.com/bigcommerce/catalyst/commit/061063f) Thanks [@jorgemoya](https://github.com/jorgemoya)! - This refactor optimizes search PLP for caching and the eventual use of dynamicIO. With these changes we leverage data caching to hit mostly cache data for guest shoppers in different locales and with different currencies.

**Key modifications include:**

- We don't stream in Search page data, instead it's a blocking call to get page data.
- Our query functions now take in all params required for fetching, instead of accessing dynamic variables internally. This is important to serialize arguments if we want to eventually `use cache`.
- Use `Streamable.from` to generate our streaming props that are passed to our UI components.
- Remove use of nuqs' `createSearchParamsCache` in favor of nuqs' `createLoader`.

**Migration instructions:**

- Update `/(facted)/search/page.tsx`
  - For this page we are now doing a blocking request for brand page data. Instead of having functions that each would read from props, we share streamable functions that can be passed to our UI components. We still stream in filter and product data.

- [`da2a462`](https://github.com/bigcommerce/catalyst/commit/da2a462) Thanks [@bookernath](https://github.com/bookernath)! - Adds the ability to redirect after logout.

- [`863d744`](https://github.com/bigcommerce/catalyst/commit/863d744) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Removes the old analytics provider in favor of the provider that fetches the configuration from the GraphQL API.

- [`061063f`](https://github.com/bigcommerce/catalyst/commit/061063f) Thanks [@jorgemoya](https://github.com/jorgemoya)! - This refactor optimizes brand PLP for caching and the eventual use of dynamicIO. With these changes we leverage data caching to hit mostly cache data for guest shoppers in different locales and with different currencies.

**Key modifications include:**

- We don't stream in Brand page data, instead it's a blocking call that will redirect to `notFound` when brand is not found. Same for metadata.
- Our query functions now take in all params required for fetching, instead of accessing dynamic variables internally. This is important to serialize arguments if we want to eventually `use cache`.
- Use `Streamable.from` to generate our streaming props that are passed to our UI components.
- Remove use of nuqs' `createSearchParamsCache` in favor of nuqs' `createLoader`.

**Migration instructions:**

- Update `/(facted)/brand/[slug]/page.tsx`
  - For this page we are now doing a blocking request for brand page data. Instead of having functions that each would read from props, we share streamable functions that can be passed to our UI components. We still stream in filter and product data.
- Update `/(facted)/brand/[slug]/page-data.tsx`
  - Request now accept `customerAccessToken` as a prop instead of calling internally.

### Patch Changes

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`c73b57e`](https://github.com/bigcommerce/catalyst/commit/c73b57e) Thanks [@migueloller](https://github.com/migueloller)! - Use `setRequestLocale` in all pages and layouts and pass `locale` parameter to `getTranslations` in all `generateMetadata` to maximize static rendering. This is part of the ongoing work in preparation of enabling PPR and `dynamicIO` for all routes.

- [`d70596e`](https://github.com/bigcommerce/catalyst/commit/d70596e) Thanks [@alanpledger](https://github.com/alanpledger)! - Fixes types for signIn credentials and improves error handling for registering a customer.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Applied streamable pattern to Cart.

- [`54ee390`](https://github.com/bigcommerce/catalyst/commit/54ee390) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove unecessary `fetchOptions` in object that has nothing to do with a client request.

- [`ab1f0a0`](https://github.com/bigcommerce/catalyst/commit/ab1f0a0) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Add wishlist support to product display pages

**Migration**

- Ensure WishlistButton component is passed to additionalActions prop on ProductDetail
- Ensure WishlistButtonForm is used on product page

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add persistent cart support

- [`27b2823`](https://github.com/bigcommerce/catalyst/commit/27b2823) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Fix issue where delete button is not displayed if you have only 1 address

**Migration steps:**

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

- [`0779856`](https://github.com/bigcommerce/catalyst/commit/0779856) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Adds Tailwind classes used to style the checkbox input and label based on the disabled state of the checkbox.

**Migration:**

Since this is a one-file change, you should be able to simply grab the diff from [this PR](https://github.com/bigcommerce/catalyst/pull/2399). The main changes to note are that we are [adding a `peer` class](https://v3.tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-sibling-state) to the CheckboxPrimitive.Root, explicitly styling the `enabled` pseudoclass, and only applying hover styles when the checkbox is enabled.

- [`604450d`](https://github.com/bigcommerce/catalyst/commit/604450d) Thanks [@bookernath](https://github.com/bookernath)! - Re-apply auth grouping approach with middleware exemption to preserve functionality of /login/token endpoint for Customer Login API

- [`82290cd`](https://github.com/bigcommerce/catalyst/commit/82290cd) Thanks [@migueloller](https://github.com/migueloller)! - Upgrade `next-intl` to v4 and add strong types for translated messages via TypeScript type augmentation.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Clean up 'en' dictionary.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove unused dependencies.

- [`6b0c85a`](https://github.com/bigcommerce/catalyst/commit/6b0c85a) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Remove unused search props, add missing search translations

**Migration**

`core/components/header/index.tsx`

Ensure the following props are passed to the `HeaderSection` navigation prop:

```tsx
        searchInputPlaceholder: t('Search.inputPlaceholder'),
        searchSubmitLabel: t('Search.submitLabel'),
```

`core/messages/en.json`

Add the following keys to the `Components.Header.Search` translations:

```json
        "somethingWentWrong": "Something went wrong. Please try again.",
        "inputPlaceholder": "Search products, categories, brands...",
        "submitLabel": "Search"
```

`core/vibes/soul/primitives/navigation/index.tsx`

Copy all changes from this file:

1. Create `searchSubmitLabel?: string;` property, ensure it is passed into `SearchForm`
2. On the `SearchForm`, remove the `searchCtaLabel = 'View more',` property, as it is unused, and rename `submitLabel` to `searchSubmitLabel`
3. Ensure that `SearchForm` passes `searchSubmitLabel` to the `SearchButton`: `<SubmitButton loading={isPending} submitLabel={searchSubmitLabel} />`
4. Remove the `searchCtaLabel` property from the `SearchResults` component

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Format totalCount value for i18n.

- [`dd42b25`](https://github.com/bigcommerce/catalyst/commit/dd42b25) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Fix the faceted search pages to account for facets with spaces or other special characters in the name.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add date field to product details form.

- [`d9685ee`](https://github.com/bigcommerce/catalyst/commit/d9685ee) Thanks [@bookernath](https://github.com/bookernath)! - Remove featured products panel from 404 page, allowing the page to be static in preparation for adding a search box

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`8baf8b3`](https://github.com/bigcommerce/catalyst/commit/8baf8b3) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Memoize `GetCartCountQuery` using React.js `cache()` so that it only hits the GraphQL API once per render, instead of twice.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add shipping selection to checkout.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`6401bb2`](https://github.com/bigcommerce/catalyst/commit/6401bb2) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update ProductListSection's and ReviewsSection's `totalCount` prop to string.

- [`43351ab`](https://github.com/bigcommerce/catalyst/commit/43351ab) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Dedupe requests in various pages by properly caching/memoizing the function per page render.

- [`b19ee74`](https://github.com/bigcommerce/catalyst/commit/b19ee74) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Updates `SelectField` to have a hidden input to pass the value of the select to the form. This is a workaround for a [Radix Select issue](https://github.com/radix-ui/primitives/issues/3198) that auto selects the first option in the select when submitting a form (even when no selection has been made).

Additionally, fixes an issue of incorrectly adding an empty query param for product options when an option is empty.

**Migration**

Migration is straighforward and requires adding the hidden input to the component and renaming the `name` prop for the `Select` component to something temporary.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`d663741`](https://github.com/bigcommerce/catalyst/commit/d663741) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Revert UI changes for product form since streaming in fields causes an issue with the form.

- [`7bc57c8`](https://github.com/bigcommerce/catalyst/commit/7bc57c8) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Set a min-height for the Navigation fallback skeleton to prevent layout shift.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`c70bff2`](https://github.com/bigcommerce/catalyst/commit/c70bff2) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Dedupe requests in "webpages" by properly caching/memoizing the fetch function per page render.

- [`5a853c2`](https://github.com/bigcommerce/catalyst/commit/5a853c2) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Check for `error.type` instead of `error.name` auth error in Login, since `error.name` gets minified in production and the check never returns `true`. Additionally, add a check for the `cause.err` to be of type `BigcommerceGQLError`.

**Migration:**

- Change `error.name === 'CallbackRouteError'` to `error.type === 'CallbackRouteError'` check in the error handling of the login action and include `error.cause.err instanceof BigCommerceGQLError`.

- [`fada842`](https://github.com/bigcommerce/catalyst/commit/fada842) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Adds the `__Secure-` prefix to the add additional broswer security policies around this cookie.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`976c74d`](https://github.com/bigcommerce/catalyst/commit/976c74d) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Fix blog post card date formatting on alternate locales

**Migration**

`core/vibes/soul/primitives/blog-post-card/index.tsx`

Update the component to use `<time dateTime={date}>{date}</time>` for the date, instead of calling `new Date(date).toLocaleDateString(...)`.

- [`9176f56`](https://github.com/bigcommerce/catalyst/commit/9176f56) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Fix possibility of duplicate `key` error in Breadcrumbs component for truncated breadcrumbs.

**Migration**

Update `core/vibes/soul/sections/breadcrumbs/index.tsx` to use `index` as the `key` property instead of `href`

- [`9827e4c`](https://github.com/bigcommerce/catalyst/commit/9827e4c) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Translate home breadcrumb in Contact Us page.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`48d5c99`](https://github.com/bigcommerce/catalyst/commit/48d5c99) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Fix public wishlist analytics/server error

- Add translation key for a Publish Wishlist empty state

**Migration**

1. Add the following imports to `core/app/[locale]/(default)/wishlist/[token]/page.tsx`:

```tsx
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { WishlistAnalyticsProvider } from '~/app/[locale]/(default)/account/wishlists/[id]/_components/wishlist-analytics-provider';
```

2. Add the following function into the file:

```tsx
const getAnalyticsData = async (token: string, searchParamsPromise: Promise<SearchParams>) => {
  const searchParamsParsed = searchParamsCache.parse(await searchParamsPromise);
  const wishlist = await getPublicWishlist(token, searchParamsParsed);

  if (!wishlist) {
    return [];
  }

  return removeEdgesAndNodes(wishlist.items)
    .map(({ product }) => product)
    .filter((product) => product !== null)
    .map((product) => {
      return {
        id: product.entityId,
        name: product.name,
        sku: product.sku,
        brand: product.brand?.name ?? '',
        price: product.prices?.price.value ?? 0,
        currency: product.prices?.price.currencyCode ?? '',
      };
    });
};
```

3. Wrap the component in the `WishlistAnalyticsProvider`:

```tsx
export default async function PublicWishlist({ params, searchParams }: Props) {
  // ...
  return (
    <WishlistAnalyticsProvider data={Streamable.from(() => getAnalyticsData(token, searchParams))}>
      // ...
    </WishlistAnalyticsProvider>
  );
}
```

4. Update `/core/messages/en.json` "PublishWishlist" to have translations:

```json
  "PublicWishlist": {
    "title": "Public Wish List",
    "defaultName": "Public wish list",
    "emptyWishlist": "This wish list doesn't have any products yet."
  },
```

5. Update `WishlistDetails` component to accept the `emptyStateText` and `placeholderCount` props:

```tsx
// ...
export const WishlistDetails = ({
  className = '',
  wishlist: streamableWishlist,
  emptyStateText,
  paginationInfo,
  headerActions,
  prevHref,
  placeholderCount,
  action,
  removeAction,
}: Props) => {
```

6. Update `WishlistDetails` component to pass the `emptyStateText` and `placeholderCount` props to both the `WishlistDetailSkeleton` and `WishlistItems` components:

```tsx
<WishlistDetailSkeleton
  className={className}
  headerActions={typeof headerActions === 'function' ? headerActions() : headerActions}
  placeholderCount={placeholderCount}
  prevHref={prevHref}
/>
```

```tsx
<WishlistItems
  action={action}
  emptyStateText={emptyStateText}
  items={items}
  placeholderCount={placeholderCount}
  removeAction={removeAction}
  wishlistId={wishlist.id}
/>
```

- [`1147a9e`](https://github.com/bigcommerce/catalyst/commit/1147a9e) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Deduplicate default image in the image gallery in PDP.

- [`47b3ad0`](https://github.com/bigcommerce/catalyst/commit/47b3ad0) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix an issue with orders with deleted products throwing an error and stopping page render by settings the errorPolicy for requests to ignore errors and update Soul components to render the products without using links for these cases.

- [`589c91a`](https://github.com/bigcommerce/catalyst/commit/589c91a) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Remove cache from a customer-specific wishlist query.

- [`aecc145`](https://github.com/bigcommerce/catalyst/commit/aecc145) Thanks [@alekseygurtovoy](https://github.com/alekseygurtovoy)! - fix: localized home page routes are rewritten to the "catch all" page

- [`3015503`](https://github.com/bigcommerce/catalyst/commit/3015503) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Fix style override issues with the latest version of the Tailwind bump. Changes should be easily rebasable.

- [`a7b369c`](https://github.com/bigcommerce/catalyst/commit/a7b369c) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fixes the error warning by having a `ProductPickList` with no images, by making the `image` prop optional for when it is not needed.

**Migration**

- Update `schema.ts` to allow optional `image` prop for `CardRadioField`
- Update `productOptionsTransformer` switch to have two cases for `ProductPickList`
  - `ProductPickList` with no image object
  - `ProductPickListWithImages` with image object
- Update ui component to make the `image` prop optional and conditionally render the image.

- [`f16a6be`](https://github.com/bigcommerce/catalyst/commit/f16a6be) Thanks [@migueloller](https://github.com/migueloller)! - Adds `Streamable.from` and uses it wherever we were unintentionally executing an async function in a React Server Component.

- [`43351ab`](https://github.com/bigcommerce/catalyst/commit/43351ab) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Pass in currency code to quick search results.

- [`17d72ca`](https://github.com/bigcommerce/catalyst/commit/17d72ca) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Add the `store_hash` `<meta />` element to better support merchants. This enabled BigCommerce to identify the store more easily.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`7071dfe`](https://github.com/bigcommerce/catalyst/commit/7071dfe) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Add locale prefix to auth middleware protected route URLPattern

**Migration**

In `core/middlewares/with-auth.ts`, update the `protectedPathPattern` variable to include an optional path segment for the locale:

```tsx
const protectedPathPattern = new URLPattern({ pathname: `{/:locale}?/(account)/*` });
```

- [`67715bf`](https://github.com/bigcommerce/catalyst/commit/67715bf) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Update GQL client and auth middleware to handle invalid tokens and invalidate session.

**Summary**

This will ensure that if a user is logged out elsewhere, they will be redirected to the /login page when they try to access a protected route.

Previously, the pages would 404 which is misleading.

**Migration**

1. Copy all changes from the `/core/client` directory and the `/packages/client` directory
2. Copy translation values
3. Copy all changes from the `/core/app/[locale]/(default)/account/` directory server actions
4. Copy all changes from the `/core/app/[locale]/(default)/checkout/route.ts` file

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`6c77e57`](https://github.com/bigcommerce/catalyst/commit/6c77e57) Thanks [@jorgemoya](https://github.com/jorgemoya)! - This refactor optimizes PDP for caching and the eventual use of dynamicIO. With these changes we leverage data caching to hit mostly cache data for guest shoppers in different locales and with different currencies.

**Key modifications include:**

- Split queries into four:
  - Page Metadata (metadata fields that only depend on locale)
  - Product (for fields that only depend on locale)
  - Streamable Product (for fields that depend on locale and variant selection)
  - Product Pricing and Related Products (for fields that require locale, variant selection, and currency -- in this case, pricing and related products)
- We don't stream in Product data, instead it's a blocking call that will redirect to `notFound` when product is not found.
- Our query functions now take in all params required for fetching, instead of accessing dynamic variables internally. This is important to serialize arguments if we want to eventually `use cache`.
- Use `Streamable.from` to generate our streaming props that are passed to our UI components.
- Update UI components to allow streaming product options before streaming in buy button.

**Migration instructions:**

- Update `/product/[slug]/page.tsx`
  - For this page we are now doing a blocking request that is simplified for metadata and as a base product. Instead of having functions that each would read from props, we share streamable functions that can be passed to our UI components.
- Update `/product/[slug]/page-data.tsx`
  - Expect our requests to be simplified/merged, essentially replacing what we had before for new requests and functions.
- Update`/product/[slug]/_components`.
  - Similar to `page.tsx` and `page.data`, expect changes in the fragments defined and how we pass streamable functions to UI components.
- Update `/vibes/soul/product-detail/index.tsx` & `/vibes/soul/product-detail/product-detail-form.tsx`
  - Minor changes to allow streaming in data.

- [`8a25424`](https://github.com/bigcommerce/catalyst/commit/8a25424) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Refactors the sign in functionality to use two separate providers instead of one. This is some work needed to be done in order to provide a better API for session syncing so it shouldn't effect any existing functionality.

- [`e968366`](https://github.com/bigcommerce/catalyst/commit/e968366) Thanks [@alekseygurtovoy](https://github.com/alekseygurtovoy)! - fix: `useCompareDrawer` does not throw on missing context

- [`a19b3ba`](https://github.com/bigcommerce/catalyst/commit/a19b3ba) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Fix persistent cart behavior during login.

**Migration**

In `core/auth/index.ts`, create the `cartIdSchema` variable:

```ts
const cartIdSchema = z
  .string()
  .uuid()
  .or(z.literal('undefined')) // auth.js seems to pass the cart id as a string literal 'undefined' when not set.
  .optional()
  .transform((val) => (val === 'undefined' ? undefined : val));
```

Then, update all `Credentials` schemas to use this new `cartIdSchema`:

```ts
const PasswordCredentials = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  cartId: cartIdSchema,
});

const AnonymousCredentials = z.object({
  cartId: cartIdSchema,
});

const JwtCredentials = z.object({
  jwt: z.string(),
  cartId: cartIdSchema,
});

const SessionUpdate = z.object({
  user: z.object({
    cartId: cartIdSchema,
  }),
});
```

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add discounts summary item to Cart.

- [`2de3c51`](https://github.com/bigcommerce/catalyst/commit/2de3c51) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fixes an issue with the checkbox not properly triggering the required validation.
- Fixes an issue with the checkbox not setting the default value from the API.
- Fixes an issue with the field value being incorrectly set as `undefined`

**Migration**

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

- [`c5ce9dc`](https://github.com/bigcommerce/catalyst/commit/c5ce9dc) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Properly handle the auth error when login is invalid.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`2a7b05f`](https://github.com/bigcommerce/catalyst/commit/2a7b05f) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Add translations for 'Search' button on 404 page

**Migration**

1. Add `"search"` translation key in the `"NotFound"` translations
2. In `core/vibes/soul/sections/not-found/index.tsx`, add a `ctaLabel` property and ensure it is used in place of the "Search" text
3. In `core/app/[locale]/not-found.tsx`, pass the `ctaLabel` prop as the new translation key `ctaLabel={t('search')}`

- [`c095663`](https://github.com/bigcommerce/catalyst/commit/c095663) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Moves some auth related route handlers under the (auth) route group. This is to cleanup some of the routing.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add result type to all `generateMetadata`.

- [`a15d84c`](https://github.com/bigcommerce/catalyst/commit/a15d84c) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Renames `core/app/[locale]/(default)/product/[slug]/_components/product-analytics-provider/index.tsx` to `core/app/[locale]/(default)/product/[slug]/_components/product-analytics-provider.tsx` for consistency with the other analytics components.

**Migration**

To migrate, rename the file with git:

```bash
git mv core/app/[locale]/(default)/product/[slug]/_components/product-analytics-provider/index.tsx core/app/[locale]/(default)/product/[slug]/_components/product-analytics-provider.tsx
```

- [`5e5314b`](https://github.com/bigcommerce/catalyst/commit/5e5314b) Thanks [@jorgemoya](https://github.com/jorgemoya)! - We want state to be persitent on the `ProductDetailForm`, even after submit. This change will allow the API error messages to properly show when the form is submitted. Additionally, other form fields will retain state (like item quantity).

**Migration**

- Update `ProductDetailForm` to prevent reset on submit, by removing `requestFormReset` in the `onSubmit`.
- Remove `router.refresh()` call and instead call new `revalidateCart` action.
  - `revalidateCart` is an action that `revalidateTag(TAGS.cart)`
  - This prevents the form from fully refreshing on success.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`8c4f374`](https://github.com/bigcommerce/catalyst/commit/8c4f374) Thanks [@jordanarldt](https://github.com/jordanarldt)! - - Redirect to `/account/wishlists/` when a wishlist ID is not found
- Pass `actionsTitle` to WishlistActionsMenu on WishlistDetails page

**Migration**

1. Copy changes from `/core/app/[locale]/(default)/account/wishlists/[id]/_components/wishlist-actions.tsx` - Ensure that `actionsTitle` is an allowed property and that it is passed into the `WishlistActionsMenu` component
2. Copy changes from `/core/app/[locale]/(default)/account/wishlists/[id]/page.tsx` - Redirect to `/account/wishlists/` on 404
3. Ensure that the `removeButtonTitle` prop is passed down all the way to the `RemoveWishlistItemButton` component in the `WishlistItemCard` component

- [`45bbd92`](https://github.com/bigcommerce/catalyst/commit/45bbd92) Thanks [@jordanarldt](https://github.com/jordanarldt)! - - Update the account pages to match the style of VIBES and remain consistent with the rest of Catalyst.
- Updated OrderDetails line items styling to display cost of each item and the selected `productOptions`
- Created OrderDetails skeletons
- Updated /account/orders/[id] to use `Streamable`

**Migration**

1. Copy all changes in the `/core/vibes/soul` directory
2. Copy all changes in the `/core/app/[locale]/(default)/account` directory

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add coupon code form to Cart page.

- [`e8c693a`](https://github.com/bigcommerce/catalyst/commit/e8c693a) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Add toast message when changing password

**Migration**

`core/vibes/soul/sections/account-settings/change-password-form.tsx`

1. Import `toast`:

```ts
import { toast } from '@/vibes/soul/primitives/toaster';
```

2. Update the `ChangePasswordAction` types:

```ts
type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: string;
}

export type ChangePasswordAction = Action<State, FormData>;
```

3. Update the `useActionState` hook:

```ts
const [state, formAction] = useActionState(action, { lastResult: null });
```

4. Update the `useEffect` hook to display a toast message on success:

```ts
useEffect(() => {
  if (state.lastResult?.status === 'success' && state.successMessage != null) {
    toast.success(state.successMessage);
  }

  if (state.lastResult?.error) {
    // eslint-disable-next-line no-console
    console.log(state.lastResult.error);
  }
}, [state]);
```

`core/app/[locale]/(default)/account/settings/_actions/change-password.ts`

Update all of the `return` values to match the new `ChangePasswordAction` interface, and return the `passwordUpdated` message on success.

```ts
export const changePassword: ChangePasswordAction = async (prevState, formData) => {
  const t = await getTranslations('Account.Settings');
  const customerAccessToken = await getSessionCustomerAccessToken();

  const submission = parseWithZod(formData, { schema: changePasswordSchema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  const input = {
    currentPassword: submission.value.currentPassword,
    newPassword: submission.value.password,
  };

  try {
    const response = await client.fetch({
      document: CustomerChangePasswordMutation,
      variables: {
        input,
      },
      customerAccessToken,
    });

    const result = response.data.customer.changePassword;

    if (result.errors.length > 0) {
      return {
        lastResult: submission.reply({ formErrors: result.errors.map((error) => error.message) }),
      };
    }

    return {
      lastResult: submission.reply(),
      successMessage: t('passwordUpdated'),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => message),
        }),
      };
    }

    if (error instanceof Error) {
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
      };
    }

    return { lastResult: submission.reply({ formErrors: [t('somethingWentWrong')] }) };
  }
};
```

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Disable prefetch for the `/logout` link.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add textarea field to product details form.

- [`525afdb`](https://github.com/bigcommerce/catalyst/commit/525afdb) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update empty state for account pages, adjusting headers and empty designs.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Set currency on cart at creation time

- [`e145673`](https://github.com/bigcommerce/catalyst/commit/e145673) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Allow a list of CDN hostnames for cases when there can be more than one CDN available for image loader.

**Migration:**

- Update `build-config` schema to make `cdnUrls` an array of strings.
- Update `next.config.ts` to set `cdnUrls` as an array, and set multiple preconnected Link headers (one per CDN).
- `shouldUseLoaderProp` function now reads from array.

- [`6b99400`](https://github.com/bigcommerce/catalyst/commit/6b99400) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Split coupon discounts and regular discounts from summary items, use total `cart.discountedAmount` for discounts.

- [`0900330`](https://github.com/bigcommerce/catalyst/commit/0900330) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Refactors redirecting to checkout as a route. This will enable session syncing to happen through a redirect using the sites and routes API.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`7668774`](https://github.com/bigcommerce/catalyst/commit/7668774) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Disable PPR in Compare page due to an issue of Next.js and PPR, which causes the products to be removed once one is added to cart. More info: https://github.com/vercel/next.js/issues/59407.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`e8a9ebf`](https://github.com/bigcommerce/catalyst/commit/e8a9ebf) Thanks [@bookernath](https://github.com/bookernath)! - Revert auth route reorganization to fix regression with /login/token endpoint

- [`84d416a`](https://github.com/bigcommerce/catalyst/commit/84d416a) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Soft fail analytics events if the provider is not rendered

- [`6aef70b`](https://github.com/bigcommerce/catalyst/commit/6aef70b) Thanks [@chancellorclark](https://github.com/chancellorclark)! - Refactors the add to cart logic to handle some shared functionality like revalidating the tags and setting the cart state.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Use `setRequestLocale` only where needed

- [`96f7c8e`](https://github.com/bigcommerce/catalyst/commit/96f7c8e) Thanks [@jordanarldt](https://github.com/jordanarldt)! - - Fix incorrect/missing translation messages
- Separate defaultLocale in to a separate file
- Remove caching in `/account` pages
- Update `WishlistListItem` for better accessibility

**Migration**

Use this PR as a reference: https://github.com/bigcommerce/catalyst/pull/2341

1. Update your `messages/en.json` file with the translation keys added in this PR
2. Ensure that all components are being passed the correct translation keys
3. Update all references to `defaultLocale` to point to the `~/i18n/locales` file created in this PR
4. Update all pages in `/core/app/[locale]/(default)/account/` and ensure that `cache: 'no-store'` is set on the `client.fetch` calls
5. Update the `WishlistListItem` component to use the new accessibility features/tags as shown in the PR

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`5b83a97`](https://github.com/bigcommerce/catalyst/commit/5b83a97) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Pass search params to router.redirect when swapping locales.

**Migration**

Modify `useSwitchLocale` hook to include `Object.fromEntries(searchParams.entries())`.

- [`edda0e3`](https://github.com/bigcommerce/catalyst/commit/edda0e3) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add missing border style for `Input`, `NumberInput` and `DatePicker`.

**Migration**

Following convention, add these conditional classes to the fields using `clsx`:

```
{
light:
    errors && errors.length > 0
    ? 'border-[var(--input-light-border-error,hsl(var(--error)))]'
    : 'border-[var(--input-light-border,hsl(var(--contrast-100)))]',
dark:
    errors && errors.length > 0
    ? 'border-[var(--input-dark-border-error,hsl(var(--error)))]'
    : 'border-[var(--input-dark-border,hsl(var(--contrast-500)))]',
}[colorScheme],
```

- [`aade48a`](https://github.com/bigcommerce/catalyst/commit/aade48a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove explicit locale override in Link component that was appending default locale to links even with the 'as-needed' mode.

- [`11ecddf`](https://github.com/bigcommerce/catalyst/commit/11ecddf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update translations.

- [`157ea54`](https://github.com/bigcommerce/catalyst/commit/157ea54) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Rename some GQL query/mutations/fragments to standardized naming.

- [`c4e56c6`](https://github.com/bigcommerce/catalyst/commit/c4e56c6) Thanks [@alekseygurtovoy](https://github.com/alekseygurtovoy)! - fix: switching locales redirects user to the home page

- [`d9edb44`](https://github.com/bigcommerce/catalyst/commit/d9edb44) Thanks [@bookernath](https://github.com/bookernath)! - Remove unused variants collection from query for PDP

- [`816290a`](https://github.com/bigcommerce/catalyst/commit/816290a) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Add aria-label to currency selector and PDP wishlist buttons

**Migration**

1. Copy all changes from the `/messages/en.json` file to get updated translation keys
2. Add the `label` prop to the `Heart` component in `/core/vibes/soul/primitives/favorite/heart.tsx`
3. Add the `label` prop to the `Favorite` component in `/core/vibes/soul/primitives/favorite/index.tsx` and pass it to the `Heart` component
4. Copy all changes in the `/core/vibes/soul/navigation/index.tsx` file to add the `switchCurrencyLabel` property
5. Update `/core/components/header/index.tsx` file to pass the `switchCurrencyLabel` to the `HeaderSection` component
6. Update `/core/app/[locale]/(default)/product/[slug]/_components/wishlist-button/index.tsx` to pass the `label` prop to the `Favorite` component

## 0.24.1

### Patch Changes

- [`632a645`](https://github.com/bigcommerce/catalyst/commit/632a645850c500be9ea478490e1df4b98d9b3543) Thanks [@bookernath](https://github.com/bookernath)! - Add stub for generating Customer Login API tokens for SSO integrations

- [`632a645`](https://github.com/bigcommerce/catalyst/commit/632a645850c500be9ea478490e1df4b98d9b3543) Thanks [@bookernath](https://github.com/bookernath)! - Add /login/token endpoint to power Customer Login API

- [#1816](https://github.com/bigcommerce/catalyst/pull/1816) [`6eb30ac`](https://github.com/bigcommerce/catalyst/commit/6eb30ac1745e2dcc37aef892fb001f218d9b8ddb) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

## 0.24.0

### Minor Changes

- [#1749](https://github.com/bigcommerce/catalyst/pull/1749) [`cacdd22`](https://github.com/bigcommerce/catalyst/commit/cacdd22de140897f57fb8aaf52b2a9e7f48c23c4) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Change the rest of the auth pages to use toasts.

- [#1746](https://github.com/bigcommerce/catalyst/pull/1746) [`0e34915`](https://github.com/bigcommerce/catalyst/commit/0e34915171da18ed141ecfacc6fa4c2a8f5e4c23) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Converts the change password messages over to using a toast. This should provide a better DX and UX.

- [#1747](https://github.com/bigcommerce/catalyst/pull/1747) [`608b886`](https://github.com/bigcommerce/catalyst/commit/608b886978518f3d27230f50a2ad462363527d63) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Update the register customer page to use toasts for messaging.

- [#1749](https://github.com/bigcommerce/catalyst/pull/1749) [`cacdd22`](https://github.com/bigcommerce/catalyst/commit/cacdd22de140897f57fb8aaf52b2a9e7f48c23c4) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Converts the reset password messages over to using a toast.

- [#1749](https://github.com/bigcommerce/catalyst/pull/1749) [`cacdd22`](https://github.com/bigcommerce/catalyst/commit/cacdd22de140897f57fb8aaf52b2a9e7f48c23c4) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Remove the account state provider components

- [#1749](https://github.com/bigcommerce/catalyst/pull/1749) [`cacdd22`](https://github.com/bigcommerce/catalyst/commit/cacdd22de140897f57fb8aaf52b2a9e7f48c23c4) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Converts the login messages over to using a toast.

- [#1743](https://github.com/bigcommerce/catalyst/pull/1743) [`7c03428`](https://github.com/bigcommerce/catalyst/commit/7c03428bf815bf2cc7b8aa35ff331379f7615094) Thanks [@chanceaclark](https://github.com/chanceaclark)! - After login, redirect to orders page instead of an account overview page. This also removes the account overview page.

- [#1741](https://github.com/bigcommerce/catalyst/pull/1741) [`5136fac`](https://github.com/bigcommerce/catalyst/commit/5136fac6e05c6eb1ebce9707abcf1f180712358e) Thanks [@chanceaclark](https://github.com/chanceaclark)! - If a customer is already logged in, we want to redirect them back to their account pages if they are trying to hit one of the non-logged-in customer auth routes. The prevents any side effects that may occur trying to re-auth the client. This is done by providing a root layout.tsx page under the (auth) route group.

- [#1749](https://github.com/bigcommerce/catalyst/pull/1749) [`cacdd22`](https://github.com/bigcommerce/catalyst/commit/cacdd22de140897f57fb8aaf52b2a9e7f48c23c4) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Converts the change/forgot password messages over to using a toast.

### Patch Changes

- [#1765](https://github.com/bigcommerce/catalyst/pull/1765) [`1c9b880`](https://github.com/bigcommerce/catalyst/commit/1c9b8804cec99f5fd9700b422a3fb9739a850045) Thanks [@bookernath](https://github.com/bookernath)! - Assign cart to customer as part of initial login mutation

- [#1760](https://github.com/bigcommerce/catalyst/pull/1760) [`f6161c5`](https://github.com/bigcommerce/catalyst/commit/f6161c5dcf2fbd65f4192eec36ebd3e62e60bd33) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

## 0.23.0

### Minor Changes

- [#1639](https://github.com/bigcommerce/catalyst/pull/1639) [`ae2c6cd`](https://github.com/bigcommerce/catalyst/commit/ae2c6cd76b2ccc5c994bd298983cb1665c571d02) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add orders for customer account. Now customer can open orders history or move to specific order details.

- [#1729](https://github.com/bigcommerce/catalyst/pull/1729) [`d52affe`](https://github.com/bigcommerce/catalyst/commit/d52affe56dee23a81263392030fe635c824fb182) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Removed ReCaptcha validation when you are logged in and making account changes. We have already validated a customer is human at the loggin screen.

- [#1728](https://github.com/bigcommerce/catalyst/pull/1728) [`d7dbd7a`](https://github.com/bigcommerce/catalyst/commit/d7dbd7a04fc8cb87cf223fb5a17af8d59c6431ea) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Convert the messages that were displayed when deleting an address over to using the toast functionality.

### Patch Changes

- [#1727](https://github.com/bigcommerce/catalyst/pull/1727) [`d3c6dbc`](https://github.com/bigcommerce/catalyst/commit/d3c6dbc25c16901f694e053ccdee8193647f5760) Thanks [@migueloller](https://github.com/migueloller)! - Ignore empty strings when parsing array URL search parameters in faceted search.

- [#1730](https://github.com/bigcommerce/catalyst/pull/1730) [`ad8c86d`](https://github.com/bigcommerce/catalyst/commit/ad8c86d574474eb5ed18d99265fe4001d267fb5f) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Fixes the inventory handling to handle some options being out of stock.

## 0.22.1

### Patch Changes

- [#1649](https://github.com/bigcommerce/catalyst/pull/1649) [`d38f164`](https://github.com/bigcommerce/catalyst/commit/d38f164d3e87ca87d3e792f8058a74c1f13e4220) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - improve account forms submit errors message

- [#1651](https://github.com/bigcommerce/catalyst/pull/1651) [`1a222cb`](https://github.com/bigcommerce/catalyst/commit/1a222cb09dfc65b440090f868b01291e644bec4a) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - refresh the entire list of addresses after deleting an address

- [#1722](https://github.com/bigcommerce/catalyst/pull/1722) [`1f0c2ef`](https://github.com/bigcommerce/catalyst/commit/1f0c2ef9212be079630f64a15a2f121ed7a358f9) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Remove `--turbo` from `pnpm dev` as it has some issues with the latest dependency bump, along with others.

## 0.22.0

### Minor Changes

- [#1717](https://github.com/bigcommerce/catalyst/pull/1717) [`12fea79`](https://github.com/bigcommerce/catalyst/commit/12fea7962c25c395b550717343300561fb8d6a4c) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Add a check for variant stock levels on add to cart button

- [#1674](https://github.com/bigcommerce/catalyst/pull/1674) [`512c338`](https://github.com/bigcommerce/catalyst/commit/512c338e4abcb3cdb7f457e4012e0c90c6a8391a) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Uses the API responses to show better errors when adding a product to the cart.

- [#1710](https://github.com/bigcommerce/catalyst/pull/1710) [`15edf31`](https://github.com/bigcommerce/catalyst/commit/15edf311f5508a85f09acd8135fbf2b4aae09ff0) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Rename `BcImage` to `Image`

- [#1703](https://github.com/bigcommerce/catalyst/pull/1703) [`7b598ff`](https://github.com/bigcommerce/catalyst/commit/7b598ff012ce40fe4b34be780c01cdbbe61e9b7e) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Adds localized data fetching withing the beforeRequest client helper. If information is translated (currently possible to update via the Admin GraphQL API) then we will return the translated product data. See https://developer.bigcommerce.com/docs/store-operations/catalog/graphql-admin/product-basic-info for more information on how to use overrides.

- [#1710](https://github.com/bigcommerce/catalyst/pull/1710) [`15edf31`](https://github.com/bigcommerce/catalyst/commit/15edf311f5508a85f09acd8135fbf2b4aae09ff0) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Force usage of the `<Image/>` component. This component should fallback to using the default image loader if the url doesn't come from the BigCommerce CDN.

- [#1672](https://github.com/bigcommerce/catalyst/pull/1672) [`ffefc61`](https://github.com/bigcommerce/catalyst/commit/ffefc6151b0fb09bf83e7556736452a3138ef9c4) Thanks [@chanceaclark](https://github.com/chanceaclark)! - If a string is not provided in the selected locale, the translation system will fallback to "en" for that specific entry.

### Patch Changes

- [#1661](https://github.com/bigcommerce/catalyst/pull/1661) [`93d9984`](https://github.com/bigcommerce/catalyst/commit/93d99844ed4957a5a4611970589a2246b1dffb16) Thanks [@bookernath](https://github.com/bookernath)! - Remove webpack chunk plugin

- [#1688](https://github.com/bigcommerce/catalyst/pull/1688) [`3267840`](https://github.com/bigcommerce/catalyst/commit/3267840981ebb6ed62e0b87f60623d0c4352309d) Thanks [@thebigrick](https://github.com/thebigrick)! - Added aria label for compare button

- [#1617](https://github.com/bigcommerce/catalyst/pull/1617) [`c852961`](https://github.com/bigcommerce/catalyst/commit/c852961063fb090907b23074301fcbc41e75b8ec) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - UX improvements for account pages

- [#1690](https://github.com/bigcommerce/catalyst/pull/1690) [`ee6bbb9`](https://github.com/bigcommerce/catalyst/commit/ee6bbb96e9c357af249fb881f5de503f9e164fb1) Thanks [@thebigrick](https://github.com/thebigrick)! - Added localization to hardcoded strings

- [#1647](https://github.com/bigcommerce/catalyst/pull/1647) [`ad5ed3f`](https://github.com/bigcommerce/catalyst/commit/ad5ed3f50f6d3025bf299cc04f51bf0864afd3a2) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - update submit create account errors message

- [#1715](https://github.com/bigcommerce/catalyst/pull/1715) [`2960a70`](https://github.com/bigcommerce/catalyst/commit/2960a708084030b484de945e725b5bd0c32462ee) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#1694](https://github.com/bigcommerce/catalyst/pull/1694) [`07f8463`](https://github.com/bigcommerce/catalyst/commit/07f84634000c4d1dac6f89037d9501bc056537c9) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

## 0.21.0

### Minor Changes

- [#1631](https://github.com/bigcommerce/catalyst/pull/1631) [`58d9e7c`](https://github.com/bigcommerce/catalyst/commit/58d9e7ccb7915593cd012cce6d9f4bdf66cb381f) Thanks [@deini](https://github.com/deini)! - fetch available locales at build time

### Patch Changes

- [#1636](https://github.com/bigcommerce/catalyst/pull/1636) [`23abacf`](https://github.com/bigcommerce/catalyst/commit/23abacfb8ff4ff9d269e51821a6a992a9cb2d4f5) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Remove console.error when falling back to defaultChannelId

- [#1636](https://github.com/bigcommerce/catalyst/pull/1636) [`23abacf`](https://github.com/bigcommerce/catalyst/commit/23abacfb8ff4ff9d269e51821a6a992a9cb2d4f5) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Clean up login error handling.

- Updated dependencies [[`23abacf`](https://github.com/bigcommerce/catalyst/commit/23abacfb8ff4ff9d269e51821a6a992a9cb2d4f5)]:
  - @bigcommerce/catalyst-client@0.14.0

## 0.20.0

### Minor Changes

- [#1623](https://github.com/bigcommerce/catalyst/pull/1623) [`16e3a76`](https://github.com/bigcommerce/catalyst/commit/16e3a763571324dccd9031a79e400409eff9ee0c) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Next 15 upgrade

### Patch Changes

- [#1629](https://github.com/bigcommerce/catalyst/pull/1629) [`72a30a8`](https://github.com/bigcommerce/catalyst/commit/72a30a84193f7ed8a09b770d16dd2c9a8a7d1347) Thanks [@deini](https://github.com/deini)! - Use Typescript on Next Config

- [#1618](https://github.com/bigcommerce/catalyst/pull/1618) [`d60e916`](https://github.com/bigcommerce/catalyst/commit/d60e916661385fab211f7e8b1342dbda2fd504b9) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- Updated dependencies [[`16e3a76`](https://github.com/bigcommerce/catalyst/commit/16e3a763571324dccd9031a79e400409eff9ee0c)]:
  - @bigcommerce/catalyst-client@0.13.0

## 0.19.0

### Minor Changes

- [#1262](https://github.com/bigcommerce/catalyst/pull/1262) [`0c2023b`](https://github.com/bigcommerce/catalyst/commit/0c2023bae650039cd79ba51b1161b5c8c16f0b8d) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Removes all usages of the customer impersonation token. Also updates the docs to correspond with the Storefront API Token.

- [#1262](https://github.com/bigcommerce/catalyst/pull/1262) [`0c2023b`](https://github.com/bigcommerce/catalyst/commit/0c2023bae650039cd79ba51b1161b5c8c16f0b8d) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Allows the ability to consume a [storefront token](https://developer.bigcommerce.com/docs/rest-authentication/tokens#storefront-tokens). This new token will allow Catalyst to create `customerAccessToken`'s whenever a user logs into their account. This change doesn't include consuming the either token, only adding the ability to pass it in.

### Patch Changes

- Updated dependencies [[`0c2023b`](https://github.com/bigcommerce/catalyst/commit/0c2023bae650039cd79ba51b1161b5c8c16f0b8d), [`0c2023b`](https://github.com/bigcommerce/catalyst/commit/0c2023bae650039cd79ba51b1161b5c8c16f0b8d)]:
  - @bigcommerce/catalyst-client@0.12.0

## 0.18.1

### Patch Changes

- [#1525](https://github.com/bigcommerce/catalyst/pull/1525) [`e751319`](https://github.com/bigcommerce/catalyst/commit/e751319728359a2e72d48072a4b68055ed4dbb1e) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - fix warning for using the same keys on items

- [#1521](https://github.com/bigcommerce/catalyst/pull/1521) [`fd83a78`](https://github.com/bigcommerce/catalyst/commit/fd83a78f94b170dcf6e8aed14c61e3791b64c5de) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - fix styles for active account tab

- [#1520](https://github.com/bigcommerce/catalyst/pull/1520) [`c898792`](https://github.com/bigcommerce/catalyst/commit/c898792a0ed3ee9849cdfeda7018245e491e8016) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - improve error message on reset password page

- [#1524](https://github.com/bigcommerce/catalyst/pull/1524) [`f08883c`](https://github.com/bigcommerce/catalyst/commit/f08883c8fa559f0b6015321e2396606d77fa0ad6) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - improve behaviour for change password page for logged in user

- [#1529](https://github.com/bigcommerce/catalyst/pull/1529) [`22426b2`](https://github.com/bigcommerce/catalyst/commit/22426b256e29b6c3dd145fd6df9ed57c5a99bd75) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - fix validation message for email on account settings page

- [#1516](https://github.com/bigcommerce/catalyst/pull/1516) [`41270c2`](https://github.com/bigcommerce/catalyst/commit/41270c29a6e21217622c29b18e91f9a24d58ea8b) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#1534](https://github.com/bigcommerce/catalyst/pull/1534) [`de48618`](https://github.com/bigcommerce/catalyst/commit/de486186acfec2604d749b9f6d2b4656a9e9280a) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

## 0.18.0

### Minor Changes

- [#1491](https://github.com/bigcommerce/catalyst/pull/1491) [`313a591`](https://github.com/bigcommerce/catalyst/commit/313a5913181a144b53cb12208132f4a9924e2256) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Bump `next-intl` which includes [some minor changes and updated APIs](<(https://next-intl-docs.vercel.app/blog/next-intl-3-22)>):
  - Use new `createNavigation` api.
  - Pass `locale` to redirects.
  - `setRequestLocale` is no longer unstable.

### Patch Changes

- [#1505](https://github.com/bigcommerce/catalyst/pull/1505) [`691ec2b`](https://github.com/bigcommerce/catalyst/commit/691ec2bcbb8839446463e292856080cc9b16c584) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - update login page & error message styles

- [#1506](https://github.com/bigcommerce/catalyst/pull/1506) [`ac83d3e`](https://github.com/bigcommerce/catalyst/commit/ac83d3eb98e19307a3a82fa94c222cff3c0806f0) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - remove unnecessary fields from account settings form and update confirmation message

- [#1499](https://github.com/bigcommerce/catalyst/pull/1499) [`b5aea9b`](https://github.com/bigcommerce/catalyst/commit/b5aea9b36159d11a77d090fee62cb1736bc794be) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Bumps next-intl to fix issue with hashes and query params in urls.

- [#1511](https://github.com/bigcommerce/catalyst/pull/1511) [`370d0b1`](https://github.com/bigcommerce/catalyst/commit/370d0b18f0f47100d7e520fcf9f209f6e41f34e9) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - update styles for reset password validation

- [#1454](https://github.com/bigcommerce/catalyst/pull/1454) [`53599e6`](https://github.com/bigcommerce/catalyst/commit/53599e6e02988ab63d158c5c9f587669a5581402) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - remove unnecessary fields from create account form

- [#1487](https://github.com/bigcommerce/catalyst/pull/1487) [`a22233f`](https://github.com/bigcommerce/catalyst/commit/a22233f8fc94c5ad602fa734cadbb892af34fe6b) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

## 0.17.1

### Patch Changes

- Updated dependencies [[`d4120d3`](https://github.com/bigcommerce/catalyst/commit/d4120d39c10398e842a7ebe14ada685ec8aae3a8)]:
  - @bigcommerce/catalyst-client@0.11.0

## 0.17.0

### Minor Changes

- [#1401](https://github.com/bigcommerce/catalyst/pull/1401) [`3095002`](https://github.com/bigcommerce/catalyst/commit/3095002d7a10b9c4058016076deb7a45fc8ae7bb) Thanks [@bookernath](https://github.com/bookernath)! - Add dynamic robots.txt from control panel settings

### Patch Changes

- [#1477](https://github.com/bigcommerce/catalyst/pull/1477) [`79e705f`](https://github.com/bigcommerce/catalyst/commit/79e705f151a733a811effed40757030aba6b6300) Thanks [@deini](https://github.com/deini)! - Breadcrumbs for top level category pages are no longer rendered

- [#1467](https://github.com/bigcommerce/catalyst/pull/1467) [`e763a83`](https://github.com/bigcommerce/catalyst/commit/e763a83bcd4b8b5311586247291338eb65fbc476) Thanks [@deini](https://github.com/deini)! - Fixes an issue when a numeric product option set to a minimum <= 0 breaks the counter component.

- [#1459](https://github.com/bigcommerce/catalyst/pull/1459) [`b4485c7`](https://github.com/bigcommerce/catalyst/commit/b4485c76de8c83546c68a7b50fcb7991603dbf6e) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Updates the with-routes middleware to fallback on locale based rewrite logic if the redirect is a dynamic entity redirect.

- [#1469](https://github.com/bigcommerce/catalyst/pull/1469) [`8e9e7f3`](https://github.com/bigcommerce/catalyst/commit/8e9e7f3d40545004b080146b4dbb42f4ac7cf17c) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Fixes the product quantity reseting back to the previous value when adjusting the quantity fails.

- [#1476](https://github.com/bigcommerce/catalyst/pull/1476) [`d47e3ac`](https://github.com/bigcommerce/catalyst/commit/d47e3aceb244713bc996287319357e6af3d865ed) Thanks [@deini](https://github.com/deini)! - adds an empty state to category pages

- [#1458](https://github.com/bigcommerce/catalyst/pull/1458) [`3d67f8d`](https://github.com/bigcommerce/catalyst/commit/3d67f8d0d1776d747e9aa485b0b29a738eeacf3c) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Add no-store to mutations that are rate limited.

- [#1453](https://github.com/bigcommerce/catalyst/pull/1453) [`1c8b042`](https://github.com/bigcommerce/catalyst/commit/1c8b04278074eb55358a5515f330a011de9561b5) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- Updated dependencies [[`2d1526a`](https://github.com/bigcommerce/catalyst/commit/2d1526a50402b2eb677abd55f19fb904234d1a84)]:
  - @bigcommerce/catalyst-client@0.10.0

## 0.16.0

### Minor Changes

- [#1410](https://github.com/bigcommerce/catalyst/pull/1410) [`53cca82`](https://github.com/bigcommerce/catalyst/commit/53cca82611272fc3be24505b7c6d5866f10c87fd) Thanks [@bookernath](https://github.com/bookernath)! - Move /reset page to /login/forgot-password in order to reduce top-level routes.

- [#1384](https://github.com/bigcommerce/catalyst/pull/1384) [`17692ca`](https://github.com/bigcommerce/catalyst/commit/17692caa3ff9b25180359d8a020470ece3e589f6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Pass customer ip address into requests that don't rely on cached values.

- [#1388](https://github.com/bigcommerce/catalyst/pull/1388) [`a309a4d`](https://github.com/bigcommerce/catalyst/commit/a309a4dd47083a58c998a4f6d169185177cca571) Thanks [@deini](https://github.com/deini)! - wraps header and footer in suspense boundaries

### Patch Changes

- [#1374](https://github.com/bigcommerce/catalyst/pull/1374) [`1f76f61`](https://github.com/bigcommerce/catalyst/commit/1f76f615b38bb41db770653bd8e7947cd6361b18) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Prepend locale for redirected urls in tests.
  More info: https://github.com/amannn/next-intl/issues/1335

- [#1373](https://github.com/bigcommerce/catalyst/pull/1373) [`971033f`](https://github.com/bigcommerce/catalyst/commit/971033fc63181bad15aa46abb65b0d44501922c9) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add missing metadata in account settings page.

- [#1370](https://github.com/bigcommerce/catalyst/pull/1370) [`655d518`](https://github.com/bigcommerce/catalyst/commit/655d518b2fd662614539467fff940b2b5ff78567) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#1446](https://github.com/bigcommerce/catalyst/pull/1446) [`ba4820b`](https://github.com/bigcommerce/catalyst/commit/ba4820bf6dd36d0155028ad3db094bd9745d5d94) Thanks [@deini](https://github.com/deini)! - Fixes a bug where product variant was not reliably being selected on PDP when using pre-selected options.

- [#1391](https://github.com/bigcommerce/catalyst/pull/1391) [`4d64c31`](https://github.com/bigcommerce/catalyst/commit/4d64c31d4765dd72c81c1836b66aa1d7cb34b5f5) Thanks [@bookernath](https://github.com/bookernath)! - Get lossy image from API instead of setting param in code

- [#1389](https://github.com/bigcommerce/catalyst/pull/1389) [`a4eaff6`](https://github.com/bigcommerce/catalyst/commit/a4eaff6bb2520f748630e24a6a28ca31cd2eb2c3) Thanks [@bookernath](https://github.com/bookernath)! - Add additional IP address header

- [#1402](https://github.com/bigcommerce/catalyst/pull/1402) [`6e75ef5`](https://github.com/bigcommerce/catalyst/commit/6e75ef5097e0f3227c04ac0d9d7bbc484513bcce) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - fixing the problem with submitting the password change form

- [#1407](https://github.com/bigcommerce/catalyst/pull/1407) [`ac9832f`](https://github.com/bigcommerce/catalyst/commit/ac9832fcc61f01413a5b8f101f5f27c53ca1fce5) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#1392](https://github.com/bigcommerce/catalyst/pull/1392) [`76227ac`](https://github.com/bigcommerce/catalyst/commit/76227ac06bb349f604f1d2d4a9b68e7d0869eba4) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#1424](https://github.com/bigcommerce/catalyst/pull/1424) [`4874add`](https://github.com/bigcommerce/catalyst/commit/4874addfbdde90ac45aa57c10767587ba4c50735) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#1445](https://github.com/bigcommerce/catalyst/pull/1445) [`ba3f513`](https://github.com/bigcommerce/catalyst/commit/ba3f513ac4242ce6883ad6ab635d38156a271ca9) Thanks [@deini](https://github.com/deini)! - Adds optimistic updates to all "Add to cart" buttons. This change makes the UI feel snappier and give quick feedback on user interaction.

- Updated dependencies [[`17692ca`](https://github.com/bigcommerce/catalyst/commit/17692caa3ff9b25180359d8a020470ece3e589f6)]:
  - @bigcommerce/catalyst-client@0.9.0

## 0.15.0

### Minor Changes

- [#1362](https://github.com/bigcommerce/catalyst/pull/1362) [`0814afe`](https://github.com/bigcommerce/catalyst/commit/0814afefca00b2497dddb0622df45f4d50865882) Thanks [@deini](https://github.com/deini)! - If app is not running on Vercel's infra, `<Analytics />` and `<SpeedInsights />` are not rendered.

  Opt-out of vercel analytics and speed insights by setting the following env vars to `true`
  - `DISABLE_VERCEL_ANALYTICS`
  - `DISABLE_VERCEL_SPEED_INSIGHTS`

- [#1354](https://github.com/bigcommerce/catalyst/pull/1354) [`3d298c7`](https://github.com/bigcommerce/catalyst/commit/3d298c7190e01309ee706c0b9696f8851071e73c) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Move address forms in account to their own /add and /edit pages.

- [#1280](https://github.com/bigcommerce/catalyst/pull/1280) [`27cbfd2`](https://github.com/bigcommerce/catalyst/commit/27cbfd20307d630f44c2c236e2e0c61a9e57be33) Thanks [@bookernath](https://github.com/bookernath)! - Add dynamic favicon from API on a static route

- [#1357](https://github.com/bigcommerce/catalyst/pull/1357) [`3176491`](https://github.com/bigcommerce/catalyst/commit/317649109861e75fa46794e0cbf67dca500947a6) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add /account/settings/change-password route for change password form.

### Patch Changes

- [#1361](https://github.com/bigcommerce/catalyst/pull/1361) [`dd10d06`](https://github.com/bigcommerce/catalyst/commit/dd10d064156e8fc0376f0cce6f698dc8b834f95e) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Enforce use of next-intl's wrapper navigation APIs.

- [#1360](https://github.com/bigcommerce/catalyst/pull/1360) [`00f72dd`](https://github.com/bigcommerce/catalyst/commit/00f72ddc7e3c2cff780430e074341ee72bc0c893) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Change LocalePrefix mode to `as-needed`, since there's an issue that is causing caching problems when using `never`.

  More info about LocalePrefixes: https://next-intl-docs.vercel.app/docs/routing#shared-configuration
  Open issue: https://github.com/amannn/next-intl/issues/786

- [#1338](https://github.com/bigcommerce/catalyst/pull/1338) [`d50613a`](https://github.com/bigcommerce/catalyst/commit/d50613a669696f34a695bc35b9d40099eeea0660) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - improve redirect behavior after change password on account page

- [#1358](https://github.com/bigcommerce/catalyst/pull/1358) [`48db1b8`](https://github.com/bigcommerce/catalyst/commit/48db1b80a8aeb8e63fb920bf4374413c0d6c67c5) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update da and fr translations to use correct string templates.

- [#1368](https://github.com/bigcommerce/catalyst/pull/1368) [`d032e65`](https://github.com/bigcommerce/catalyst/commit/d032e659ba0ea1b45dc47e3afcb9094ca4f38afc) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Localize metadata titles.

- [#1369](https://github.com/bigcommerce/catalyst/pull/1369) [`c9a5ab5`](https://github.com/bigcommerce/catalyst/commit/c9a5ab58be4dad966dc8d406ade8433f0f2b5d25) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Pass in default channel to favicon query, since `getLocale` can't be used in routes.

## 0.14.2

### Patch Changes

- Updated dependencies [[`88663d1`](https://github.com/bigcommerce/catalyst/commit/88663d165691380b35f83726f0589896bdc73bf2)]:
  - @bigcommerce/catalyst-client@0.8.0

## 0.14.1

### Patch Changes

- [#1257](https://github.com/bigcommerce/catalyst/pull/1257) [`d656e79`](https://github.com/bigcommerce/catalyst/commit/d656e7981c7516be560b1944e4351916572b7a05) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add numbers-only field & utils for account form fields

- [#1277](https://github.com/bigcommerce/catalyst/pull/1277) [`8e6253d`](https://github.com/bigcommerce/catalyst/commit/8e6253dbd3048b8318ce502192bc9f07314b3641) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update Slideshow prop to use altText for image. Rename Hero wrapper component to Slideshow.

- [#1302](https://github.com/bigcommerce/catalyst/pull/1302) [`a620a19`](https://github.com/bigcommerce/catalyst/commit/a620a191d3d30d50d0fa79fc36ad32ee28db8728) Thanks [@deini](https://github.com/deini)! - fix: decode webpage id to fix 404 on some Webpages

- [#1257](https://github.com/bigcommerce/catalyst/pull/1257) [`d656e79`](https://github.com/bigcommerce/catalyst/commit/d656e7981c7516be560b1944e4351916572b7a05) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add checkboxes field for account & addresses forms

- [#1346](https://github.com/bigcommerce/catalyst/pull/1346) [`33e133d`](https://github.com/bigcommerce/catalyst/commit/33e133df74b263aeabd23f72f6b8ccfdc22c1a36) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - fix placeholder positioning for picklist custom form field

- [#1316](https://github.com/bigcommerce/catalyst/pull/1316) [`4aea109`](https://github.com/bigcommerce/catalyst/commit/4aea109593e7ac060552dca18198e39c0b070e55) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Normalizes translations across all pages, updates the next-intl configuration, and simplifies translation handling in the project.

- [#1257](https://github.com/bigcommerce/catalyst/pull/1257) [`d656e79`](https://github.com/bigcommerce/catalyst/commit/d656e7981c7516be560b1944e4351916572b7a05) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add dates field for account & address forms

- [#1141](https://github.com/bigcommerce/catalyst/pull/1141) [`9f3c949`](https://github.com/bigcommerce/catalyst/commit/9f3c9492b2d4edcd404cffc92dfcfec6a0afc395) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - improve redirect behavior after creating new address

- [#1305](https://github.com/bigcommerce/catalyst/pull/1305) [`b11ba3d`](https://github.com/bigcommerce/catalyst/commit/b11ba3d63547d2772a649078274b5b71702c402a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Refactors tabs in `/account` to each be their own page. This also removes unused links in account home page (and tests) until we have that functionality available.

  Previous structure:

  ```
  /account
    [tab]
      page.tsx
  ```

  New structure:

  ```
  /account
    (tabs)
      addresses
        page.tsx
      settings
        page.tsx
      ...etc
  ```

- [#1257](https://github.com/bigcommerce/catalyst/pull/1257) [`d656e79`](https://github.com/bigcommerce/catalyst/commit/d656e7981c7516be560b1944e4351916572b7a05) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add multipleChoices field(radio-buttons, picklist) for account & address forms

- [#1334](https://github.com/bigcommerce/catalyst/pull/1334) [`00f43f0`](https://github.com/bigcommerce/catalyst/commit/00f43f045b4ac2f71aef36a41a1ef643bfc66247) Thanks [@deini](https://github.com/deini)! - Fixes a server crash when user switches language settings

- [#1333](https://github.com/bigcommerce/catalyst/pull/1333) [`e2c0153`](https://github.com/bigcommerce/catalyst/commit/e2c01535e0efbd474b1236d0a7e63ad2263475db) Thanks [@deini](https://github.com/deini)! - Splits i18n into request.ts and routing.ts This helps reduce our middleware bundle as we no longer do a dynamic import on our middleware entrypoint.

- [#1342](https://github.com/bigcommerce/catalyst/pull/1342) [`f7bb1e2`](https://github.com/bigcommerce/catalyst/commit/f7bb1e2654912c2b25851f3a86f77fa6f1014817) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update localeSwitcher to use a link instead of a form.

- [#1326](https://github.com/bigcommerce/catalyst/pull/1326) [`255c648`](https://github.com/bigcommerce/catalyst/commit/255c6482a48d735a28c632746b4a652d8ba1dfed) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Ensure recaptcha is bypassed for functional tests.

- [#1278](https://github.com/bigcommerce/catalyst/pull/1278) [`f8553c6`](https://github.com/bigcommerce/catalyst/commit/f8553c6c9fb35ab7a143fabd60719c8156269448) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix wrapping author text in BlogPostCard.

- [#1322](https://github.com/bigcommerce/catalyst/pull/1322) [`77ecb4b`](https://github.com/bigcommerce/catalyst/commit/77ecb4bb4f527e079788b0f9dff2468e92d0bc1a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Split auth forms to four different pages:
  - /login
  - /register
  - /reset
  - /change-password

  Additionally, moved shared form field components to `/components/form-fields/` and updated translations.

- [#1317](https://github.com/bigcommerce/catalyst/pull/1317) [`7802361`](https://github.com/bigcommerce/catalyst/commit/780236150bab6e2c43e73a230ed69113e3e1bae3) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Rename NEXT_PUBLIC_DEFAULT_REVALIDATE_TARGET to DEFAULT_REVALIDATE_TARGET since we don't need this exposed to the client.

- [#1296](https://github.com/bigcommerce/catalyst/pull/1296) [`fcd44bb`](https://github.com/bigcommerce/catalyst/commit/fcd44bb90bf2d82b098600f4809ae3f37d5c01dc) Thanks [@bookernath](https://github.com/bookernath)! - Add link header to preconnect to CDN

- [#1088](https://github.com/bigcommerce/catalyst/pull/1088) [`644361e`](https://github.com/bigcommerce/catalyst/commit/644361e8a75185e05964a782569c4b17dc5a9f98) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - improve redirect behavior after creating account

- [#1329](https://github.com/bigcommerce/catalyst/pull/1329) [`ad601e1`](https://github.com/bigcommerce/catalyst/commit/ad601e1be0f2e2b0e458363af13d3b7881f8cf24) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - update multiline form-field to respect required settings

- [#1257](https://github.com/bigcommerce/catalyst/pull/1257) [`d656e79`](https://github.com/bigcommerce/catalyst/commit/d656e7981c7516be560b1944e4351916572b7a05) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add multilinetext field for account & address forms

- [#1300](https://github.com/bigcommerce/catalyst/pull/1300) [`b32198b`](https://github.com/bigcommerce/catalyst/commit/b32198b78dcd18b05ba0c0f57269cbd62023a654) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Refactor queries, fragments, and mutations in an effort to set a pattern on where these functions need to be defined.

  Shared queries and mutations will remain in /client for now.

- [#1349](https://github.com/bigcommerce/catalyst/pull/1349) [`dd9cf6f`](https://github.com/bigcommerce/catalyst/commit/dd9cf6f61efb6b17322e1485225003d9799cbf9a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove updateCustomer and getCustomerAddresses queries since they are defined now where they are used.

- [#1313](https://github.com/bigcommerce/catalyst/pull/1313) [`6531bb2`](https://github.com/bigcommerce/catalyst/commit/6531bb2ee9b6a6125cd4f9f0e624e023897387be) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove "Quick add" button in PLP for products that have options. Will now just show a button that links to the product.

## 0.14.0

### Minor Changes

- [#1261](https://github.com/bigcommerce/catalyst/pull/1261) [`f715067`](https://github.com/bigcommerce/catalyst/commit/f715067aa36616b3818c9424c57fa08e28936cde) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Remove the need of fetching shipping countries by using the GraphQL data.

- [#1261](https://github.com/bigcommerce/catalyst/pull/1261) [`f715067`](https://github.com/bigcommerce/catalyst/commit/f715067aa36616b3818c9424c57fa08e28936cde) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Fetch shipping zones if access token exists, otherwise regress back to using the geography node on graphql for shipping information. This is part of an effort to remove the need of the `BIGCOMMERCE_ACCESS_TOKEN`.

### Patch Changes

- [#1256](https://github.com/bigcommerce/catalyst/pull/1256) [`686abe9`](https://github.com/bigcommerce/catalyst/commit/686abe9eae18cd2241e7ac17e17f7139d6b87bd6) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Consistency improvements to prop APIs for UI components.

- Updated dependencies [[`f715067`](https://github.com/bigcommerce/catalyst/commit/f715067aa36616b3818c9424c57fa08e28936cde)]:
  - @bigcommerce/catalyst-client@0.7.0

## 0.13.0

### Minor Changes

- [#1166](https://github.com/bigcommerce/catalyst/pull/1166) [`0661e53`](https://github.com/bigcommerce/catalyst/commit/0661e53e66a12713a5ad23292a0a0eb25cddd9dc) Thanks [@bookernath](https://github.com/bookernath)! - Use default SEO settings from store for pages without SEO information specified, normalize SEO implementation across pages

- [#1194](https://github.com/bigcommerce/catalyst/pull/1194) [`b455b05`](https://github.com/bigcommerce/catalyst/commit/b455b05a6121b005bd5147a25c964b9554b1b350) Thanks [@BC-krasnoshapka](https://github.com/BC-krasnoshapka)! - Add basic support for Google Analytics via [Big Open Data Layer](https://developer.bigcommerce.com/docs/integrations/hosted-analytics). BODL and GA4 integration is encapsulated in `bodl` library which hides current complexity and limitations that will be improved in future. It can be extended with more events and integrations with other analytics providers later. Data transformation from Catalyst data models to BODL and firing events is done in client components, as only frontend events are supported by BODL for now.

  List of currently supported events:
  - View product category
  - View product page
  - Add product to cart
  - View cart
  - Remove product from cart

  In order to configure you need to specify `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` environment variable which is essentially your GA4 ID.

### Patch Changes

- [#1225](https://github.com/bigcommerce/catalyst/pull/1225) [`127f3b6`](https://github.com/bigcommerce/catalyst/commit/127f3b6000f0345a1e277d038025edadeaa09d71) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Change prop `items` to `links` in Header.

- [#1232](https://github.com/bigcommerce/catalyst/pull/1232) [`b7d4986`](https://github.com/bigcommerce/catalyst/commit/b7d4986b390932be770de9adcf12112df4bb58e1) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove `Popover` component, utilize radix primitives instead.

- [#1196](https://github.com/bigcommerce/catalyst/pull/1196) [`b793661`](https://github.com/bigcommerce/catalyst/commit/b793661ab145a2acec5b2fa5aa0c5f1d6865cad9) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add locale picker in header.

- [#1231](https://github.com/bigcommerce/catalyst/pull/1231) [`befb122`](https://github.com/bigcommerce/catalyst/commit/befb122d033ba56b87cb04f31e0f34fe4386d285) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add `Dropdown` component.

- [#1209](https://github.com/bigcommerce/catalyst/pull/1209) [`ef2f3cb`](https://github.com/bigcommerce/catalyst/commit/ef2f3cbddb872a5a2ad1c188f40cd5671eaf77b7) Thanks [@bookernath](https://github.com/bookernath)! - Limit number of chunks in webpack, customizable via env

- [#1239](https://github.com/bigcommerce/catalyst/pull/1239) [`9a37c6a`](https://github.com/bigcommerce/catalyst/commit/9a37c6a25ccaed7b7373cdb3637706c6826a380a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add `Search` component.

- [#1199](https://github.com/bigcommerce/catalyst/pull/1199) [`e8bf185`](https://github.com/bigcommerce/catalyst/commit/e8bf185f34061be96cfe6a118431c3a4c62df7a2) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add more context when no result is found in search page.

- [#1236](https://github.com/bigcommerce/catalyst/pull/1236) [`7d9e865`](https://github.com/bigcommerce/catalyst/commit/7d9e86568c5422cb74ef512ba851ee709e9d59f0) Thanks [@bookernath](https://github.com/bookernath)! - Exclude node_modules from tailwind config to improve build time

- [#1214](https://github.com/bigcommerce/catalyst/pull/1214) [`4e890ff`](https://github.com/bigcommerce/catalyst/commit/4e890ffe203605c4a77be1acdf33622ff871405d) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Change prop `value` to `title` in Accordions.

- [#1197](https://github.com/bigcommerce/catalyst/pull/1197) [`c831677`](https://github.com/bigcommerce/catalyst/commit/c831677cb873e67a898ffd1efeda0c518c6ab97d) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Set key before spreading prop in some form components.

- [#1188](https://github.com/bigcommerce/catalyst/pull/1188) [`5c77f41`](https://github.com/bigcommerce/catalyst/commit/5c77f41eb6ced4677d85fef1adf898fe697a0452) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Rename brand prop to subtitle in Product Card.

- [#1234](https://github.com/bigcommerce/catalyst/pull/1234) [`052e94a`](https://github.com/bigcommerce/catalyst/commit/052e94abd76b52700badde189ec36aee6cc383b1) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add `Breadcrumbs` component.

- [#1224](https://github.com/bigcommerce/catalyst/pull/1224) [`5f934f9`](https://github.com/bigcommerce/catalyst/commit/5f934f91b790b9dd9001f133bdd75ce06951465c) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Change prop `thumbnail` to `image` in BlogPostCard.

- [#1206](https://github.com/bigcommerce/catalyst/pull/1206) [`d1cf327`](https://github.com/bigcommerce/catalyst/commit/d1cf327d4c2c28f01940391a74cc4750d79b03b7) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add `Slide` component to be used in `Slideshow`.

- [#1198](https://github.com/bigcommerce/catalyst/pull/1198) [`22dc862`](https://github.com/bigcommerce/catalyst/commit/22dc86260daaaeec20276a84b89c152a3ae246a3) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add missing accessibility components to Sheet/Mobile Nav.

- [#1226](https://github.com/bigcommerce/catalyst/pull/1226) [`d6d1224`](https://github.com/bigcommerce/catalyst/commit/d6d1224521d4304bbdb515763aaee402b1a97c94) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Rename `value` to `rating` for Rating component, remove unused props.

- [#1190](https://github.com/bigcommerce/catalyst/pull/1190) [`d01b4e0`](https://github.com/bigcommerce/catalyst/commit/d01b4e0560b1b8b2b3df9ed348231a2fc375f785) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove title prop from Tabs, remove Tabs from /account since it's not needed.

- [#1204](https://github.com/bigcommerce/catalyst/pull/1204) [`bde94ba`](https://github.com/bigcommerce/catalyst/commit/bde94bab5299b933047c58cd3c64a73022c039bc) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add missing accisibility components to Quick Search.

- [#1200](https://github.com/bigcommerce/catalyst/pull/1200) [`51704d9`](https://github.com/bigcommerce/catalyst/commit/51704d9b9a7158c625c84f79e2ba95f98c6dc673) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Use the `geography` node to retrieve a list of countries. This removes one less dependency on the access token.

- [#1235](https://github.com/bigcommerce/catalyst/pull/1235) [`53ccd31`](https://github.com/bigcommerce/catalyst/commit/53ccd31f51e5b6d8f311a340d0bf70b7edb632aa) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add `Pagination` component.

- [#1211](https://github.com/bigcommerce/catalyst/pull/1211) [`ec81a3a`](https://github.com/bigcommerce/catalyst/commit/ec81a3a69182d015395d6dc7bfff1e9af2adb6f9) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update price prop in ProductCard to accept an object instead of a ReactNode.

- [#1208](https://github.com/bigcommerce/catalyst/pull/1208) [`315ed15`](https://github.com/bigcommerce/catalyst/commit/315ed154e1ccfe316dc4d1037e674b79c3bad308) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Move CompareDrawer to ui components.

- Updated dependencies [[`51704d9`](https://github.com/bigcommerce/catalyst/commit/51704d9b9a7158c625c84f79e2ba95f98c6dc673)]:
  - @bigcommerce/catalyst-client@0.6.0

## 0.12.0

### Minor Changes

- [#1178](https://github.com/bigcommerce/catalyst/pull/1178) [`f592d9f`](https://github.com/bigcommerce/catalyst/commit/f592d9fe0b71ddd7ceb5e1326ea0280f7b90c3c9) Thanks [@jorgemoya](https://github.com/jorgemoya)! - This refactor changes the structure of our UI components by replacing composability with a prop-based configuration. This change simplifies the use of our components, eliminating the need to build them individually from a composable approach. Additionally, it provides a single location for all class customizations, improving the experience when fully customizing the component. We believe this approach will make it easier to use components correctly and safeguard against incorrect usage. Ultimately, by adopting a prop-based configuration, we aim to achieve full replaceability and simplify theming for our components.

  Before refactor:

  ```
  <Accordions>
      <AccordionsItem>
          <AccordionsTrigger>
              Title 1
          </AccordionsTrigger>
          <AccordionsContent>
              Item Content 1
          </AccordionsContent>
      </AccordionsItem>
      <AccordionsItem>
          <AccordionsTrigger>
              Title 2
          </AccordionsTrigger>
          <AccordionsContent>
              Item Content 2
          </AccordionsContent>
      </AccordionsItem>
  </Accordions>
  ```

  After refactor:

  ```
  <Accordions accordions={[
      {value: 'Title 1', content: 'Item Content 1'},
      {value: 'Title 2', content: 'Item Content 2'}
  ]}>
  ```

  Before refactor:

  ```
  <Select
      onValueChange={onSort}
      value={value}
  >
      <SelectContent>
          <SelectItem value="featured">Featured</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="best_selling">Best selling</SelectItem>
          <SelectItem value="a_to_z">A to Z</SelectItem>
          <SelectItem value="z_to_a">Z to A</SelectItem>
          <SelectItem value="best_reviewed">By reviews</SelectItem>
          <SelectItem value="lowest_price">Price ascending</SelectItem>
          <SelectItem value="highest_price">Price descending</SelectItem>
          <SelectItem value="relevance">Relevance</SelectItem>
      </SelectContent>
  </Select>
  ```

  After refactor:

  ```
  <Select
      onValueChange={onSort}
      options={[
          { value: 'featured', label: 'Featured' },
          { value: 'newest', label: 'Newest' },
          { value: 'best_selling', label: 'Best selling' },
          { value: 'a_to_z', label: 'A to Z' },
          { value: 'z_to_a', label: 'Z to A' },
          { value: 'best_reviewed', label: 'By reviews'},
          { value: 'lowest_price', label: 'Price ascending' },
          { value: 'highest_price', label: 'Price descending' },
          { value: 'relevance', label: 'Relevance' },
      ]}
      value={value}
  />
  ```

## 0.11.0

### Minor Changes

- [#1156](https://github.com/bigcommerce/catalyst/pull/1156) [`7d91478`](https://github.com/bigcommerce/catalyst/commit/7d9147894deb17ca17048ac95b86e5a8a0def515) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Adds customer information onto the session for consumption in both server and client components

### Patch Changes

- [#1183](https://github.com/bigcommerce/catalyst/pull/1183) [`4e7ed57`](https://github.com/bigcommerce/catalyst/commit/4e7ed57979a82b04cc1fcb47025356c4b746db82) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Uses `next/navigation` for logging in as a customer instead of the built-in `redirectTo` option. That option was not following the `trailingSlash` config set in `next.config.js` which caused test failures.

- [#1179](https://github.com/bigcommerce/catalyst/pull/1179) [`ae8d985`](https://github.com/bigcommerce/catalyst/commit/ae8d985a89c229f945a596d7a905828dfcbe490e) Thanks [@deini](https://github.com/deini)! - bump next to 14.2.5

- Updated dependencies []:
  - @bigcommerce/catalyst-client@0.5.0

## 0.10.0

### Minor Changes

- [#1057](https://github.com/bigcommerce/catalyst/pull/1057) [`22dd481`](https://github.com/bigcommerce/catalyst/commit/22dd4818edea8ea9f7efc721a598cd978684ede5) Thanks [@bookernath](https://github.com/bookernath)! - Added /sitemap.xml as a proxy to hosted BigCommerce sitemap

### Patch Changes

- [#1098](https://github.com/bigcommerce/catalyst/pull/1098) [`405e791`](https://github.com/bigcommerce/catalyst/commit/405e791af8e7ecc1422f2ce18cb216a8c04cc73b) Thanks [@bookernath](https://github.com/bookernath)! - Move Sitemap Index fetching into the client & normalize user agents

- [#1086](https://github.com/bigcommerce/catalyst/pull/1086) [`e0926ee`](https://github.com/bigcommerce/catalyst/commit/e0926ee21664503f208dafcc8e5939c363801ee1) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add minor changes to address form layout

- [#1055](https://github.com/bigcommerce/catalyst/pull/1055) [`52214a3`](https://github.com/bigcommerce/catalyst/commit/52214a376bba1fdaa584de31c36f7d6cdc078624) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Make client.fetch channel aware per locale.

- [#1071](https://github.com/bigcommerce/catalyst/pull/1071) [`5d0975b`](https://github.com/bigcommerce/catalyst/commit/5d0975be8accd733e2ed909dba85f04d6d1042f5) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Use customerId in product API to get correct product information.

- [#1077](https://github.com/bigcommerce/catalyst/pull/1077) [`e86f46f`](https://github.com/bigcommerce/catalyst/commit/e86f46fea3bd5630311d3afccb4b2d70aa68f6fe) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Uses the deployment URL for the robots.txt sitemap field rather than another environment variable.

- [#1075](https://github.com/bigcommerce/catalyst/pull/1075) [`4bf7d16`](https://github.com/bigcommerce/catalyst/commit/4bf7d1680df4a7dcc2adcdf24e4faf9e4e470726) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Append channel to kv keys.

- [#1034](https://github.com/bigcommerce/catalyst/pull/1034) [`e648a62`](https://github.com/bigcommerce/catalyst/commit/e648a62bed956a0c2ea43b9bc3ca68e009b57cfc) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add store selector page.

- [#1032](https://github.com/bigcommerce/catalyst/pull/1032) [`982b19c`](https://github.com/bigcommerce/catalyst/commit/982b19c5e80d4b427ec207cc0d72ef5014e4bee8) Thanks [@deini](https://github.com/deini)! - prefetch product option data on hover

- [#1095](https://github.com/bigcommerce/catalyst/pull/1095) [`5df38cf`](https://github.com/bigcommerce/catalyst/commit/5df38cf3b521e5b2077026e045f85e8ddbaee8a7) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Fixes a missing GraphQL field for the updateCustomer mutation.

- [#1056](https://github.com/bigcommerce/catalyst/pull/1056) [`ad7bda7`](https://github.com/bigcommerce/catalyst/commit/ad7bda7387f25b04dc53b4df06ca8929791bc5d6) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - make selected account tab visible on mobile devices

- [#1087](https://github.com/bigcommerce/catalyst/pull/1087) [`b21a139`](https://github.com/bigcommerce/catalyst/commit/b21a139c447eeb132a2cabef3951f0cb7f779341) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - change pagination layout and minor changes to address book

- Updated dependencies [[`405e791`](https://github.com/bigcommerce/catalyst/commit/405e791af8e7ecc1422f2ce18cb216a8c04cc73b), [`8766305`](https://github.com/bigcommerce/catalyst/commit/8766305b65ca10422e7921b2fd15796e0a09d27a), [`52214a3`](https://github.com/bigcommerce/catalyst/commit/52214a376bba1fdaa584de31c36f7d6cdc078624)]:
  - @bigcommerce/catalyst-client@0.5.0

## 0.9.1

### Patch Changes

- [#937](https://github.com/bigcommerce/catalyst/pull/937) [`3606639`](https://github.com/bigcommerce/catalyst/commit/3606639e294465cd10aab217c8c74be7cd7a8754) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Show correct status and messaging for the Add to Cart button.

- [#979](https://github.com/bigcommerce/catalyst/pull/979) [`6a6c193`](https://github.com/bigcommerce/catalyst/commit/6a6c1938a05a639212afc41241b4e1cb4cf6cd88) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - fix redirection to the Login page after password change

- [#972](https://github.com/bigcommerce/catalyst/pull/972) [`3c34e27`](https://github.com/bigcommerce/catalyst/commit/3c34e276d7b735394aa3c9d6205f18b5407ca7a4) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Show correct color of remove button when in loading state.

- [#982](https://github.com/bigcommerce/catalyst/pull/982) [`b8ea900`](https://github.com/bigcommerce/catalyst/commit/b8ea9006a621a9d5f549e4fa1c6bbccb72c3b1ec) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Introduces more consistent naming convention for files related to GraphQL, changes opinions around when it is appropriate to track GraphQL files in version control, fixes an issue where the `generate.cjs` script was swallowing helpful error messaging

- [#977](https://github.com/bigcommerce/catalyst/pull/977) [`bf4739d`](https://github.com/bigcommerce/catalyst/commit/bf4739d0977deb69f3bc1cf0e70f4c96b60c6d89) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add upstash kv adapter.

- [#974](https://github.com/bigcommerce/catalyst/pull/974) [`970651c`](https://github.com/bigcommerce/catalyst/commit/970651c159553983f665a8951419cdd3d977fc02) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add loading state to remove coupon code button.

## 0.9.0

### Minor Changes

- [#794](https://github.com/bigcommerce/catalyst/pull/794) [`956d738`](https://github.com/bigcommerce/catalyst/commit/956d7389bce81e8af8e8cdbe0bae78e3b3f20423) Thanks [@yurytut1993](https://github.com/yurytut1993)! - add update customer form

### Patch Changes

- [#942](https://github.com/bigcommerce/catalyst/pull/942) [`c7c65e0`](https://github.com/bigcommerce/catalyst/commit/c7c65e002d6f473292713c4c5ffa4ab2690cc6f8) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Make select scrollable with popover functionality.

- [#957](https://github.com/bigcommerce/catalyst/pull/957) [`0a3b519`](https://github.com/bigcommerce/catalyst/commit/0a3b5191d1eba6ea70eeb91ef39638d5a6fbf1ca) Thanks [@deini](https://github.com/deini)! - fix custom 404 page not being used

- [#941](https://github.com/bigcommerce/catalyst/pull/941) [`19a3d14`](https://github.com/bigcommerce/catalyst/commit/19a3d147b6b12b38d974649c147a709c0d47557a) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - update icons on the account page

- [#811](https://github.com/bigcommerce/catalyst/pull/811) [`6661e3e`](https://github.com/bigcommerce/catalyst/commit/6661e3e56e1cc703506f5ee509a7377fb19174f0) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add new address for customer

## 0.8.0

### Minor Changes

- [#704](https://github.com/bigcommerce/catalyst/pull/704) [`6e93873`](https://github.com/bigcommerce/catalyst/commit/6e9387326cebf139bb7fb2459f5b9f29c81c876f) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add change password for logged-in customer

- [#730](https://github.com/bigcommerce/catalyst/pull/730) [`15e4b82`](https://github.com/bigcommerce/catalyst/commit/15e4b82845979e0ea92aae531055552636d433fb) Thanks [@yurytut1993](https://github.com/yurytut1993)! - create register customer page

### Patch Changes

- [#922](https://github.com/bigcommerce/catalyst/pull/922) [`321f67f`](https://github.com/bigcommerce/catalyst/commit/321f67f0f6576f2f6169e3d804705c7a82a9fb1a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix incorrect sale price showing when no sale was active in Cart

- [#896](https://github.com/bigcommerce/catalyst/pull/896) [`b13fecf`](https://github.com/bigcommerce/catalyst/commit/b13fecfa145ceb489553511221f76533d65d6bf9) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Modify Cart page layout to fix mobile rendering issues.

- [#787](https://github.com/bigcommerce/catalyst/pull/787) [`6198648`](https://github.com/bigcommerce/catalyst/commit/6198648c563be61ac6a5a413a005ed63a7d43a58) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add delete address functionality for account

- [#909](https://github.com/bigcommerce/catalyst/pull/909) [`bf0e326`](https://github.com/bigcommerce/catalyst/commit/bf0e326e446d3014ae9a3c352173ee1e547f3de8) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Show original price of Cart item when on sale

- [#912](https://github.com/bigcommerce/catalyst/pull/912) [`5ec3d76`](https://github.com/bigcommerce/catalyst/commit/5ec3d76c3af5847604dedfa9c6d1c870246808ef) Thanks [@deini](https://github.com/deini)! - fetch checkout redirect url when user clicks proceed to checkout button

- [#916](https://github.com/bigcommerce/catalyst/pull/916) [`ff231c9`](https://github.com/bigcommerce/catalyst/commit/ff231c9c5d8ae5470fea61de7d42494b68b9f469) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add Button with loading state.

- [#918](https://github.com/bigcommerce/catalyst/pull/918) [`f16936a`](https://github.com/bigcommerce/catalyst/commit/f16936a057de212baafad9e62f556d0d4bb2bfae) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix issue with account dropdown in header.

- [#919](https://github.com/bigcommerce/catalyst/pull/919) [`cde181e`](https://github.com/bigcommerce/catalyst/commit/cde181e4a3a768401bda6471562a8128dff3dcb2) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix broken Slot functionality in Button

- [#910](https://github.com/bigcommerce/catalyst/pull/910) [`d0352c0`](https://github.com/bigcommerce/catalyst/commit/d0352c08b43e76b4cd838cb7916f9993228e3fa0) Thanks [@deini](https://github.com/deini)! - removes fetch cart redirect from client and fetch it with gql

- [#880](https://github.com/bigcommerce/catalyst/pull/880) [`af61999`](https://github.com/bigcommerce/catalyst/commit/af619997002f33b2a9a5276467ac632218cfc2f8) Thanks [@deini](https://github.com/deini)! - Category pages now use the `categoryEntityId` filter

- Updated dependencies [[`d0352c0`](https://github.com/bigcommerce/catalyst/commit/d0352c08b43e76b4cd838cb7916f9993228e3fa0)]:
  - @bigcommerce/catalyst-client@0.4.0

## 0.7.0

### Minor Changes

- [#748](https://github.com/bigcommerce/catalyst/pull/748) [`dc03f50`](https://github.com/bigcommerce/catalyst/commit/dc03f50bb1734b26bd15ecf9c1f7fb6e34d3e86c) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add customer addresses tab content

- [#760](https://github.com/bigcommerce/catalyst/pull/760) [`d3cb5bd`](https://github.com/bigcommerce/catalyst/commit/d3cb5bd51966aa1bf38453aba2a125f517869931) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add dialog component

### Patch Changes

- [#786](https://github.com/bigcommerce/catalyst/pull/786) [`8e6328f`](https://github.com/bigcommerce/catalyst/commit/8e6328fb577e91eede49a92eafa113c5778520de) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Apply the edge runtime to missing routes.

- [#816](https://github.com/bigcommerce/catalyst/pull/816) [`7115843`](https://github.com/bigcommerce/catalyst/commit/711584393f829873ad8d3d48495f1aafa777e46d) Thanks [@avattipalli](https://github.com/avattipalli)! - Move functional tests to apps/core

- [#776](https://github.com/bigcommerce/catalyst/pull/776) [`656693e`](https://github.com/bigcommerce/catalyst/commit/656693ed1ac30a162025b58763fa7beb4dfaad18) Thanks [@yurytut1993](https://github.com/yurytut1993)! - add update customer mutation

- [#845](https://github.com/bigcommerce/catalyst/pull/845) [`dfd5b25`](https://github.com/bigcommerce/catalyst/commit/dfd5b25659cb90e909e73764f246f19322f60a4c) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove additional references to @bigcommerce/components.

- [#808](https://github.com/bigcommerce/catalyst/pull/808) [`c0bca5d`](https://github.com/bigcommerce/catalyst/commit/c0bca5d12257218908dcca54b31d32bf84d087fb) Thanks [@jorgemoya](https://github.com/jorgemoya)! - use next-intl formatter to properly localize dates & prices

- [#854](https://github.com/bigcommerce/catalyst/pull/854) [`0758464`](https://github.com/bigcommerce/catalyst/commit/0758464e4c43ab33e470bb91223249b01e36e780) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Respect isVisibleInNavigation for blog pages

- [#779](https://github.com/bigcommerce/catalyst/pull/779) [`fe34b3e`](https://github.com/bigcommerce/catalyst/commit/fe34b3ed79992f73084214b369b7750141a17c39) Thanks [@deini](https://github.com/deini)! - use LRU cache for DevKvAdapter

- [#789](https://github.com/bigcommerce/catalyst/pull/789) [`86403a6`](https://github.com/bigcommerce/catalyst/commit/86403a6fc66f52f93ace611631614c2844af5a87) Thanks [@deini](https://github.com/deini)! - best-effort in memory cache for vercel kv adapter

- [#815](https://github.com/bigcommerce/catalyst/pull/815) [`984c30c`](https://github.com/bigcommerce/catalyst/commit/984c30ca51601fb8f1c0f6c83bce40c3650f9b23) Thanks [@deini](https://github.com/deini)! - pin nextjs version

- [#814](https://github.com/bigcommerce/catalyst/pull/814) [`c0b5df4`](https://github.com/bigcommerce/catalyst/commit/c0b5df458f049d73b9cfb17426f132f827e4574f) Thanks [@jorgemoya](https://github.com/jorgemoya)! - standardize mutations by returning drilled response

- [#759](https://github.com/bigcommerce/catalyst/pull/759) [`3602d91`](https://github.com/bigcommerce/catalyst/commit/3602d91144513ad0c14b646f2cfc68791d3c3198) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add delete customer address mutation

- [#767](https://github.com/bigcommerce/catalyst/pull/767) [`c740cdd`](https://github.com/bigcommerce/catalyst/commit/c740cdd1b561b7abaab7390a8dfcab4d65c89d73) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Move /packages/components into core, update related configurations.

- [#798](https://github.com/bigcommerce/catalyst/pull/798) [`56f3c48`](https://github.com/bigcommerce/catalyst/commit/56f3c4824dd0b31212c15b124cb29be79548fbf2) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Update `tailwindFunctions` to use the correct className utility function `cn`.

- [#769](https://github.com/bigcommerce/catalyst/pull/769) [`1fa1c38`](https://github.com/bigcommerce/catalyst/commit/1fa1c38382871b78c3f51cbcf049532e1b05bbbc) Thanks [@avattipalli](https://github.com/avattipalli)! - add accessible attr for select component

- [#810](https://github.com/bigcommerce/catalyst/pull/810) [`168cdda`](https://github.com/bigcommerce/catalyst/commit/168cddae51638a24a0fb53a3a2f5a5e03a7a4b38) Thanks [@deini](https://github.com/deini)! - split contact us and normal websites into individual pages

- [#777](https://github.com/bigcommerce/catalyst/pull/777) [`fe5c221`](https://github.com/bigcommerce/catalyst/commit/fe5c221aa6e4a4049e89f69e177d722ee94b6f62) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add customer address mutation

- [#831](https://github.com/bigcommerce/catalyst/pull/831) [`8349bbf`](https://github.com/bigcommerce/catalyst/commit/8349bbf928dee722fadb5c2119b41756bffaa317) Thanks [@jorgemoya](https://github.com/jorgemoya)! - chore: standardize actions

- [#783](https://github.com/bigcommerce/catalyst/pull/783) [`301b775`](https://github.com/bigcommerce/catalyst/commit/301b775ef967b72ab9d3930eb7ec7488876b48b4) Thanks [@jorgemoya](https://github.com/jorgemoya)! - add loading state on item quantity update and remove when quantity equals 0

- [#852](https://github.com/bigcommerce/catalyst/pull/852) [`3b7ec09`](https://github.com/bigcommerce/catalyst/commit/3b7ec09c26af506f48259806f8d06e4ba8493bc2) Thanks [@electricenjindevops](https://github.com/electricenjindevops)! - Conditionally show featuredProducts on 404 page.

- [#836](https://github.com/bigcommerce/catalyst/pull/836) [`6cbfd02`](https://github.com/bigcommerce/catalyst/commit/6cbfd02e3621e3be72dfc4db6292f66d1575eb95) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Bump react to v18.3.1

- [#793](https://github.com/bigcommerce/catalyst/pull/793) [`76fad25`](https://github.com/bigcommerce/catalyst/commit/76fad25074afaf5b15f9989fa2a6038af96bfdeb) Thanks [@deini](https://github.com/deini)! - use --turbo for next dev

- [#873](https://github.com/bigcommerce/catalyst/pull/873) [`1c7f52f`](https://github.com/bigcommerce/catalyst/commit/1c7f52f13d9dc6faf8bd039c2208fac76ed88d03) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Set a min width to body.

- [#838](https://github.com/bigcommerce/catalyst/pull/838) [`7a0e393`](https://github.com/bigcommerce/catalyst/commit/7a0e39369b5971be3036e0678455ec82bcb5e321) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Respects when `CLIENT_LOGGER="false"` or `KV_LOGGER="false"` is set in .env.local regardless of environment.

- [#773](https://github.com/bigcommerce/catalyst/pull/773) [`7f70719`](https://github.com/bigcommerce/catalyst/commit/7f7071962a091671c64e376598950c2d6fa3ec1d) Thanks [@deini](https://github.com/deini)! - check for auth on /account pages

- [#771](https://github.com/bigcommerce/catalyst/pull/771) [`8af0878`](https://github.com/bigcommerce/catalyst/commit/8af08780469f1ee0ecdf63449aa7a31c2b965c9e) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Add missing `Cart.spinnerText` translation.

- [#778](https://github.com/bigcommerce/catalyst/pull/778) [`32c3373`](https://github.com/bigcommerce/catalyst/commit/32c33730364241d78ea2fb9817d1543bdd1c1e23) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add update address mutation

- [#877](https://github.com/bigcommerce/catalyst/pull/877) [`017fa61`](https://github.com/bigcommerce/catalyst/commit/017fa6178dcbd99ee41d84f71dbe263cfcd76181) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Set mobile padding to 16px instead of 24px

- [#875](https://github.com/bigcommerce/catalyst/pull/875) [`78a5f08`](https://github.com/bigcommerce/catalyst/commit/78a5f088e6dc4da5b804e2acee74f9d79ecb6ef7) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix header overflow in mobile, hide search when screen width is extra small."

- [#743](https://github.com/bigcommerce/catalyst/pull/743) [`30c7624`](https://github.com/bigcommerce/catalyst/commit/30c7624b4430d76ef3efea1314c18c3b400b966d) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add customer addresses query

- [#768](https://github.com/bigcommerce/catalyst/pull/768) [`39feb4a`](https://github.com/bigcommerce/catalyst/commit/39feb4a7773719670a394edc19e5e391905158ba) Thanks [@yurytut1993](https://github.com/yurytut1993)! - add get customer query

- [#846](https://github.com/bigcommerce/catalyst/pull/846) [`e2f4311`](https://github.com/bigcommerce/catalyst/commit/e2f43116e9038f676ea0520bb96de7d16bec6424) Thanks [@avattipalli](https://github.com/avattipalli)! - Migrate visual regression tests

## 0.6.0

### Minor Changes

- [#753](https://github.com/bigcommerce/catalyst/pull/753) [`48c040e`](https://github.com/bigcommerce/catalyst/commit/48c040e94745134f4c60b15cadcdb0a0bbcb2a36) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Deprecate `node@18` in favor of latest LTS version `node@20`.

### Patch Changes

- [#755](https://github.com/bigcommerce/catalyst/pull/755) [`6a6af43`](https://github.com/bigcommerce/catalyst/commit/6a6af432d95a221b1685328bd5211fb6fea8ad55) Thanks [@deini](https://github.com/deini)! - pin next version

- [#757](https://github.com/bigcommerce/catalyst/pull/757) [`dac0199`](https://github.com/bigcommerce/catalyst/commit/dac019989c9c1a81526689dc9e75c9d3a0d0dce3) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Update cart select components to use the item-aligned select content in order to scroll with large Select content.

- Updated dependencies [[`48c040e`](https://github.com/bigcommerce/catalyst/commit/48c040e94745134f4c60b15cadcdb0a0bbcb2a36), [`dac0199`](https://github.com/bigcommerce/catalyst/commit/dac019989c9c1a81526689dc9e75c9d3a0d0dce3)]:
  - @bigcommerce/catalyst-client@0.3.0
  - @bigcommerce/components@0.3.0

## 0.5.0

### Minor Changes

- [#719](https://github.com/bigcommerce/catalyst/pull/719) [`ab67b34`](https://github.com/bigcommerce/catalyst/commit/ab67b34ea1c6c7b4b5192a0fe2455ab79f001a97) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add tabs for customer account

### Patch Changes

- [#740](https://github.com/bigcommerce/catalyst/pull/740) [`d586c21`](https://github.com/bigcommerce/catalyst/commit/d586c2122bf6513b2f7d923957636c7ea8aaf2ce) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump next-auth and use string for user id

- [#749](https://github.com/bigcommerce/catalyst/pull/749) [`5041719`](https://github.com/bigcommerce/catalyst/commit/5041719a753ef36472f9cfac79bbca32b540b6e5) Thanks [@deini](https://github.com/deini)! - fix social icons type errors with latest @types/react

- [#750](https://github.com/bigcommerce/catalyst/pull/750) [`c8973e2`](https://github.com/bigcommerce/catalyst/commit/c8973e2051042e832859f8c559d0fff456e2a621) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add loading state to remove item button in Cart

- [#724](https://github.com/bigcommerce/catalyst/pull/724) [`045cd14`](https://github.com/bigcommerce/catalyst/commit/045cd14f9846ec939a6237c42f57e849425fa4dd) Thanks [@christensenep](https://github.com/christensenep)! - Support serving static pages when the cart is not empty

- Updated dependencies [[`d586c21`](https://github.com/bigcommerce/catalyst/commit/d586c2122bf6513b2f7d923957636c7ea8aaf2ce)]:
  - @bigcommerce/catalyst-client@0.2.2

## 0.4.0

### Minor Changes

- [#733](https://github.com/bigcommerce/catalyst/pull/733) [`565e871`](https://github.com/bigcommerce/catalyst/commit/565e87173056fe944c94a004a84947ae93e84c00) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Allow applying and removing coupons in cart

- [#716](https://github.com/bigcommerce/catalyst/pull/716) [`b1a2939`](https://github.com/bigcommerce/catalyst/commit/b1a29398fcde23e67c19bb579e714bcde39839cb) Thanks [@bookernath](https://github.com/bookernath)! - Prefetch high-intent cart link immediately after add to cart action

- [#638](https://github.com/bigcommerce/catalyst/pull/638) [`a1f7970`](https://github.com/bigcommerce/catalyst/commit/a1f797098eee668b4f8bf6763100d71d3882cb45) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add reset password functionality
  Update props for message field

- [#665](https://github.com/bigcommerce/catalyst/pull/665) [`980e481`](https://github.com/bigcommerce/catalyst/commit/980e481767b2305e4e8374c2880018b1637525f0) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add components for change password

### Patch Changes

- [#713](https://github.com/bigcommerce/catalyst/pull/713) [`643033a`](https://github.com/bigcommerce/catalyst/commit/643033abb973942cbe2ff30bd7e2a539fa7984ed) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fetch and show digital items in Cart summary.

- [#711](https://github.com/bigcommerce/catalyst/pull/711) [`0ec2269`](https://github.com/bigcommerce/catalyst/commit/0ec22699a3313e4ad7473d12fe13e9a8549f9415) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Use checkout field from GQL to populate checkout summary.

- [#732](https://github.com/bigcommerce/catalyst/pull/732) [`ea5a690`](https://github.com/bigcommerce/catalyst/commit/ea5a6900fa59f73f44537cd3a3095ce4a91e26cf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Hide discounts if null

- [#722](https://github.com/bigcommerce/catalyst/pull/722) [`b3cddde`](https://github.com/bigcommerce/catalyst/commit/b3cdddecabdbc57e8e6454fa02978bc0216527f7) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Preselect first state when country is selected for Shipping Info

- [#734](https://github.com/bigcommerce/catalyst/pull/734) [`86e57a1`](https://github.com/bigcommerce/catalyst/commit/86e57a18db651cbc8df0e1b8ce7c46d0c0c4087a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Pass customer id to shipping mutation that were missing.

- [#728](https://github.com/bigcommerce/catalyst/pull/728) [`fa83629`](https://github.com/bigcommerce/catalyst/commit/fa8362917efcf572976628619d9da4859c9dcd47) Thanks [@christensenep](https://github.com/christensenep)! - Fix breadcrumbs on PDP to have correct links

- [#731](https://github.com/bigcommerce/catalyst/pull/731) [`41ebe00`](https://github.com/bigcommerce/catalyst/commit/41ebe001a14e766cab5b75a87f639a0b081bcac0) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add tax total in checkout summary

- [#735](https://github.com/bigcommerce/catalyst/pull/735) [`3db9c5f`](https://github.com/bigcommerce/catalyst/commit/3db9c5fa603299a5c5a9a12bd5408f9024677b20) Thanks [@deini](https://github.com/deini)! - Bump dependencies

- [#683](https://github.com/bigcommerce/catalyst/pull/683) [`cfab55b`](https://github.com/bigcommerce/catalyst/commit/cfab55b374f61f89a9de6a09a8cb3daa93ca48d6) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add change password mutation for logged in customer

- Updated dependencies [[`a1f7970`](https://github.com/bigcommerce/catalyst/commit/a1f797098eee668b4f8bf6763100d71d3882cb45), [`5af4856`](https://github.com/bigcommerce/catalyst/commit/5af4856510406080d75a1e1db16fe55f86082264), [`3db9c5f`](https://github.com/bigcommerce/catalyst/commit/3db9c5fa603299a5c5a9a12bd5408f9024677b20), [`e4dab93`](https://github.com/bigcommerce/catalyst/commit/e4dab93222b2a19d469315266b2d4627a7967294)]:
  - @bigcommerce/components@0.2.0
  - @bigcommerce/catalyst-client@0.2.1

## 0.3.0

### Minor Changes

- [#696](https://github.com/bigcommerce/catalyst/pull/696) [`6deba4a`](https://github.com/bigcommerce/catalyst/commit/6deba4a0713b0d14a76439f0cd01baf35f5185e2) Thanks [@deini](https://github.com/deini)! - removes graphql codegen setup, all graphql calls are done using gql.tada

### Patch Changes

- [#694](https://github.com/bigcommerce/catalyst/pull/694) [`b0c912b`](https://github.com/bigcommerce/catalyst/commit/b0c912bfcefe8c6a9dc46d667f9f96124d1ad132) Thanks [@onurstats](https://github.com/onurstats)! - fix login form translation key mismatch

- [#697](https://github.com/bigcommerce/catalyst/pull/697) [`fbc49e1`](https://github.com/bigcommerce/catalyst/commit/fbc49e144f0eadd7824cae81a46ddff523eb30a3) Thanks [@yurytut1993](https://github.com/yurytut1993)! - add customer & address form fields queries

## 0.2.1

### Patch Changes

- [#641](https://github.com/bigcommerce/catalyst/pull/641) [`43b1afd`](https://github.com/bigcommerce/catalyst/commit/43b1afdf8d9977daf329d0e828e73ea8c8b49acb) Thanks [@yurytut1993](https://github.com/yurytut1993)! - add register customer mutation

- Updated dependencies [[`ac733cc`](https://github.com/bigcommerce/catalyst/commit/ac733cc0308b3ebe1189fe6a7d20214dbc382b3f), [`5af0e66`](https://github.com/bigcommerce/catalyst/commit/5af0e66e7b065ea1d158a0d062a6c3216752d5be)]:
  - @bigcommerce/catalyst-client@0.2.0
  - @bigcommerce/components@0.1.2

## 0.2.0

### Minor Changes

- [#662](https://github.com/bigcommerce/catalyst/pull/662) [`be5fc87`](https://github.com/bigcommerce/catalyst/commit/be5fc8787c4e9078c0e032c508f5ccd167421416) Thanks [@deini](https://github.com/deini)! - export a graphql() powered by gql.tada

- [#666](https://github.com/bigcommerce/catalyst/pull/666) [`51a2b64`](https://github.com/bigcommerce/catalyst/commit/51a2b6456ae9ef02569f8eb1380c6deb69b6c55d) Thanks [@deini](https://github.com/deini)! - use gql.tada on simple queries

- [#658](https://github.com/bigcommerce/catalyst/pull/658) [`8ff2eb6`](https://github.com/bigcommerce/catalyst/commit/8ff2eb65acaf973cf7d30833c14238338c57ec44) Thanks [@matthewvolk](https://github.com/matthewvolk)! - create graphql schema using gql.tada

- [#663](https://github.com/bigcommerce/catalyst/pull/663) [`faa2330`](https://github.com/bigcommerce/catalyst/commit/faa23305f6be273320de7caa1e451cef0a748215) Thanks [@deini](https://github.com/deini)! - use gql.tada on all mutations

- [#671](https://github.com/bigcommerce/catalyst/pull/671) [`9c5bb8c`](https://github.com/bigcommerce/catalyst/commit/9c5bb8cd9d9b7bf5a1632d9b9cc998950fd993e7) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Hide handling cost in shipping estimate if there is no cost associated.

### Patch Changes

- [#659](https://github.com/bigcommerce/catalyst/pull/659) [`35e5c96`](https://github.com/bigcommerce/catalyst/commit/35e5c9658d28e167d27a3eb77e455f40f023ed03) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Use amount and discount values for cart summary in Cart page

- [#669](https://github.com/bigcommerce/catalyst/pull/669) [`b657f6c`](https://github.com/bigcommerce/catalyst/commit/b657f6c9f9d56ba45cc09a9fa78f0eb684425204) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Use correct font weight and size for Grand Total in Cart Summary

- [#660](https://github.com/bigcommerce/catalyst/pull/660) [`46b0656`](https://github.com/bigcommerce/catalyst/commit/46b06562e07f3e2ef44803758bfe3d2c7ae49455) Thanks [@deini](https://github.com/deini)! - fix auth imports, was causing issues with --turbo

- [#668](https://github.com/bigcommerce/catalyst/pull/668) [`58ca3eb`](https://github.com/bigcommerce/catalyst/commit/58ca3eb943332aaede6e5a41550cfb0ab048c87a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix on hover style for buttons in Shipping Estimator

## 0.1.1

### Patch Changes

- [#645](https://github.com/bigcommerce/catalyst/pull/645) [`ac57f18`](https://github.com/bigcommerce/catalyst/commit/ac57f189845f6b87e12cd2ac0352301226cf8f50) Thanks [@christensenep](https://github.com/christensenep)! - Add intl provider to No Search Results page

- [#644](https://github.com/bigcommerce/catalyst/pull/644) [`a2ce3b5`](https://github.com/bigcommerce/catalyst/commit/a2ce3b5caf37dcd75cf449648ce3e5b795dc80f7) Thanks [@christensenep](https://github.com/christensenep)! - Use focus-visible instead of focus for focus-related styling

- [#628](https://github.com/bigcommerce/catalyst/pull/628) [`e35d947`](https://github.com/bigcommerce/catalyst/commit/e35d9472d8654847dc5f67ba175e00125c83fabd) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add mutations for reset password

- Updated dependencies [[`a2ce3b5`](https://github.com/bigcommerce/catalyst/commit/a2ce3b5caf37dcd75cf449648ce3e5b795dc80f7)]:
  - @bigcommerce/components@0.1.1
    All notable changes to this project will be documented in this file.
