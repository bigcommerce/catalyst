'use client';

import { RatingSearchFilterItem } from '@bigcommerce/catalyst-client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@bigcommerce/reactant/Accordion';
import { Button } from '@bigcommerce/reactant/Button';
import { Checkbox } from '@bigcommerce/reactant/Checkbox';
import { cs } from '@bigcommerce/reactant/cs';
import { Input } from '@bigcommerce/reactant/Input';
import { Label } from '@bigcommerce/reactant/Label';
import { Rating } from '@bigcommerce/reactant/Rating';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useRef } from 'react';

import { fetchCategory } from '../fetchCategory';

interface ProductCountProps {
  shouldDisplay: boolean;
  count: number;
}

const ProductCount = ({ shouldDisplay, count }: ProductCountProps) => {
  if (!shouldDisplay) {
    return null;
  }

  return (
    <span className="pl-3 text-gray-500">
      {count} <span className="sr-only">products</span>
    </span>
  );
};

const sortRatingsDescending = (a: RatingSearchFilterItem, b: RatingSearchFilterItem) => {
  return parseInt(b.value, 10) - parseInt(a.value, 10);
};

interface Props {
  facets: Awaited<ReturnType<typeof fetchCategory>>['facets'];
}

export const Facets = ({ facets }: Props) => {
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultOpenFacets = facets.items
    .filter((facet) => !facet.isCollapsedByDefault)
    .map((facet) => facet.name);

  const submitForm = () => {
    ref.current?.requestSubmit();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const sortParam = searchParams.get('sort');
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

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <Accordion defaultValue={defaultOpenFacets} type="multiple">
      <form onSubmit={handleSubmit} ref={ref}>
        {facets.items.map((facet) => {
          if (facet.__typename === 'BrandSearchFilter') {
            return (
              <AccordionItem key={facet.__typename} value={facet.name}>
                <AccordionTrigger>
                  <h3>{facet.name}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  {facet.brands.map((brand) => {
                    return (
                      <div
                        className="flex max-w-sm items-center py-2 pl-1"
                        key={`${brand.entityId}-${brand.isSelected.toString()}`}
                      >
                        <Checkbox
                          defaultChecked={brand.isSelected}
                          id={`${brand.name}-${brand.entityId}`}
                          name="brand"
                          onCheckedChange={submitForm}
                          value={brand.entityId}
                        />
                        <Label
                          className="cursor-pointer pl-3"
                          htmlFor={`${brand.name}-${brand.entityId}`}
                        >
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

          if (facet.__typename === 'ProductAttributeSearchFilter') {
            return (
              <AccordionItem key={`${facet.__typename}-${facet.filterName}`} value={facet.name}>
                <AccordionTrigger>
                  <h3>{facet.name}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  {facet.attributes.map((attribute) => (
                    <div
                      className="flex max-w-sm items-center py-2 pl-1"
                      key={`${facet.filterName}-${
                        attribute.value
                      }-${attribute.isSelected.toString()}`}
                    >
                      <Checkbox
                        defaultChecked={attribute.isSelected}
                        id={`${facet.filterName}-${attribute.value}`}
                        name={facet.filterName}
                        onCheckedChange={submitForm}
                        value={attribute.value}
                      />
                      <Label
                        className="cursor-pointer pl-3"
                        htmlFor={`${facet.filterName}-${attribute.value}`}
                      >
                        {attribute.value}
                        <ProductCount
                          count={attribute.productCount}
                          shouldDisplay={facet.displayProductCount}
                        />
                      </Label>
                    </div>
                  ))}
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
                      const search = new URLSearchParams(searchParams);

                      search.set('minRating', rating.value);

                      return (
                        <Link
                          className="flex flex-row flex-nowrap py-2"
                          href={{ search: `?${search.toString()}` }}
                          key={`${facet.name}-${rating.value}-${rating.isSelected.toString()}`}
                        >
                          <div
                            className={cs('flex flex-row flex-nowrap', {
                              'text-blue-primary': rating.isSelected,
                            })}
                          >
                            <Rating value={parseInt(rating.value, 10)} />
                          </div>
                          <span className="pl-2">
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
            return (
              <AccordionItem key={facet.__typename} value={facet.name}>
                <AccordionTrigger>
                  <h3>{facet.name}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  {facet.freeShipping && (
                    <div className="flex max-w-sm items-center py-2 pl-1">
                      <Checkbox
                        defaultChecked={facet.freeShipping.isSelected}
                        id="shipping-free_shipping"
                        name="shipping"
                        onCheckedChange={submitForm}
                        value="free_shipping"
                      />
                      <Label className="cursor-pointer pl-3" htmlFor="shipping-free_shipping">
                        Free shipping
                        <ProductCount
                          count={facet.freeShipping.productCount}
                          shouldDisplay={facet.displayProductCount}
                        />
                      </Label>
                    </div>
                  )}
                  {facet.isFeatured && (
                    <div className="flex max-w-sm items-center py-2 pl-1">
                      <Checkbox
                        defaultChecked={facet.isFeatured.isSelected}
                        id="isFeatured"
                        name="isFeatured"
                        onCheckedChange={submitForm}
                      />
                      <Label className="cursor-pointer pl-3" htmlFor="isFeatured">
                        Is featured
                        <ProductCount
                          count={facet.isFeatured.productCount}
                          shouldDisplay={facet.displayProductCount}
                        />
                      </Label>
                    </div>
                  )}
                  {facet.isInStock && (
                    <div className="flex max-w-sm items-center py-2 pl-1">
                      <Checkbox
                        defaultChecked={facet.isInStock.isSelected}
                        id="stock-in_stock"
                        name="stock"
                        onCheckedChange={submitForm}
                        value="in_stock"
                      />
                      <Label className="cursor-pointer pl-3" htmlFor="stock-in_stock">
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
