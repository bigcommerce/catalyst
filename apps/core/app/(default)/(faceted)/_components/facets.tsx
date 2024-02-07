'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@bigcommerce/components/Accordion';
import { Button } from '@bigcommerce/components/Button';
import { Checkbox } from '@bigcommerce/components/Checkbox';
import { Input } from '@bigcommerce/components/Input';
import { Label } from '@bigcommerce/components/Label';
import { Rating } from '@bigcommerce/components/Rating';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useRef } from 'react';

import { RatingSearchFilterItem } from '~/client/generated/graphql';
import { Link } from '~/components/link';
import { cn } from '~/lib/utils';

import type { Facet, PageType } from '../types';

interface ProductCountProps {
  shouldDisplay: boolean;
  count: number;
}

const ProductCount = ({ shouldDisplay, count }: ProductCountProps) => {
  if (!shouldDisplay) {
    return null;
  }

  return (
    <span className="ps-3 text-gray-500">
      {count} <span className="sr-only">products</span>
    </span>
  );
};

const sortRatingsDescending = (a: RatingSearchFilterItem, b: RatingSearchFilterItem) => {
  return parseInt(b.value, 10) - parseInt(a.value, 10);
};

export interface Props {
  facets: Facet[];
  pageType: PageType;
}

export const Facets = ({ facets, pageType }: Props) => {
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultOpenFacets = facets
    .filter((facet) => !facet.isCollapsedByDefault)
    .map((facet) => facet.name);

  const submitForm = () => {
    ref.current?.requestSubmit();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const sortParam = searchParams.get('sort');
    const searchParam = searchParams.get('term');
    const filteredSearchParams = Array.from(formData.entries())
      .filter((entry): entry is [string, string] => {
        return entry instanceof File === false;
      })
      .filter(([, value]) => value !== '');

    const newSearchParams = new URLSearchParams(filteredSearchParams);

    // We want to keep the sort param if it exists
    if (sortParam) {
      newSearchParams.append('sort', sortParam);
    }

    // We want to keep the search param if it exists
    if (searchParam) {
      newSearchParams.append('term', searchParam);
    }

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <Accordion defaultValue={defaultOpenFacets} type="multiple">
      <form onSubmit={handleSubmit} ref={ref}>
        {facets.map((facet) => {
          if (facet.__typename === 'BrandSearchFilter' && pageType !== 'brand') {
            return (
              <AccordionItem key={facet.__typename} value={facet.name}>
                <AccordionTrigger>
                  <h3>{facet.name}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  {facet.brands.map((brand) => {
                    const normalizedBrandName = brand.name.replace(/\s/g, '-').toLowerCase();
                    const id = `${normalizedBrandName}-${brand.entityId}`;
                    const labelId = `${normalizedBrandName}-${brand.entityId}-label`;

                    const key = `${brand.entityId}-${brand.isSelected.toString()}`;

                    return (
                      <div className="flex max-w-sm items-center py-2 ps-1" key={key}>
                        <Checkbox
                          aria-labelledby={labelId}
                          defaultChecked={brand.isSelected}
                          id={id}
                          name="brand"
                          onCheckedChange={submitForm}
                          value={brand.entityId}
                        />
                        <Label className="cursor-pointer ps-3" htmlFor={id} id={labelId}>
                          {brand.name}
                          <ProductCount
                            count={brand.productCount}
                            shouldDisplay={facet.displayProductCount}
                          />
                        </Label>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            );
          }

          if (facet.__typename === 'CategorySearchFilter' && pageType !== 'category') {
            return (
              <AccordionItem key={facet.__typename} value={facet.name}>
                <AccordionTrigger>
                  <h3>{facet.name}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  {facet.categories.map((category) => {
                    const normalizedCategoryName = category.name.replace(/\s/g, '-').toLowerCase();
                    const id = `${normalizedCategoryName}-${category.entityId}`;
                    const labelId = `${normalizedCategoryName}-${category.entityId}-label`;

                    const key = `${category.entityId}-${category.isSelected.toString()}`;

                    return (
                      <div className="flex max-w-sm items-center py-2 ps-1" key={key}>
                        <Checkbox
                          aria-labelledby={labelId}
                          defaultChecked={category.isSelected}
                          id={id}
                          name="category"
                          onCheckedChange={submitForm}
                          value={category.entityId}
                        />
                        <Label className="cursor-pointer ps-3" htmlFor={id} id={labelId}>
                          {category.name}
                          <ProductCount
                            count={category.productCount}
                            shouldDisplay={facet.displayProductCount}
                          />
                        </Label>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            );
          }

          if (facet.__typename === 'ProductAttributeSearchFilter') {
            return (
              <AccordionItem key={`${facet.__typename}-${facet.filterName}`} value={facet.name}>
                <AccordionTrigger>
                  <h3>{facet.name}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  {facet.attributes.map((attribute) => {
                    const normalizedFilterName = facet.filterName.replace(/\s/g, '-').toLowerCase();
                    const normalizedAttributeValue = attribute.value
                      .replace(/\s/g, '-')
                      .toLowerCase();
                    const id = `${normalizedFilterName}-${attribute.value}`;
                    const labelId = `${normalizedFilterName}-${normalizedAttributeValue}-label`;

                    const key = `${attribute.value}-${
                      attribute.value
                    }-${attribute.isSelected.toString()}`;

                    return (
                      <div className="flex max-w-sm items-center py-2 ps-1" key={key}>
                        <Checkbox
                          aria-labelledby={labelId}
                          defaultChecked={attribute.isSelected}
                          id={id}
                          name={`attr_${facet.filterName}`}
                          onCheckedChange={submitForm}
                          value={attribute.value}
                        />
                        <Label className="cursor-pointer ps-3" htmlFor={id} id={labelId}>
                          {attribute.value}
                          <ProductCount
                            count={attribute.productCount}
                            shouldDisplay={facet.displayProductCount}
                          />
                        </Label>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            );
          }

          if (facet.__typename === 'RatingSearchFilter') {
            return (
              <AccordionItem key={facet.__typename} value={facet.name}>
                <AccordionTrigger>
                  <h3>{facet.name}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  {facet.ratings
                    .filter((rating) => rating.value !== '5')
                    .sort(sortRatingsDescending)
                    .map((rating) => {
                      const key = `${facet.name}-${rating.value}-${rating.isSelected.toString()}`;

                      const search = new URLSearchParams(searchParams);

                      search.set('minRating', rating.value);

                      return (
                        <Link
                          className="flex flex-row flex-nowrap py-2"
                          href={{ search: `?${search.toString()}` }}
                          key={key}
                        >
                          <div
                            className={cn('flex flex-row flex-nowrap', {
                              'text-blue-primary': rating.isSelected,
                            })}
                          >
                            <Rating value={parseInt(rating.value, 10)} />
                          </div>
                          <span className="ps-2">
                            {/* TODO: singular vs. plural */}
                            <span className="sr-only">{rating.value} stars</span> & up
                          </span>
                          <ProductCount count={rating.productCount} shouldDisplay={true} />
                        </Link>
                      );
                    })}
                </AccordionContent>
              </AccordionItem>
            );
          }

          if (facet.__typename === 'PriceSearchFilter') {
            return (
              <AccordionItem key={facet.__typename} value={facet.name}>
                <AccordionTrigger>
                  <h3>{facet.name}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4 p-1">
                    <Input
                      aria-label="Minimum pricing"
                      defaultValue={facet.selected?.minPrice ?? ''}
                      name="minPrice"
                      placeholder="$ min"
                    />
                    <Input
                      aria-label="Maximum pricing"
                      defaultValue={facet.selected?.maxPrice ?? ''}
                      name="maxPrice"
                      placeholder="$ max"
                    />
                    <Button className="col-span-2" type="submit" variant="secondary">
                      Update price
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          }

          if (facet.__typename === 'OtherSearchFilter') {
            const key = `${facet.__typename}-${String(facet.isInStock?.isSelected)}-${String(
              facet.isFeatured?.isSelected,
            )}-${String(facet.freeShipping?.isSelected)}`;

            return (
              <AccordionItem key={key} value={facet.name}>
                <AccordionTrigger>
                  <h3>{facet.name}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  {facet.freeShipping && (
                    <div className="flex max-w-sm items-center py-2 ps-1">
                      <Checkbox
                        aria-labelledby="shipping-free_shipping-label"
                        defaultChecked={facet.freeShipping.isSelected}
                        id="shipping-free_shipping"
                        name="shipping"
                        onCheckedChange={submitForm}
                        value="free_shipping"
                      />
                      <Label
                        className="cursor-pointer ps-3"
                        htmlFor="shipping-free_shipping"
                        id="shipping-free_shipping-label"
                      >
                        Free shipping
                        <ProductCount
                          count={facet.freeShipping.productCount}
                          shouldDisplay={facet.displayProductCount}
                        />
                      </Label>
                    </div>
                  )}
                  {facet.isFeatured && (
                    <div className="flex max-w-sm items-center py-2 ps-1">
                      <Checkbox
                        aria-labelledby="isFeatured-label"
                        defaultChecked={facet.isFeatured.isSelected}
                        id="isFeatured"
                        name="isFeatured"
                        onCheckedChange={submitForm}
                      />
                      <Label
                        className="cursor-pointer ps-3"
                        htmlFor="isFeatured"
                        id="isFeatured-label"
                      >
                        Is featured
                        <ProductCount
                          count={facet.isFeatured.productCount}
                          shouldDisplay={facet.displayProductCount}
                        />
                      </Label>
                    </div>
                  )}
                  {facet.isInStock && (
                    <div className="flex max-w-sm items-center py-2 ps-1">
                      <Checkbox
                        aria-labelledby="stock-in_stock-label"
                        defaultChecked={facet.isInStock.isSelected}
                        id="stock-in_stock"
                        name="stock"
                        onCheckedChange={submitForm}
                        value="in_stock"
                      />
                      <Label
                        className="cursor-pointer ps-3"
                        htmlFor="stock-in_stock"
                        id="stock-in_stock-label"
                      >
                        In stock
                        <ProductCount
                          count={facet.isInStock.productCount}
                          shouldDisplay={facet.displayProductCount}
                        />
                      </Label>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          }

          return null;
        })}
      </form>
    </Accordion>
  );
};
