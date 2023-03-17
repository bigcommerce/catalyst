import Link from 'next/link';

import { Accordion } from '../../reactant/components/Accordion';
import { Check } from '../../reactant/icons/Check';
import { ChevronDownIcon } from '../../reactant/icons/ChevronDown';
import { ChevronUpIcon } from '../../reactant/icons/ChevronUp';

export interface Filters {
  edges: Array<{
    node: {
      __typename: string;
      name: string;
      isCollapsedByDefault: boolean;
      displayProductCount?: boolean;
      brands?: {
        edges: Array<{
          node: {
            entityId: number;
            name: string;
            isSelected: boolean;
            productCount: number;
          };
        }>;
      };
      freeShipping: {
        isSelected: boolean;
        productCount: number;
      } | null;
      isInStock: {
        isSelected: boolean;
        productCount: number;
      } | null;
      isFeatured: {
        isSelected: boolean;
        productCount: number;
      } | null;
    };
  }>;
}

export interface FacetsState {
  brandIds: string | null;
  isInStock: number | boolean;
  isFreeShipping: number | boolean;
  isFeatured: number | boolean;
}

interface FacetsProps {
  filters: Filters;
  pageFacets: FacetsState;
  pagePath: string;
}

const getFacetHref = (
  path: string,
  facetsState: FacetsState,
  facetType: keyof FacetsState,
  isSelected: boolean,
  facetId: number,
) => {
  const facetList = Object.keys(facetsState);
  const otherFacets = facetList.filter((facet): facet is keyof FacetsState => facet !== facetType);
  const inactiveFacetsPath = otherFacets.reduce((pathName: string, currFacet) => {
    return facetsState[currFacet]
      ? `${pathName}&${currFacet}=${(facetsState[currFacet] ?? '').toString()}`
      : `${pathName}`;
  }, '');
  let activeFacetPath;

  switch (facetType) {
    case 'brandIds': {
      const brands = facetsState[facetType] ? facetsState[facetType]?.split(',').map(Number) : [];

      const activeBrands =
        isSelected && facetId
          ? brands?.filter((id) => id !== facetId).toString()
          : [facetId, ...(brands || [])].toString();

      activeFacetPath =
        activeBrands && activeBrands.length > 0 ? `&${facetType}=${activeBrands}` : '';
      break;
    }

    default: {
      activeFacetPath = isSelected ? '' : `&${facetType}=${facetId}`;
    }
  }

  const href = `${path.slice(0, -1)}?${activeFacetPath}${inactiveFacetsPath}`;

  return href;
};

