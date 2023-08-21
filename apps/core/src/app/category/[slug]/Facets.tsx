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

import { fetchCategory } from './fetchCategory';

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

interface Props {
  facets: Awaited<ReturnType<typeof fetchCategory>>['facets'];
}

export const Facets = ({ facets }: Props) => {
  const defaultOpenFacets = facets.items
    .filter((facet) => !facet.isCollapsedByDefault)
    .map((facet) => facet.name);

  return (
    <Accordion defaultValue={defaultOpenFacets} type="multiple">
      {facets.items.map((facet) => {
        if (facet.__typename === 'BrandSearchFilter') {
          return (
            <AccordionItem key={facet.__typename} value={facet.name}>
              <AccordionTrigger>
                <h3>{facet.name}</h3>
              </AccordionTrigger>
              <AccordionContent>
                {facet.brands.map((brand) => (
                  <div className="flex max-w-sm items-center py-2 pl-1" key={brand.entityId}>
                    <Checkbox
                      defaultChecked={brand.isSelected}
                      id={`${brand.name}-${brand.entityId}`}
                      name="brand"
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
                ))}
              </AccordionContent>
            </AccordionItem>
          );
        }

        if (facet.__typename === 'ProductAttributeSearchFilter') {
          return (
            <AccordionItem key={facet.__typename} value={facet.name}>
              <AccordionTrigger>
                <h3>{facet.name}</h3>
              </AccordionTrigger>
              <AccordionContent>
                {facet.attributes.map((attribute) => (
                  <div className="flex max-w-sm items-center py-2 pl-1" key={attribute.value}>
                    <Checkbox
                      defaultChecked={attribute.isSelected}
                      id={`${facet.filterName}-${attribute.value}`}
                      name={facet.filterName}
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
                  .reverse()
                  .filter((rating) => rating.value !== '5')
                  .map((rating) => (
                    <div className="flex flex-row flex-nowrap py-2" key={rating.value}>
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
                    </div>
                  ))}
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
                    placeholder="$ min"
                  />
                  <Input
                    aria-label="Maximum pricing"
                    defaultValue={facet.selected?.maxPrice ?? ''}
                    placeholder="$ max"
                  />
                  <Button className="col-span-2">Update price</Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        }

        return null;
      })}
    </Accordion>
  );
};
