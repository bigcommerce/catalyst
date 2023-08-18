import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@bigcommerce/reactant/Accordion';
import { Checkbox } from '@bigcommerce/reactant/Checkbox';
import { Label } from '@bigcommerce/reactant/Label';

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

        return null;
      })}
    </Accordion>
  );
};