export const Facets = ({ filters, pagePath, pageFacets }: FacetsProps) => {
  return (
    <div className="flex flex-col gap-y-6">
      {/* TODO: add facets */}
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold">Refined By</p>
        <Link
          className="text-[#053FB0] hover:cursor-pointer hover:text-[#3071EF]"
          href={`${pagePath}`}
        >
          Clear all
        </Link>
      </div>
      {/* TODO: filters mapping goes here */}
      {filters.edges.map(({ node: filter }, index) => {
        //  NOTE: Brand Filter
        if (filter.__typename === 'BrandSearchFilter') {
          return (
            <Accordion
              className={Accordion.default.className}
              isExtended={filter.isCollapsedByDefault}
              key={index}
            >
              <Accordion.Toggle
                className={Accordion.Toggle.default.className}
                icons={[
                  <ChevronDownIcon
                    className="inline-block h-6 w-6 fill-black stroke-black"
                    key="onOpen"
                  />,
                  <ChevronUpIcon
                    className="inline-block h-6 w-6 fill-black stroke-black"
                    key="onClose"
                  />,
                ]}
                title={filter.name}
              />
              <Accordion.Content className={Accordion.Content.default.className}>
                {/* NOTE: BRANDS FILTER */}
                {filter.brands?.edges.map(({ node: brand }) => {
                  return (
                    <p className="inline-flex items-center gap-x-2" key={brand.entityId}>
                      <Link
                        className="inline-flex items-center gap-x-3"
                        href={getFacetHref(
                          pagePath,
                          pageFacets,
                          'brandIds',
                          brand.isSelected,
                          brand.entityId,
                        )}
                      >
                        {brand.isSelected ? (
                          <Check className="fill-white bg-[#053FB0]" />
                        ) : (
                          <span className="w-6 h-6 border-2 border-[#CFD8DC] bg-white" />
                        )}
                        <span className="text-base">{brand.name}</span>
                        <span className="text-[#546E7A]">{brand.productCount}</span>
                      </Link>
                    </p>
                  );
                })}
              </Accordion.Content>
            </Accordion>
          );
        }

        // NOTE: OTHER FILTER
        if (filter.__typename === 'OtherSearchFilter') {
          return (
            <Accordion
              className={Accordion.default.className}
              isExtended={filter.isCollapsedByDefault}
              key={index}
            >
              {/* TODO: ADD CONTENT */}
              <Accordion.Toggle
                className={Accordion.Toggle.default.className}
                icons={[
                  <ChevronDownIcon
                    className="inline-block h-6 w-6 fill-black stroke-black"
                    key="onOpen"
                  />,
                  <ChevronUpIcon
                    className="inline-block h-6 w-6 fill-black stroke-black"
                    key="onClose"
                  />,
                ]}
                title={filter.name}
              />
              <Accordion.Content className={Accordion.Content.default.className}>
                {filter.freeShipping && (
                  <p className="inline-flex items-center gap-x-2">
                    <Link
                      className="inline-flex items-center gap-x-3"
                      href={getFacetHref(
                        pagePath,
                        pageFacets,
                        'isFreeShipping',
                        filter.freeShipping.isSelected,
                        filter.freeShipping.productCount,
                      )}
                    >
                      {filter.freeShipping.isSelected ? (
                        <Check className="fill-white bg-[#053FB0]" />
                      ) : (
                        <span className="w-6 h-6 border-2 border-[#CFD8DC] bg-white" />
                      )}
                      <span className="text-base">Has Free Shipping</span>
                      <span className="text-[#546E7A]">{filter.freeShipping.productCount}</span>
                    </Link>
                  </p>
                )}
                {filter.isFeatured && (
                  <p className="inline-flex items-center gap-x-2">
                    <Link
                      className="inline-flex items-center gap-x-3"
                      href={getFacetHref(
                        pagePath,
                        pageFacets,
                        'isFeatured',
                        filter.isFeatured.isSelected,
                        filter.isFeatured.productCount,
                      )}
                    >
                      {filter.isFeatured.isSelected ? (
                        <Check className="fill-white bg-[#053FB0]" />
                      ) : (
                        <span className="w-6 h-6 border-2 border-[#CFD8DC] bg-white" />
                      )}
                      <span className="text-base">Featured</span>
                      <span className="text-[#546E7A]">{filter.isFeatured.productCount}</span>
                    </Link>
                  </p>
                )}
                {filter.isInStock && (
                  <p className="inline-flex items-center gap-x-2">
                    <Link
                      className="inline-flex items-center gap-x-3"
                      href={getFacetHref(
                        pagePath,
                        pageFacets,
                        'isInStock',
                        filter.isInStock.isSelected,
                        filter.isInStock.productCount,
                      )}
                    >
                      {filter.isInStock.isSelected ? (
                        <Check className="fill-white bg-[#053FB0]" />
                      ) : (
                        <span className="w-6 h-6 border-2 border-[#CFD8DC] bg-white" />
                      )}
                      <span className="text-base">In Stock</span>
                      <span className="text-[#546E7A]">{filter.isInStock.productCount}</span>
                    </Link>
                  </p>
                )}
              </Accordion.Content>
            </Accordion>
          );
        }

        return null;
      })}
    </div>
  );
};
