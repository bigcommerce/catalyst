import { gql } from '@apollo/client';
import debounce from 'lodash.debounce';
import React, {
  Dispatch,
  FormEvent,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button as ReactantButton } from '../../reactant/components/Button';
import { FormGroup, Input } from '../../reactant/components/Input';
import { SearchIcon } from '../../reactant/icons/Search';
import { getBrowserClient } from '../graphql/browser';

import { ProductTiles, ProductTilesConnection } from './ProductTiles';

interface SearchQuery {
  site: {
    search: {
      searchProducts: {
        products: ProductTilesConnection;
      };
    };
  };
}

const searchQuery = gql`
  query SearchTest($searchTerm: String!) {
    site {
      search {
        searchProducts(filters: { searchTerm: $searchTerm }) {
          products(first: 10) {
            edges {
              node {
                entityId
                name
                path
                defaultImage {
                  url(width: 300, height: 300)
                  altText
                }
                prices {
                  price {
                    formatted
                  }
                }
                productOptions(first: 3) {
                  edges {
                    node {
                      entityId
                      displayName
                      isRequired
                      __typename
                      ... on MultipleChoiceOption {
                        displayStyle
                        values(first: 5) {
                          edges {
                            node {
                              entityId
                              isDefault
                              ... on SwatchOptionValue {
                                hexColors
                                imageUrl(width: 200)
                                isSelected
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

interface ClassName {
  className: string;
}

type ComponentProps<Props, VariantKey extends string> = React.FC<Props> &
  Record<VariantKey, ClassName>;

type PProps = React.HTMLAttributes<HTMLParagraphElement> & PropsWithChildren;
type P = ComponentProps<PProps, 'default'>;

const P: P = ({ children, ...props }) => {
  return <p {...props}>{children}</p>;
};

P.default = {
  className: 'leading-7 text-base ',
};

const isObjWithField = (obj: unknown, field: string): obj is { [field: string]: unknown } => {
  if (typeof obj === 'object' && obj !== null && field in obj) {
    return true;
  }

  return false;
};

const isSearchQuery = (data: unknown): data is SearchQuery => {
  if (
    isObjWithField(data, 'site') &&
    isObjWithField(data.site, 'search') &&
    isObjWithField(data.site.search, 'searchProducts') &&
    isObjWithField(data.site.search.searchProducts, 'products')
  ) {
    return true;
  }

  return false;
};

const getSearchResults = async (
  setSearchResults: Dispatch<SetStateAction<SearchQuery | null>>,
  searchTerm: string,
) => {
  const client = getBrowserClient();
  const data = await client.query({ query: searchQuery, variables: { searchTerm } });

  if (isSearchQuery(data)) {
    setSearchResults(data);
  }
};

const debouncedGetSearchResults = debounce(getSearchResults, 1000);

export const Search = ({ Button = ReactantButton, Icon = SearchIcon }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchQuery | null>(null);
  const searchField = useRef<HTMLDivElement>(null);

  const handleChange = (
    event: FormEvent<HTMLInputElement> & {
      target: HTMLInputElement;
    },
  ) => {
    const { value } = event.target;

    setSearchTerm(value);
  };

  useEffect(() => {
    if (searchTerm.length === 0) {
      setSearchResults(null);

      return;
    }

    setLoading(true);
    void debouncedGetSearchResults(setSearchResults, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (open === false) {
      return;
    }

    const handleClickOutside = ({ target }: MouseEvent) => {
      if (target instanceof HTMLElement) {
        if (searchField.current && !searchField.current.contains(target)) {
          setOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    setLoading(false);
  }, [searchResults]);

  return (
    <div className={Search.container.className} ref={searchField}>
      {open && (
        <>
          <FormGroup>
            <Input
              className={`${Input.default.className} [&_input]:!w-72`}
              id="search"
              name="search"
              onChange={handleChange}
              placeholder="Search..."
              type="search"
              value={searchTerm}
            >
              <Icon
                className={`${Input.Icon.default.className} ${Input.Icon.position.className}`}
              />
            </Input>
          </FormGroup>
          {loading ? <P className={P.default.className}>loading...</P> : null}
          {searchResults && loading === false ? (
            <div className={Search.list.className}>
              <ProductTiles
                productComparisonsEnabled
                products={searchResults.site.search.searchProducts.products}
                title={`Search Results for "${searchTerm}"`}
              />
            </div>
          ) : null}
        </>
      )}
      {!open && (
        <Button className={Button.iconOnly.className} onClick={() => setOpen(true)}>
          <Icon className="fill-none stroke-[#000] group-hover/input-wrapper:stroke-[#053FB0]" />
        </Button>
      )}
    </div>
  );
};

Search.container = {
  className: 'relative',
};

Search.list = {
  className:
    'absolute right-0 top-100% p-6 z-10 mt-3 shadow-lg bg-[#fff] md:container !w-screen max-h-[75vh] overflow-auto',
};

Search.listItem = {
  className: 'border-1 border-[#053FB0] py-2',
};
