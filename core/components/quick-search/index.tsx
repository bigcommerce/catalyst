'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import debounce from 'lodash.debounce';
import { Search, X } from 'lucide-react';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import { getQuickSearchResults } from '~/client/queries/get-quick-search-results';
import { ExistingResultType } from '~/client/util';
import { Button } from '~/components/ui/button';
import { Field, FieldControl, Form } from '~/components/ui/form';
import { cn } from '~/lib/utils';

import { BcImage } from '../bc-image';
import { Pricing } from '../pricing';

import { getSearchResults } from './_actions/get-search-results';
import { SearchInput } from './search-input';

interface SearchProps extends PropsWithChildren {
  initialTerm?: string;
}

type SearchResults = ExistingResultType<typeof getQuickSearchResults>;

const isSearchQuery = (data: unknown): data is SearchResults => {
  if (typeof data === 'object' && data !== null && 'products' in data) {
    return true;
  }

  return false;
};

const fetchSearchResults = debounce(
  async (
    term: string,
    setSearchResults: React.Dispatch<React.SetStateAction<SearchResults | null>>,
  ) => {
    const { data: searchResults } = await getSearchResults(term);

    if (isSearchQuery(searchResults)) {
      setSearchResults(searchResults);
    }
  },
  1000,
);

export const QuickSearch = ({ children, initialTerm = '' }: SearchProps) => {
  const [term, setTerm] = useState(initialTerm);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (term.length < 3) {
      setSearchResults(null);
    } else {
      setPending(true);
      void fetchSearchResults(term, setSearchResults);
    }
  }, [term]);

  useEffect(() => {
    setPending(false);
  }, [searchResults]);

  const handleTermChange = (e: React.FormEvent<HTMLInputElement>) => {
    setTerm(e.currentTarget.value);
  };
  const handleTermClear = () => {
    setTerm('');
    inputRef.current?.focus();
  };

  return (
    <SheetPrimitive.Root onOpenChange={setOpen} open={open}>
      <SheetPrimitive.Trigger asChild>
        <Button
          aria-label="Open search popup"
          className="border-0 bg-transparent p-3 text-black hover:bg-transparent hover:text-primary focus-visible:text-primary"
        >
          <Search />
        </Button>
      </SheetPrimitive.Trigger>
      <SheetPrimitive.Overlay className="fixed inset-0 bg-transparent backdrop-blur-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <SheetPrimitive.Portal>
          <SheetPrimitive.Content
            className={cn(
              'fixed gap-4 overflow-auto bg-white p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out md:p-10',
              'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
              'flex min-h-[92px] flex-col px-4 py-4 data-[state=closed]:duration-0 data-[state=open]:duration-0 md:px-10 md:py-4 lg:px-12',
              searchResults && searchResults.products.length > 0 && 'h-full lg:h-3/4',
            )}
          >
            <h2 className="sr-only">Search bar</h2>
            <div className="grid grid-cols-5 items-center">
              <div className="me-2 hidden lg:block lg:justify-self-start">{children}</div>
              <Form
                action="/search"
                className="col-span-4 flex lg:col-span-3"
                method="get"
                role="search"
              >
                <Field className="w-full" name="term">
                  <FieldControl asChild required>
                    <SearchInput
                      aria-controls="categories products brands"
                      aria-expanded={!!searchResults}
                      onChange={handleTermChange}
                      onClickClear={handleTermClear}
                      pending={pending}
                      placeholder="Search..."
                      ref={inputRef}
                      role="combobox"
                      showClear={term.length > 0}
                      value={term}
                    />
                  </FieldControl>
                </Field>
              </Form>
              <SheetPrimitive.Close asChild>
                <Button
                  aria-label="Close search popup"
                  className="w-auto justify-self-end border-0 bg-transparent p-2.5 text-black hover:bg-transparent hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 peer-hover:text-primary peer-focus-visible:text-primary"
                >
                  <small className="me-2 hidden text-base md:inline-flex">Close</small>
                  <X />
                </Button>
              </SheetPrimitive.Close>
            </div>
            {searchResults && searchResults.products.length > 0 && (
              <div className="mt-8 grid overflow-auto px-1 lg:grid-cols-3 lg:gap-6">
                <section>
                  <h3 className="mb-6 border-b border-gray-200 pb-3 text-xl font-bold lg:text-2xl">
                    Categories
                  </h3>
                  <ul id="categories" role="listbox">
                    {Object.entries(
                      searchResults.products.reduce<Record<string, string>>(
                        (categories, product) => {
                          product.categories.edges?.forEach((category) => {
                            categories[category.node.name] = category.node.path;
                          });

                          return categories;
                        },
                        {},
                      ),
                    ).map(([name, path]) => {
                      return (
                        <li className="mb-3 last:mb-6" key={name}>
                          <a
                            className="align-items mb-6 flex gap-x-6 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                            href={path}
                          >
                            {name}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
                <section>
                  <h3 className="mb-6 border-b border-gray-200 pb-3 text-xl font-bold lg:text-2xl">
                    Products
                  </h3>
                  <ul id="products" role="listbox">
                    {searchResults.products.map((product) => {
                      return (
                        <li key={product.entityId}>
                          <a
                            className="align-items mb-6 flex gap-x-6 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                            href={product.path}
                          >
                            {product.defaultImage ? (
                              <BcImage
                                alt={product.defaultImage.altText}
                                className="self-start object-contain"
                                height={80}
                                src={product.defaultImage.url}
                                width={80}
                              />
                            ) : (
                              <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center bg-gray-200 text-lg font-bold text-gray-500">
                                Photo
                              </span>
                            )}

                            <span className="flex flex-col">
                              <p className="text-lg font-bold lg:text-2xl">{product.name}</p>
                              <Pricing data={product} />
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
                <section>
                  <h3 className="mb-6 border-b border-gray-200 pb-3 text-xl font-bold lg:text-2xl">
                    Brands
                  </h3>
                  <ul id="brands" role="listbox">
                    {Object.entries(
                      searchResults.products.reduce<Record<string, string>>((brands, product) => {
                        if (product.brand) {
                          brands[product.brand.name] = product.brand.path;
                        }

                        return brands;
                      }, {}),
                    ).map(([name, path]) => {
                      return (
                        <li className="mb-3 last:mb-6" key={name}>
                          <a
                            className="align-items mb-6 flex gap-x-6 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                            href={path}
                          >
                            {name}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </div>
            )}
            {searchResults && searchResults.products.length === 0 && (
              <p className="pt-6">
                No products matched with <b>"{term}"</b>
              </p>
            )}
          </SheetPrimitive.Content>
        </SheetPrimitive.Portal>
      </SheetPrimitive.Overlay>
    </SheetPrimitive.Root>
  );
};
